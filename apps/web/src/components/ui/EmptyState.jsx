import React from "react";
import { BriefcaseBusiness } from "lucide-react";

export default function EmptyState({ text }) {
  return (
    <div className="empty flex flex-col items-center gap-[18px] rounded-[10px] border border-dashed border-[#d9e1d2] bg-white px-[30px] py-[60px] text-center text-[#8b9b81]">
      <BriefcaseBusiness size={30} />
      <p className="max-w-[400px] text-[13px]">{text}</p>
    </div>
  );
}
