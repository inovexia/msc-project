"use client";

import React, { useMemo, useState } from "react";
import { Input } from "@repo/design-system/components/ui/input";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { cn } from "@repo/design-system/lib/utils";
import { Search } from "lucide-react";
import type { Client } from "../data";

// Defining the component's props with TypeScript.
// This is the "contract" the component expects from its parent.
type ClientListProps = {
  clients: Client[];
  selectedClientId: string | null;
  // This type correctly defines a state-setting function from the useState hook.
  onSelectClient: React.Dispatch<React.SetStateAction<string | null>>;
};

export function ClientList({
  clients,
  selectedClientId,
  onSelectClient,
}: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = useMemo(
    () =>
      clients.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [clients, searchTerm]
  );

  const getClientStatus = (
    client: Client
  ): { text: string; variant: "default" | "warning" | "success" } => {
    const reviewCount = client.documents.filter(
      (d) => d.status === "needs_review"
    ).length;
    if (reviewCount > 0)
      return { text: `${reviewCount} needs review`, variant: "warning" };

    const pendingCount = client.documents.filter(
      (d) => d.status === "pending" || d.status === "rejected"
    ).length;
    if (pendingCount > 0)
      return { text: `${pendingCount} pending`, variant: "default" };

    return { text: "All docs approved", variant: "success" };
  };

  return (
    <aside className="w-80 border-r border-border bg-background flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3">Clients</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-2 space-y-2">
        {filteredClients.map((client) => {
          const status = getClientStatus(client);
          return (
            <Button
              key={client.id}
              variant={selectedClientId === client.id ? "secondary" : "ghost"}
              onClick={() => onSelectClient(client.id)}
              className={cn(
                "w-full h-auto text-left p-4 flex flex-col items-start justify-start gap-1",
                selectedClientId === client.id &&
                  "bg-accent border border-border"
              )}
            >
              <p className="font-semibold text-foreground">{client.name}</p>
              <p className="text-sm text-muted-foreground">
                {client.companyName}
              </p>
              <p
                className={cn(
                  "text-xs font-medium",
                  status.variant === "warning" &&
                    "text-orange-600 dark:text-orange-400",
                  status.variant === "success" &&
                    "text-emerald-600 dark:text-emerald-400",
                  status.variant === "default" && "text-muted-foreground"
                )}
              >
                {status.text}
              </p>
            </Button>
          );
        })}
      </div>
    </aside>
  );
}
