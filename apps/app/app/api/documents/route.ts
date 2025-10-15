import { NextResponse } from "next/server";
import { database } from "@repo/database";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const periodId = searchParams.get("periodId");

    if (!periodId) {
      return NextResponse.json({ error: "Period ID required" }, { status: 400 });
    }

    // Get user's firm
    const user = await database.user.findUnique({
      where: { id: userId },
      select: { firmId: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify user has access to this period
    const period = await database.period.findUnique({
      where: { id: periodId },
      include: {
        client: {
          select: { firmId: true },
        },
      },
    });

    if (!period) {
      return NextResponse.json({ error: "Period not found" }, { status: 404 });
    }

    const hasAccess = 
      user.firmId === period.client.firmId || 
      (user.role === "CLIENT" && period.clientId === userId);

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get documents for this period
    const documents = await database.document.findMany({
      where: { periodId },
      include: {
        uploadedByUser: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform to match frontend types
    const transformedDocuments = documents.map((doc) => ({
      id: doc.id,
      firmId: doc.firmId,
      clientId: doc.clientId,
      periodId: doc.periodId,
      periodRequestId: doc.documentRequestId,
      fileKey: doc.storagePath,
      filename: doc.fileName,
      byteSize: doc.fileSize,
      contentType: doc.fileType,
      version: 1,
      uploadedBy: doc.uploadedByUserId,
      uploadedAt: doc.createdAt.toISOString(),
      virusStatus: "clean" as const,
      ocrStatus: "done" as const,
      tags: [],
      status: "clean" as const,
      uploaderName: doc.uploadedByUser.name,
    }));

    return NextResponse.json(transformedDocuments);
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId, requestId } = await req.json();

    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    // Get user's firm
    const user = await database.user.findUnique({
      where: { id: userId },
      select: { firmId: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify user has access to this document
    const document = await database.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (user.firmId !== document.firmId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Update the document request assignment
    await database.document.update({
      where: { id: documentId },
      data: {
        documentRequestId: requestId || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to assign document:", error);
    return NextResponse.json(
      { error: "Failed to assign document" },
      { status: 500 }
    );
  }
}