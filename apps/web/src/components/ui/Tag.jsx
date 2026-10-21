import React from "react";

export default function Tag({ children, green = false }) {
  return (
    <span
      className={`tag inline-flex items-center gap-1 rounded px-2 py-[5px] text-[9px] leading-[1.4] font-medium ${green ? "green bg-sage text-[#6c8852]" : "bg-[#f3f5ef] text-[#8a927c]"}`}
    >
      {children}
    </span>
  );
}
