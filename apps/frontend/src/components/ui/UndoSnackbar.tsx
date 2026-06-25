import { useEffect, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import { Button } from "./button";

type UndoSnackbarProps = {
  open: boolean;
  message: string;
  onUndo: () => void;
  onExpiry: () => void;
  durationSeconds?: number;
  onClose: () => void;
};

export const UndoSnackbar = ({
  open,
  message,
  onUndo,
  onExpiry,
  durationSeconds = 5,
  onClose
}: UndoSnackbarProps) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);

  useEffect(() => {
    if (!open) return;
    setTimeLeft(durationSeconds);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpiry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, durationSeconds, onExpiry]);

  if (!open) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4 rounded-lg border border-border bg-foreground text-background px-4 py-3 shadow-2xl animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span>{message}</span>
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-background/20 text-xs text-background font-semibold">
          {timeLeft}
        </span>
      </div>
      <div className="flex items-center gap-1 border-l border-background/20 pl-3">
        <Button
          size="sm"
          variant="ghost"
          onClick={onUndo}
          className="h-8 gap-1.5 px-3 text-xs text-accent-foreground hover:bg-background/10 font-bold hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Undo
        </Button>
        <button
          onClick={onClose}
          className="rounded-md p-1 hover:bg-background/10 transition text-background/60 hover:text-background"
          aria-label="Close snackbar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
