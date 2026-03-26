import { NextResponse } from "next/server";
import { getFileUrl, deleteFile } from "@/lib/bucket";

export async function DELETE(req) {
  try {
    const formData = await req.formData();
    const fileName = formData.get("fileName"); // Has to match with frontend form field name

    if (!fileName) {
      return NextResponse.json({ error: "No file name provided" }, { status: 400 });
    }

    // Delete the file from the storage bucket
    await deleteFile(fileName);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}