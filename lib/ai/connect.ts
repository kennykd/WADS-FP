import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { createWriteStream } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { toJSONSchema } from "zod";
import { aiResponseSchema } from "../validation/ai";

// client gets the API key from the environment variable GEMINI_API_KEY
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

const FILE_POLL_INTERVAL_MS = 5000;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

function sanitizeFileStem(value: string): string {
  return value
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "document";
};

function extractFileNameFromHeaders(headers: Headers): string | null {
  const disposition = headers.get("content-disposition");
  if (!disposition) return null;

  const match = disposition.match(/filename="?(.+?)"?$/);
  return match ? match[1] : null;
};

function generateDefaultName(): string {
  return `document-${Date.now()}.pdf`;
};

async function downloadPdfToTempFile(url: string, displayName: string): Promise<{ filePath: string; cleanup: () => Promise<void> }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download PDF from URL. Status: ${response.status}`);
  }

  const tempDir = await mkdtemp(join(tmpdir(), "gemini-pdf-"));

  // Filename resolution
  let sourceName: string | null = null;

  // Try to extract filename from Content-Disposition header
  sourceName = extractFileNameFromHeaders(response.headers);

  // Fallback to URL basename
  if (!sourceName) {
    const urlName = basename(new URL(url).pathname);
    if (urlName && urlName.includes(".")) {
      sourceName = urlName;
    }
  }

  // Final fallback, by generating a name based on displayName and timestamp
  if (!sourceName) {
    sourceName = `${sanitizeFileStem(displayName)}-${generateDefaultName()}`;
  }

  const stem = sanitizeFileStem(sourceName).replace(/\.pdf$/i, "");
  const filePath = join(tempDir, `${stem}.pdf`);

  if (response.body) {
    await pipeline(
      Readable.fromWeb(response.body as unknown as NodeReadableStream),
      createWriteStream(filePath)
    );
  } else {
    const data = new Uint8Array(await response.arrayBuffer());
    await writeFile(filePath, data);
  }

  return {
    filePath,
    cleanup: async () => {
      await rm(tempDir, { recursive: true, force: true });
    },
  }
};

async function uploadRemotePDF(source: string, displayName: string) {
  let filePath = source;
  let cleanup: (() => Promise<void>) | null = null;

  if (isHttpUrl(source)) {
    const tempFile = await downloadPdfToTempFile(source, displayName);
    filePath = tempFile.filePath;
    cleanup = tempFile.cleanup;
  }

  try {
    // uploadFile uploads with a local file path, then poll until processing completes.
    const uploadedFile = await ai.files.upload({
      file: filePath,
      config: {
        displayName,
        mimeType: "application/pdf",
      },
    });
    if (!uploadedFile.name) {
      throw new Error("File upload did not return a file name.");
    }

    let processedFile = await ai.files.get({ name: uploadedFile.name });
    while (processedFile.state === "PROCESSING") {
      await sleep(FILE_POLL_INTERVAL_MS);
      processedFile = await ai.files.get({ name: uploadedFile.name });
    }

    if (processedFile.state === "FAILED") {
      throw new Error("File processing failed.");
    }

    return processedFile;
  } finally {
    if (cleanup) {
      await cleanup();
    }
  }
};



export async function aiRecommend(context: string, attachments?: string[]) {
  const promptParts: Array<
    { text: string } |
    { fileData: { mimeType: string; fileUri: string } }
  > = [
    {
      text: [
        "Use the user context and all attached PDF documents together as one prompt.",
        "User context:",
        context,
      ].join("\n\n"),
    },
  ];

  if (attachments?.length) {
    const uploadedPdfs = await Promise.all(
      attachments.map((source, index) =>
        uploadRemotePDF(source, `reference-document-${index + 1}`)
      )
    );

    for (const uploadedPdf of uploadedPdfs) {
      if (!uploadedPdf.uri) {
        throw new Error("Uploaded PDF does not have a URI.");
      }

      promptParts.push({
        fileData: {
          mimeType: "application/pdf",
          fileUri: uploadedPdf.uri,
        }
      });
    }
  }

  const contents = [
    {
      role: "user",
      parts: promptParts,
    },
  ];

  // config defines the parameters for the model's response that allows the model to be tailored in order to better suit the user's needs and preferences
  const config = {
    // thinkingConfig controls the level of reasoning and creativity in the model's response
    thinkingConfig: {
      thinkingLevel: ThinkingLevel.LOW,
    },
    // systemInstruction provide additional context to the model to guide its response
    systemInstruction: "You are a helpful assistant that arranges schedules and manages tasks and study sessions for the user. Take into account the user's preferences and constraints when generating recommendations, and manage their workload effectively. Ensure that the user does not exceed their capacity and maintains a healthy work-life balance. Use the provided context and tools to generate your response.",
    // tools allow the model to access external information or perform actions, which can enhance its response
    tools: [
      { googleSearch: {} },
      { urlContext: {} },
    ],
    responseMimeType: "application/json",
    responseJsonSchema: toJSONSchema(aiResponseSchema),
  };

  // response generates the content made by the model
  const response = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: contents,
    config: config,
  });

  console.log(response);
  return response;
}