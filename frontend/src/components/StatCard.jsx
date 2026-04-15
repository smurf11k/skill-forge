import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({
  label,
  value,
  visual = null,
  visualClassName = "text-xl opacity-40",
}) {
  return (
    <Card>
      <CardContent className="pt-4 relative">
        {visual && (
          <span className={`absolute top-4 right-4 ${visualClassName}`}>
            {visual}
          </span>
        )}
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
          {label}
        </p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}
