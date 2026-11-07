import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Follows shadcn/ui's component conventions, including the `data-slot` attribute that
 * Runware's own pricing page emits, mapped onto their token contract. Minimum target
 * height is 44px in the `touch` size, used wherever a control is primary on mobile.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-md border " +
    "bg-clip-padding text-sm font-medium whitespace-nowrap transition-colors outline-none " +
    "select-none disabled:pointer-events-none disabled:opacity-50 " +
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "border-border bg-background hover:bg-muted hover:text-foreground",
        primary:
          "border-transparent bg-primary text-primary-foreground hover:bg-rw-green-mid font-semibold",
        ghost: "border-transparent hover:bg-muted hover:text-foreground",
        subtle: "border-transparent bg-secondary text-secondary-foreground hover:bg-rw-neutral-70",
        link: "border-transparent underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-7 px-2.5 text-[13px]",
        default: "h-8 px-4",
        touch: "h-11 px-4",
        icon: "size-8 p-0",
        iconTouch: "size-11 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
