"use client";

import * as React from "react";
import { listPeriods } from "@/lib/api";
import { Badge } from "@repo/design-system/components/ui/badge";
import Link from "next/link";

export default function ClientsDashboardPage() {
  const [periods, setPeriods] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listPeriods();
        setPeriods(data || []);
      } catch (err) {
        console.error("Failed to fetch periods:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Client Periods</h1>
        <p className="text-sm text-muted-foreground">
          Select a period to view and manage uploaded documents.
        </p>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <table className="w-full table-fixed">
          <thead className="bg-muted/50 text-gray-700">
            <tr className="text-sm">
              <th className="p-3 text-left w-[25%]">Client</th>
              <th className="p-3 text-left w-[20%]">Period</th>
              <th className="p-3 text-left w-[15%]">Requests</th>
              <th className="p-3 text-left w-[15%]">Docs</th>
              <th className="p-3 text-left w-[15%]">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={5}>
                  Loading periods…
                </td>
              </tr>
            ) : periods.length === 0 ? (
              <tr>
                <td
                  className="p-4 text-muted-foreground text-center"
                  colSpan={5}
                >
                  No periods found.
                </td>
              </tr>
            ) : (
              periods.map((p) => (
                <tr
                  key={p.id}
                  className="border-t text-sm hover:bg-muted/40 transition-colors"
                >
                  <td className="p-3 font-medium text-gray-800">
                    {p.clientName}
                  </td>

                  <td className="p-3">
                    <Link
                      href={`/clients/${p.clientId}/periods/${p.id}`}
                      className="underline text-blue-600 hover:text-blue-800"
                    >
                      {p.year}-{String(p.month).padStart(2, "0")}
                    </Link>
                  </td>

                  <td className="p-3 text-gray-600">
                    {p.received}/{p.required}
                  </td>

                  <td className="p-3 text-gray-600">{p.docs}</td>

                  <td className="p-3">
                    <Badge
                      variant={
                        p.status === "open"
                          ? "secondary"
                          : p.status === "in_review"
                          ? "outline"
                          : "default"
                      }
                    >
                      {p.status.replace("_", " ")}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
