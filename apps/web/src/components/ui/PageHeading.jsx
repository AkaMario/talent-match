import React from "react";

export default function PageHeading({ eyebrow, title, description, children }) {
  return (
    <div className="page-heading mb-7 flex items-center justify-between gap-5 max-sm:mb-[22px] max-sm:items-start">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="text-[30px] max-md:text-[26px]">{title}</h1>
        <p className="mt-2 text-[12px] text-muted max-sm:text-[11px]">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}
