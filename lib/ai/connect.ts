import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { toJSONSchema } from "zod";
import { aiResponseSchema } from "../validation/ai";

// client gets the API key from the environment variable GEMINI_API_KEY
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

export async function aiRecommend(context: string) {
  // contents are the input data received from the user, which the model will use to generate a response
  const contents = [
    { text: context },
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
  }

  // response generates the content made by the model
  const response = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: contents,
    config: config,
  });

  console.log(response);
  return response;
}

// Example usage
// aiRecommend("What is the capital of France?");