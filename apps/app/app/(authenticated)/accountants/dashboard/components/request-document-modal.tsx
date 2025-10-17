"use client";

import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/design-system/components/ui/dialog";
import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Textarea } from "@repo/design-system/components/ui/textarea";
import { Label } from "@repo/design-system/components/ui/label";

// The prop types for the modal component.
type RequestDocumentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, notes: string) => void;
};

export function RequestDocumentModal({
  isOpen,
  onClose,
  onSubmit,
}: RequestDocumentModalProps) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return; // Don't submit if title is empty
    onSubmit(title, notes);
    setTitle("");
    setNotes("");
    // No need to call onClose here, the parent's onSubmit handles it.
  };

  const handleClose = () => {
    setTitle("");
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Request a New Document</DialogTitle>
            <DialogDescription>
              Send a document request to the client. They will be notified and
              can upload the requested document.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Document Title *</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Tax Return 2023, Bank Statement"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes for Client (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional instructions or details..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Send Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
