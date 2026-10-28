import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export default function SectionHeading({
  title,
  action,
  href = "/shop",
}: {
  title: string;
  action?: string | undefined;
  href?: string | undefined;
}) {
  return (
    <div className="mb-5 flex items-end justify-between md:mb-7">
      <h2 className="text-lg font-bold tracking-tight text-foreground md:text-[26px]">{title}</h2>
      {action && (
        <Link
          to={href || "/shop"}
          className="flex items-center gap-1.5 text-xs font-medium text-foreground/75 hover:text-primary md:text-[15px] transition-colors"
        >
          {action} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
