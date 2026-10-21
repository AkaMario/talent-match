import { ArrowUpRight } from "lucide-react";
import React, { useState } from "react";
import { MapPin } from "lucide-react";
import Tag from "../ui/Tag.jsx";

export default function OpportunityCard({ opportunity: o, company, onClick }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <article className="opportunity-card">
      <div className="op-card-top">
        <div className="company-logo">
          {o.company_name.slice(0, 1)}
          <span>↗</span>
        </div>
        <div className="op-title">
          <span>{o.company_name}</span>
          <h3>{o.title}</h3>
        </div>
        {company ? (
          <Tag green={o.active}>{o.active ? "Abierta" : "Cerrada"}</Tag>
        ) : (
          <div className={`match ${o.score >= 65 ? "high" : ""}`}>
            <strong>{o.score}%</strong>
            <span>compatibilidad</span>
          </div>
        )}
      </div>
      <div className="op-meta">
        <span>
          <MapPin size={14} />
          {o.location}
        </span>
        <span className="meta-dot" />
        <span>{o.modality}</span>
        <span className="meta-dot" />
        <span>{o.area}</span>
      </div>
      <div className="card-bottom">
        <div className="skill-tags">
          {o.skills.slice(0, 3).map((s) => (
            <Tag key={s} green={!company && o.matched.includes(s)}>
              {s}
            </Tag>
          ))}
          {o.skills.length > 3 && <Tag>+{o.skills.length - 3}</Tag>}
        </div>
        <button
          className="card-arrow"
          aria-label={`Ver ${o.title}`}
          aria-expanded={company ? expanded : undefined}
          onClick={company ? () => setExpanded(!expanded) : onClick}
        >
          <ArrowUpRight size={20} />
        </button>
      </div>
      {company && expanded && (
        <p className="company-description">{o.description}</p>
      )}
    </article>
  );
}
