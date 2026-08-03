import { ArrowRight } from "lucide-react";

export default function SectionHeading({
  title,
  action,
}: {
  title: string;
  action?: string | undefined;
}) {
  return (
    <div className="mb-5 flex items-end justify-between md:mb-7">
      <h2 className="text-lg font-bold tracking-tight text-foreground md:text-[26px]">{title}</h2>
      {action && (
        <a
          href="#"
          className="flex items-center gap-1.5 text-xs font-medium text-foreground/75 hover:text-primary md:text-[15px]"
        >
          {action} <ArrowRight className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}