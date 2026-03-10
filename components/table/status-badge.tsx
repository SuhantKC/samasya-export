import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

interface SwitchProps extends PropsWithChildren {
  className?: string;
}

const Switch = ({ children, className }: SwitchProps) => {
  return (
    <Badge
      className={cn(
        "rounded-xl px-2 py-1 font-normal bg-badge-primary text-white",
        className
      )}
    >
      {children}
    </Badge>
  );
};
const getVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "success":
      return "bg-success hover:bg-success";
    case "pending":
      return "bg-warning hover:bg-warning";
    case "failed":
      return "bg-destructive hover:bg-destructive";
    default:
      return "bg-gray-300 hover:bg-gray-600";
  }
};

export default function StatusBadge({
  label,
  className,
}: {
  label: "success" | "pending" | "failed" | "default";
  className?: string;
}) {
  return (
    <Switch className={cn(getVariant(label), className)}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </Switch>
  );
}
