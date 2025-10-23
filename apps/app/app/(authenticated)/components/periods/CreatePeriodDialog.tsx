"use client";

import * as React from "react";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/design-system/components/ui/dialog";
import { Label } from "@repo/design-system/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { Input } from "@repo/design-system/components/ui/input";
import { Calendar, Plus } from "lucide-react";

type CreatePeriodDialogProps = {
  clientId?: string;
  clientName?: string;
  onSubmit: (data: {
    clientId: string;
    year: number;
    month: number;
    dueDate?: string;
  }) => void | Promise<void>;
  trigger?: React.ReactNode;
  clients?: Array<{ id: string; name: string }>;
};

export function CreatePeriodDialog({
  clientId,
  clientName,
  onSubmit,
  trigger,
  clients = [],
}: CreatePeriodDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedClientId, setSelectedClientId] = React.useState(clientId || "");
  const [year, setYear] = React.useState(new Date().getFullYear());
  const [month, setMonth] = React.useState(new Date().getMonth() + 1);
  const [dueDate, setDueDate] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  React.useEffect(() => {
    if (clientId) {
      setSelectedClientId(clientId);
    }
  }, [clientId]);

  const handleSubmit = async () => {
    if (!selectedClientId) {
      alert("Please select a client");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        clientId: selectedClientId,
        year,
        month,
        dueDate: dueDate || undefined,
      });
      setOpen(false);
      // Reset form
      if (!clientId) {
        setSelectedClientId("");
      }
      setYear(new Date().getFullYear());
      setMonth(new Date().getMonth() + 1);
      setDueDate("");
    } catch (error) {
      console.error("Failed to create period:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Period
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Period</DialogTitle>
          <DialogDescription>
            {clientName
              ? `Create a new accounting period for ${clientName}`
              : "Create a new accounting period for a client"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Client Selection (if not pre-selected) */}
          {!clientId && clients.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger id="client">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Year Selection */}
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
              <SelectTrigger id="year">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Month Selection */}
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
              <SelectTrigger id="month">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value.toString()}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due Date (Optional)
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="YYYY-MM-DD"
            />
            <p className="text-xs text-muted-foreground">
              When should documents be submitted by?
            </p>
          </div>

          {/* Period Preview */}
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-sm font-medium mb-1">Period Preview</div>
            <div className="text-2xl font-bold">
              {year}-{String(month).padStart(2, "0")}
            </div>
            {dueDate && (
              <div className="text-sm text-muted-foreground mt-1">
                Due: {new Date(dueDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Period"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
