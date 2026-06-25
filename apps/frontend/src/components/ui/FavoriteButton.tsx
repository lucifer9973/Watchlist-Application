import { Star } from "lucide-react";
import { cn } from "../../lib/utils";

type FavoriteButtonProps = {
  isFavorite: boolean;
  onToggle: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
};

export const FavoriteButton = ({
  isFavorite,
  onToggle,
  className,
  disabled = false
}: FavoriteButtonProps) => {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      type="button"
      className={cn(
        "rounded-full p-2 transition-all duration-300 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isFavorite
          ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
          : "bg-black/30 text-white/70 hover:bg-black/50 hover:text-white",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      aria-label={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
      aria-pressed={isFavorite}
    >
      <Star className={cn("h-4.5 w-4.5 transition-transform duration-300 hover:scale-110", isFavorite && "fill-current")} />
    </button>
  );
};
