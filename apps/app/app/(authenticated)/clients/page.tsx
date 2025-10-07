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
      setLoading(true);
      const p = await listPeriods();
      setPeriods(p);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Periods</h1>
      </div>
      <div className="rounded-md border">
        <table className="w-full table-fixed">
          <thead className="bg-muted/50">
            <tr className="text-sm">
              <th className="p-2 text-left w-[28%]">Client</th>
              <th className="p-2 text-left w-[18%]">Period</th>
              <th className="p-2 text-left w-[18%]">Requests</th>
              <th className="p-2 text-left w-[18%]">Docs</th>
              <th className="p-2 text-left w-[18%]">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4" colSpan={5}>
                  Loading…
                </td>
              </tr>
            ) : periods.length === 0 ? (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={5}>
                  No data
                </td>
              </tr>
            ) : (
              periods.map((p) => (
                <tr key={p.id} className="border-t text-sm hover:bg-muted/50">
                  <td className="p-2">{p.clientName}</td>
                  <td className="p-2">
                    <Link
                      href={`/clients/${p.clientId}/periods/${p.year}-${String(
                        p.month
                      ).padStart(2, "0")}`}
                      className="underline"
                    >
                      {p.year}-{String(p.month).padStart(2, "0")}
                    </Link>
                  </td>
                  <td className="p-2">
                    {p.received}/{p.required}
                  </td>
                  <td className="p-2">{p.docs}</td>
                  <td className="p-2">
                    <Badge
                      variant={p.status === "open" ? "secondary" : "default"}
                    >
                      {p.status}
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
