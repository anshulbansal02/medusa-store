import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyActionProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
  className?: string;
  titleAs?: "h1" | "h2";
  titleClassName?: string;
};

export function EmptyAction({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
  className,
  titleAs = "h2",
  titleClassName,
}: EmptyActionProps) {
  const Title = titleAs;

  return (
    <div className={cn("py-12", className)}>
      {eyebrow ? (
        <p className="text-muted-foreground text-sm">{eyebrow}</p>
      ) : null}
      <Title
        className={cn(
          "mt-3 font-heading text-6xl leading-none sm:text-8xl",
          titleClassName,
        )}
      >
        {title}
      </Title>
      <p className="mt-5 max-w-xl text-muted-foreground">{description}</p>
      <Link
        href={actionHref}
        className={cn(
          buttonVariants({ size: "lg" }),
          "mt-7 h-11 rounded-none px-6",
        )}
      >
        {actionLabel}
      </Link>
    </div>
  );
}
