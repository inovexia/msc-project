import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../../../../../lib/r2";
import { database } from "@repo/database";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find the document in the database
    const document = await database.document.findUnique({
      where: { id },
      include: {
        firm: true,
        client: true,
        period: true,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Check if user has access to this document
    const user = await database.user.findUnique({
      where: { id: userId },
      select: { firmId: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify access permissions
    const hasAccess = 
      user.firmId === document.firmId || // Same firm
      (user.role === "CLIENT" && document.clientId === userId); // Client owns the document

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if R2 is properly configured
    if (!process.env.R2_ENDPOINT || !process.env.R2_BUCKET_NAME) {
      return NextResponse.json(
        { error: "File storage is not configured" },
        { status: 503 }
      );
    }

    try {
      // Retrieve file from R2 storage
      const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: document.storagePath,
      });

      const response = await r2.send(command);
      
      if (!response.Body) {
        return NextResponse.json({ error: "File not found in storage" }, { status: 404 });
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      const reader = response.Body.transformToWebStream().getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      const buffer = Buffer.concat(chunks);

      // Return file with appropriate headers
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": document.fileType || "application/octet-stream",
          "Content-Length": buffer.length.toString(),
          "Content-Disposition": `inline; filename="${document.fileName}"`,
          "Cache-Control": "private, max-age=3600",
        },
      });
    } catch (storageError: any) {
      console.error("R2 storage error:", storageError);
      
      // Handle specific R2/S3 errors
      if (storageError.name === "NoSuchKey") {
        return NextResponse.json({ error: "File not found in storage" }, { status: 404 });
      }
      
      if (storageError.message?.includes("getaddrinfo ENOTFOUND")) {
        return NextResponse.json(
          { error: "Storage service unavailable. Please check R2 configuration." },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to retrieve file from storage" },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("File view error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve file" }, 
      { status: 500 }
    );
  }
}
