import { NextResponse } from "next/server";
import { database } from "@repo/database";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's firm
    const user = await database.user.findUnique({
      where: { id: userId },
      select: { firmId: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all periods for the user's firm with related data
    const periods = await database.period.findMany({
      where: {
        client: {
          firmId: user.firmId,
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        documentRequests: {
          select: {
            id: true,
            status: true,
          },
        },
        documents: {
          select: {
            id: true,
          },
        },
      },
      orderBy: [
        { year: "desc" },
        { month: "desc" },
      ],
    });

    // Transform data to match frontend expectations
    const transformedPeriods = periods.map((period) => {
      const totalRequests = period.documentRequests.length;
      const submittedRequests = period.documentRequests.filter(
        (req) => req.status === "SUBMITTED" || req.status === "APPROVED"
      ).length;

      return {
        id: period.id,
        clientId: period.clientId,
        clientName: period.client.name,
        year: period.year,
        month: period.month,
        status: period.status.toLowerCase(),
        required: totalRequests,
        received: submittedRequests,
        docs: period.documents.length,
        dueDate: period.dueDate,
        createdAt: period.createdAt,
      };
    });

    return NextResponse.json(transformedPeriods);
  } catch (error) {
    console.error("Failed to fetch periods:", error);
    return NextResponse.json(
      { error: "Failed to fetch periods" },
      { status: 500 }
    );
  }
}