import React from "react";

const variants = {
  primary: "bg-brand text-white hover:bg-brand-hover",
  secondary: "border border-border bg-white text-brand hover:bg-sage",
  ghost: "bg-transparent text-muted hover:bg-sage hover:text-brand",
};

export default function Button({
  variant = "primary",
  type = "button",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-[18px] py-3 font-semibold transition-colors disabled:cursor-wait disabled:opacity-55 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#b2cc5c] ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
