"use client";

import { useMemo, useState } from "react";
import { mockAccountantData, type Client } from "./data";
import { ClientList } from "./components/client-list";
import { ClientDocumentPortal } from "./components/client-document-portal";

export default function AccountantDashboardPage() {
  const clientsData: Client[] = mockAccountantData;

  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    clientsData[0]?.id || null
  );

  const selectedClient = useMemo(
    () => clientsData.find((c) => c.id === selectedClientId),
    [clientsData, selectedClientId]
  );

  return (
    <div className="flex w-full h-screen bg-background">
      <ClientList
        clients={clientsData}
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
