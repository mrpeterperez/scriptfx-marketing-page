"use client";

import * as React from "react";
import Link from "next/link";

type ButtonVariant = "solid" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

function cx(...parts: Array<string | undefined | null | false>) {
  return parts.filter(Boolean).join(" ");
}

const baseClasses =
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

const variantClasses: Record<ButtonVariant, string> = {
  solid:
    "bg-gradient-to-b from-primary to-primary/80 text-on-primary hover:to-primary/70",
  outline:
    "border border-border bg-transparent text-on-surface hover:bg-container/40",
  ghost: "bg-transparent text-on-surface hover:bg-container/40",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 px-3.5",
  md: "h-11 px-5",
  lg: "h-12 px-6 text-base",
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

type ButtonAsButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    href?: undefined;
  };

type ButtonAsLinkProps = CommonProps &
  Omit<React.ComponentPropsWithoutRef<typeof Link>, "className" | "href"> & {
    href: string;
    disabled?: boolean;
  };

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export function Button(props: ButtonProps) {
  const {
    variant = "solid",
    size = "md",
    className,
    ...rest
  } = props as ButtonProps;

  const classes = cx(baseClasses, variantClasses[variant], sizeClasses[size], className);

  if ("href" in props && typeof props.href === "string") {
    const { href, disabled, onClick, ...linkProps } = rest as ButtonAsLinkProps;

    return (
      <Link
        href={href}
        className={cx(classes, disabled ? "pointer-events-none" : undefined)}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
        {...linkProps}
      />
    );
  }

  return <button className={classes} {...(rest as ButtonAsButtonProps)} />;
}
