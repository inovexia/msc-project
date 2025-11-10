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
import { Checkbox } from "@repo/design-system/components/ui/checkbox";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Calendar, Users, CheckCircle2 } from "lucide-react";
import { Progress } from "@repo/design-system/components/ui/progress";

type Client = {
  id: string;
  name: string;
};

type BulkCreatePeriodsDialogProps = {
  clients: Client[];
  onSubmit: (data: {
    clientIds: string[];
    year: number;
    month: number;
    dueDate?: string;
  }) => Promise<void>;
  trigger?: React.ReactNode;
};

export function BulkCreatePeriodsDialog({
  clients,
  onSubmit,
  trigger,
}: BulkCreatePeriodsDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedClientIds, setSelectedClientIds] = React.useState<Set<string>>(new Set());
  const [year, setYear] = React.useState(new Date().getFullYear());
  const [month, setMonth] = React.useState(new Date().getMonth() + 1);
  const [dueDate, setDueDate] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

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

  const toggleClient = (clientId: string) => {
    setSelectedClientIds((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) {
        next.delete(clientId);
      } else {
        next.add(clientId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedClientIds(new Set(clients.map((c) => c.id)));
  };

  const deselectAll = () => {
    setSelectedClientIds(new Set());
  };

  const handleSubmit = async () => {
    if (selectedClientIds.size === 0) {
      alert("Please select at least one client");
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onSubmit({
        clientIds: Array.from(selectedClientIds),
        year,
        month,
        dueDate: dueDate || undefined,
      });

      clearInterval(interval);
      setProgress(100);

      setTimeout(() => {
        setOpen(false);
        // Reset form
        setSelectedClientIds(new Set());
        setYear(new Date().getFullYear());
        setMonth(new Date().getMonth() + 1);
        setDueDate("");
        setProgress(0);
      }, 500);
    } catch (error) {
      console.error("Failed to create periods:", error);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Users className="h-4 w-4" />
            Bulk Create Periods
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Create Periods
          </DialogTitle>
          <DialogDescription>
            Create the same period for multiple clients at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Period Selection */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
            <div className="text-sm font-semibold">Period Details</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bulk-year">Year</Label>
                <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                  <SelectTrigger id="bulk-year">
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

              <div className="space-y-2">
                <Label htmlFor="bulk-month">Month</Label>
                <Select
                  value={month.toString()}
                  onValueChange={(v) => setMonth(parseInt(v))}
                >
                  <SelectTrigger id="bulk-month">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk-dueDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Due Date (Optional)
              </Label>
              <Input
                id="bulk-dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-background rounded border">
              <div className="text-lg font-bold">
                {year}-{String(month).padStart(2, "0")}
              </div>
              {dueDate && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <div className="text-sm text-muted-foreground">
                    Due: {new Date(dueDate).toLocaleDateString()}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Client Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                Select Clients ({selectedClientIds.size} of {clients.length})
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  disabled={selectedClientIds.size === clients.length}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={deselectAll}
                  disabled={selectedClientIds.size === 0}
                >
                  Deselect All
                </Button>
              </div>
            </div>

            <div className="rounded-lg border max-h-64 overflow-y-auto">
              {clients.map((client) => {
                const isSelected = selectedClientIds.has(client.id);
                return (
                  <div
                    key={client.id}
                    className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleClient(client.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleClient(client.id)}
                    />
                    <span className="flex-1 font-medium">{client.name}</span>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Bar */}
          {loading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                Creating periods... {progress}%
              </p>
            </div>
          )}

          {/* Summary */}
          {selectedClientIds.size > 0 && !loading && (
            <div className="rounded-lg border bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <Badge className="mt-0.5">{selectedClientIds.size}</Badge>
                <div className="text-sm">
                  <p className="font-semibold mb-1">Ready to Create</p>
                  <p className="text-muted-foreground">
                    Period <strong>{year}-{String(month).padStart(2, "0")}</strong> will
                    be created for {selectedClientIds.size} client
                    {selectedClientIds.size !== 1 ? "s" : ""}.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || selectedClientIds.size === 0}>
            {loading ? "Creating..." : `Create ${selectedClientIds.size} Period${selectedClientIds.size !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
