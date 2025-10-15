import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../../../lib/r2";
import { database } from "@repo/database";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const periodId = formData.get("periodId") as string;
    const documentRequestId = formData.get("documentRequestId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storagePath = `documents/${userId}/${Date.now()}_${file.name}`;

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: storagePath,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const user = await database.user.findUnique({
      where: { id: userId },
      select: { firmId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const document = await database.document.create({
      data: {
        firmId: user.firmId,
        clientId: userId,
        periodId,
        documentRequestId,
        uploadedByUserId: userId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        storagePath,
      },
    });

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      document,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
