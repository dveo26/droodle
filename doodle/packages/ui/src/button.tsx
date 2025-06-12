"use client";

import { ReactNode } from "react";

interface ButtonProps {
  variant: "primary" | "outline" | "secondary";
  className?: string;
  onClick?: () => void;
  size: "lg" | "sm";
  children: ReactNode;
}

export const Button = ({
  size,
  variant,
  className = "",
  onClick,
  children,
}: ButtonProps) => {
  const baseStyles = `
    font-medium
    rounded-2xl
    transition-all
    duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
  `;

  const sizeStyles =
    size === "lg" ? "px-6 py-3 text-base" : "px-3 py-1.5 text-sm";

  const variantStyles =
    variant === "primary"
      ? "bg-primary text-white hover:shadow-[0_0_8px_2px_rgba(99,102,241,0.5)]"
      : variant === "secondary"
        ? "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md"
        : "border border-input bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground hover:shadow-md";

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
    >
      {children}
    </button>
  );
};
