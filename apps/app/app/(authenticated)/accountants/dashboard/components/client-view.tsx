"use client";

import { useMemo, useState } from "react";
import { ClientList } from "./client-list";
import { ClientDocumentPortal } from "./client-document-portal";
import type { Client } from "../data";

type ClientViewProps = {
  clients: Client[];
};

export function ClientView({ clients }: ClientViewProps) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    clients[0]?.id || null
  );

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId),
    [clients, selectedClientId]
  );

  return (
    <div className="flex w-full h-screen bg-background">
      <ClientList
        clients={clients}
        selectedClientId={selectedClientId}
        onSelectClient={setSelectedClientId}
      />

      <main className="flex-1 p-6 overflow-y-auto bg-background">
        {selectedClient ? (
          <ClientDocumentPortal
            key={selectedClient.id}
            client={selectedClient}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-lg">
              Select a client to view their documents.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
