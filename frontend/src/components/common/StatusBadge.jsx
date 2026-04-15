import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }) {
  if (status === "completed")
    return (
      <Badge className="border-green-600/35 bg-green-600/18 text-green-700 hover:bg-green-600/22 dark:text-green-400">
        Completed
      </Badge>
    );
  if (status === "in_progress")
    return (
      <Badge className="border-blue-600/35 bg-blue-600/18 text-blue-700 hover:bg-blue-600/22 dark:text-blue-400">
        In Progress
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-muted-foreground">
      Not Started
    </Badge>
  );
}

export function ProgressBar({ pct }) {
  const color =
    pct === 100
      ? "bg-green-500"
      : pct >= 50
        ? "bg-blue-500"
        : "bg-muted-foreground";
  return (
    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ScoreText({ pct, className = "" }) {
  const color =
    pct >= 80
      ? "text-green-500"
      : pct >= 60
        ? "text-yellow-400"
        : pct >= 40
          ? "text-orange-400"
          : "text-red-500";
  return <span className={`font-semibold ${color} ${className}`}>{pct}%</span>;
}

export function scoreColor(pct) {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 60) return "bg-yellow-400";
  if (pct >= 40) return "bg-orange-400";
  return "bg-red-500";
}
