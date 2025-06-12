import type React from "react";
import type { JSX } from "react";

export function Code({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <code
      className={`
        bg-[#1E1E1E] 
        text-[#EC4899] 
        px-2 
        py-1 
        rounded 
        text-sm 
        font-mono 
        border 
        border-[#333]
        ${className}
      `}
    >
      {children}
    </code>
  );
}

export default Code;
