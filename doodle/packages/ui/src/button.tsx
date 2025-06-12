"use client";

import type { ReactNode } from "react";

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
    rounded-xl
    transition-all
    duration-300
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    focus:ring-[#9333EA]
    focus:ring-offset-[#121212]
    inline-flex
    items-center
    justify-center
    whitespace-nowrap
    disabled:pointer-events-none
    disabled:opacity-50
  `;

  const sizeStyles =
    size === "lg" ? "px-8 py-3 text-base h-12" : "px-4 py-2 text-sm h-9";

  const variantStyles =
    variant === "primary"
      ? "bg-gradient-to-r from-[#9333EA] via-[#EC4899] to-[#06B6D4] text-white hover:opacity-90 hover:scale-105 hover:shadow-lg hover:shadow-[#EC4899]/25"
      : variant === "secondary"
        ? "bg-[#1E1E1E] text-white border border-[#333] hover:bg-[#252525] hover:scale-105 hover:shadow-lg hover:shadow-[#9333EA]/20"
        : "border border-[#9333EA] text-[#9333EA] bg-transparent hover:bg-[#9333EA] hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-[#9333EA]/25";

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
