import type React from "react";
import type { JSX } from "react";

export function Card({
  className = "",
  title,
  children,
  href,
}: {
  className?: string;
  title?: string;
  children: React.ReactNode;
  href?: string;
}): JSX.Element {
  const baseStyles = `
    bg-[#1E1E1E] 
    border 
    border-[#333] 
    rounded-xl 
    p-6 
    transition-all 
    duration-300 
    hover:bg-[#252525] 
    hover:border-[#9333EA] 
    hover:scale-105 
    hover:shadow-xl 
    hover:shadow-[#9333EA]/10
    group
  `;

  if (href) {
    return (
      <a
        className={`${baseStyles} ${className} block`}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {title && (
          <h2 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#9333EA] group-hover:to-[#EC4899] group-hover:bg-clip-text transition-all duration-300">
            {title} <span className="text-[#EC4899]">→</span>
          </h2>
        )}
        <div className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
          {children}
        </div>
      </a>
    );
  }

  return (
    <div className={`${baseStyles} ${className}`}>
      {title && (
        <h2 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#9333EA] group-hover:to-[#EC4899] group-hover:bg-clip-text transition-all duration-300">
          {title}
        </h2>
      )}
      <div className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
        {children}
      </div>
    </div>
  );
}

export default Card;
