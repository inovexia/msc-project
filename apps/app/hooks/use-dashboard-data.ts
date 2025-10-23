"use client";

import { useState, useEffect } from "react";
import { listPeriods, listDocuments, getPeriodDetails } from "@/lib/api";
import {
  adaptClient,
  adaptDocument,
  getDashboardStats,
  calculatePeriodCompletion,
} from "@/lib/dashboard-adapter";
import type { Client as DashboardClient } from "@/app/(authenticated)/accountants/dashboard/data";
import type {
  Document as ApiDocument,
  Period,
  PeriodRequest,
  Client,
} from "@/lib/types";

export interface DashboardData {
  clients: DashboardClient[];
  loading: boolean;
  error: string | null;
  stats: {
    totalDocuments: number;
    needsReview: number;
    processing: number;
    approved: number;
    thisWeek: number;
    unassignedCount: number;
    requestsPending: number;
    requestsReceived: number;
  };
  periods: Array<{
    period: Period;
    client: Client;
    completion: ReturnType<typeof calculatePeriodCompletion>;
  }>;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and adapt real period/document data for the dashboard
 */
export function useDashboardData(): DashboardData {
  const [clients, setClients] = useState<DashboardClient[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    needsReview: 0,
    processing: 0,
    approved: 0,
    thisWeek: 0,
    unassignedCount: 0,
    requestsPending: 0,
    requestsReceived: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all periods (this includes client info)
      const periodsData = await listPeriods();

      if (!periodsData || periodsData.length === 0) {
        setClients([]);
        setPeriods([]);
        setLoading(false);
        return;
      }

      // Group periods by client
      const clientMap = new Map<string, any>();
      const allDocuments: ApiDocument[] = [];
      const allRequests: PeriodRequest[] = [];
      const periodDetails: any[] = [];

      // Fetch details for each period
      await Promise.all(
        periodsData.map(async (periodSummary) => {
          try {
            const details = await getPeriodDetails(periodSummary.id);

            // Collect all documents and requests
            allDocuments.push(...details.documents);
            allRequests.push(...details.requests);

            // Build client map
            if (!clientMap.has(details.client.id)) {
              clientMap.set(details.client.id, {
                ...details.client,
                periods: [],
              });
            }
            clientMap.get(details.client.id)!.periods.push(details.period);

            // Calculate period completion
            const completion = calculatePeriodCompletion(
              details.period,
              details.requests,
              details.documents
            );

            periodDetails.push({
              period: details.period,
              client: details.client,
              completion,
            });
          } catch (err) {
            console.error(`Failed to fetch period ${periodSummary.id}:`, err);
          }
        })
      );

      // Convert to dashboard clients format
      const dashboardClients = Array.from(clientMap.values()).map((client) =>
        adaptClient(client, client.periods, allDocuments, allRequests)
      );

      // Calculate dashboard stats
      const dashboardStats = getDashboardStats(allDocuments, allRequests);

      setClients(dashboardClients);
      setPeriods(periodDetails);
      setStats(dashboardStats);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    clients,
    loading,
    error,
    stats,
    periods,
    refresh: fetchData,
  };
}

/**
 * Hook to fetch documents with real-time updates
 */
export function useDocumentUpdates(periodId: string | null) {
  const [documents, setDocuments] = useState<ApiDocument[]>([]);

  useEffect(() => {
    if (!periodId) return;

    // Initial fetch
    listDocuments(periodId).then(setDocuments).catch(console.error);

    // Poll for updates every 2 seconds
    const interval = setInterval(async () => {
      try {
        const docs = await listDocuments(periodId);
        setDocuments(docs);
      } catch (err) {
        console.error("Failed to fetch documents:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [periodId]);

  return documents;
}
