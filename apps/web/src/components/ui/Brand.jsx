import React from "react";
import { Leaf } from "lucide-react";

export default function Brand() {
  return (
    <div className="brand inline-flex items-center gap-[10px] font-display text-[24px] font-extrabold tracking-[-1px] text-[#1c4436] max-md:gap-[7px] max-md:text-[21px]">
      <span className="brandmark transform-none grid size-[35px] -rotate-5 place-items-center rounded-[11px] bg-brand text-[#e6edac] max-md:size-[30px]">
        <Leaf size={21} className="rotate-5 transform-none" />
      </span>
      <span>
        talentmatch<span className="text-[#8eae4f]">.</span>
      </span>
    </div>
  );
}
