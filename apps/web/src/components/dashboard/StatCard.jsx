import { ArrowUpRight } from "lucide-react";
import React from "react";

export default function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  onClick,
}) {
  return (
    <button
      className="stat block min-w-0 border border-border bg-white text-left text-[#314f3d] transition-transform hover:-translate-y-0.5 hover:bg-[#f4f8ef]"
      onClick={onClick}
    >
      <div className="stat-top">
        <span>{label}</span>
        <Icon size={19} />
      </div>
      <strong>{value}</strong>
      <div className="stat-bottom">
        <span>{detail}</span>
        <ArrowUpRight size={16} />
      </div>
    </button>
  );
}
