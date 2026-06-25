import { useEffect, useRef } from "react";
import { Dialog } from "./dialog";
import { Button } from "./button";

type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  isConfirming?: boolean;
};

export const ConfirmationDialog = ({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
  isConfirming = false
}: ConfirmationDialogProps) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Focus the confirm button when open
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 50);
    }
  }, [open]);

  // Support Enter to confirm and Escape to close (handled by dialog parent or explicitly here)
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onConfirm();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onConfirm, onClose]);

  return (
    <Dialog open={open} title={title} onClose={onClose} className="max-w-md">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isConfirming}>
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            ref={confirmButtonRef}
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? "Processing..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
