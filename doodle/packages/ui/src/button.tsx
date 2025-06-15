"use client";

import type { ReactNode } from "react";

interface ButtonProps {
  variant: "primary" | "outline";
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
    focus:ring-offset-background
    inline-flex
    items-center
    justify-center
    whitespace-nowrap
    disabled:pointer-events-none
    disabled:opacity-50
    active:scale-95
    transform
    will-change-transform
  `;

  const sizeStyles =
    size === "lg" ? "px-8 py-3 text-base h-12" : "px-4 py-2 text-sm h-9";

  const variantStyles = {
    primary: `
      !bg-[#9333EA]
      !text-white
      hover:!bg-[#A855F7]
      hover:scale-105
      hover:shadow-lg
      hover:shadow-[#9333EA]/25
      active:shadow-md
      active:shadow-[#9333EA]/20
    `,
    outline: `
      border-[3px]
      border-[#9333EA]
      text-[#9333EA]
      !bg-[#9333EA]/5
      hover:!bg-[#9333EA]/10
      hover:scale-105
      hover:border-[#A855F7]
      hover:text-[#A855F7]
      [box-shadow:0_0_15px_#9333EA,0_0_30px_#9333EA,0_0_45px_#9333EA,0_0_60px_#9333EA]
      hover:[box-shadow:0_0_20px_#A855F7,0_0_40px_#A855F7,0_0_60px_#A855F7,0_0_80px_#A855F7]
      transition-all
    `,
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles[variant]} ${className}`}
      style={{
        background:
          variant === "primary"
            ? "linear-gradient(to right, #9333EA, #A855F7, #C084FC)"
            : "linear-gradient(to right, rgba(147, 51, 234, 0.05), rgba(168, 85, 247, 0.05))",
      }}
    >
      {children}
    </button>
  );
};

export default Button;
