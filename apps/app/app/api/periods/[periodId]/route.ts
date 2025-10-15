import { NextResponse } from "next/server";
import { database } from "@repo/database";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  req: Request,
  { params }: { params: { periodId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { periodId } = params;

    // Get user's firm
    const user = await database.user.findUnique({
      where: { id: userId },
      select: { firmId: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get period with all related data
    const period = await database.period.findUnique({
      where: { id: periodId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            firmId: true,
          },
        },
        documentRequests: {
          orderBy: { createdAt: "asc" },
        },
        documents: {
          include: {
            uploadedByUser: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!period) {
      return NextResponse.json({ error: "Period not found" }, { status: 404 });
    }

    // Check if user has access to this period
    const hasAccess = 
      user.firmId === period.client.firmId || 
      (user.role === "CLIENT" && period.clientId === userId);

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Transform data to match frontend types
    const transformedPeriod = {
      id: period.id,
      clientId: period.clientId,
      year: period.year,
      month: period.month,
      status: period.status.toLowerCase(),
      dueDate: period.dueDate?.toISOString(),
    };

    const transformedClient = {
      id: period.client.id,
      firmId: period.client.firmId,
      name: period.client.name,
      status: "active" as const,
    };

    const transformedRequests = period.documentRequests.map((req, index) => ({
      id: req.id,
      periodId: req.periodId,
      title: req.title,
      category: req.description || undefined,
      required: true,
      sortOrder: index,
      status: req.status.toLowerCase() as "pending" | "received" | "approved",
    }));

    const transformedDocuments = period.documents.map((doc) => ({
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

    return NextResponse.json({
      client: transformedClient,
      period: transformedPeriod,
      requests: transformedRequests,
      documents: transformedDocuments,
      link: { expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
      limits: { maxFileSize: 50 * 1024 * 1024, allowedTypes: ["application/pdf", "image/*"] },
    });
  } catch (error) {
    console.error("Failed to fetch period details:", error);
    return NextResponse.json(
      { error: "Failed to fetch period details" },
      { status: 500 }
    );
  }
}