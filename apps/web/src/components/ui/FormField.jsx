import React from "react";

export default function FormField({ label, className = "", ...props }) {
  return (
    <label className="flex flex-col gap-2 text-[12px] font-medium text-[#5e7466]">
      {label}
      <input
        className={`w-full rounded-[7px] border border-[#dfe6db] bg-[#fcfdfa] px-3 py-[11px] text-[12px] leading-normal text-[#385443] focus:outline-2 focus:outline-offset-1 focus:outline-[#549d7e] disabled:bg-[#f2f5ee] disabled:text-[#8d9b8b] ${className}`}
        {...props}
      />
    </label>
  );
}
