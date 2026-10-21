import React, { useState } from "react";
import { Search, Plus } from "lucide-react";
import PageHeading from "../components/ui/PageHeading.jsx";
import OpportunityCard from "../components/opportunities/OpportunityCard.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { request } from "../services/api.js";
import { useTalentMatch } from "../hooks/useTalentMatch.js";
import { useOutletContext } from "react-router-dom";

export default function OpportunitiesPage() {
  const { opportunities, company, act } = useTalentMatch();
  const { openOpportunity, openPublish } = useOutletContext();

  const [search, setSearch] = useState(""),
    [modality, setModality] = useState(""),
    [score, setScore] = useState("0"),
    [busy, setBusy] = useState(null);
  const filtered = opportunities.filter(
    (o) =>
      `${o.title} ${o.company_name} ${o.skills.join(" ")} ${o.area}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (!modality || o.modality === modality) &&
      (company || o.score >= Number(score)),
  );
  return (
    <>
      <PageHeading
        eyebrow={company ? "CONSTRUYE TU EQUIPO" : "CONECTA CON TU FUTURO"}
        title={company ? "Mis prácticas" : "Encuentra tu próxima práctica"}
        description={
          company
            ? "Publica oportunidades y gestiona su disponibilidad."
            : "Explora, compara tus habilidades y elige dónde dar el siguiente paso."
        }
      >
        {company && (
          <button onClick={() => openPublish()}>
            <Plus size={18} />
            Publicar práctica
          </button>
        )}
      </PageHeading>
      <div className="filters">
        <label className="search-field">
          <Search size={18} />
          <input
            aria-label="Buscar prácticas"
            placeholder="Busca un rol, empresa o habilidad…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          aria-label="Modalidad"
          value={modality}
          onChange={(e) => setModality(e.target.value)}
        >
          <option value="">Todas las modalidades</option>
          {["Remoto", "Híbrido", "Presencial"].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        {!company && (
          <select
            aria-label="Compatibilidad mínima"
            value={score}
            onChange={(e) => setScore(e.target.value)}
          >
            <option value="0">Cualquier compatibilidad</option>
            <option value="50">Desde 50% de compatibilidad</option>
            <option value="75">Desde 75% de compatibilidad</option>
            <option value="100">100% de compatibilidad</option>
          </select>
        )}
      </div>
      <p className="results-count">
        {filtered.length} oportunidades{" "}
        {company ? "publicadas" : "para explorar"}
        {!company && " · Ordenadas por compatibilidad"}
      </p>
      <div className="opportunities-grid">
        {filtered.map((o) => (
          <div key={o.id}>
            <OpportunityCard
              opportunity={o}
              company={company}
              onClick={() => (company ? null : openOpportunity(o))}
            />
            {company && (
              <div className="company-card-actions">
                <span>{o.applicant_count} postulaciones</span>
                <button
                  disabled={busy === o.id}
                  className="text-button"
                  onClick={async () => {
                    setBusy(o.id);
                    await act(
                      () =>
                        request(`/opportunities/${o.id}/toggle`, {
                          method: "POST",
                        }),
                      o.active ? "Práctica cerrada." : "Práctica abierta.",
                    );
                    setBusy(null);
                  }}
                >
                  {o.active ? "Cerrar convocatoria" : "Reabrir convocatoria"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {!filtered.length && (
        <EmptyState text="No encontramos prácticas con estos filtros." />
      )}
      {!company && (
        <p className="info-note">
          La compatibilidad es el porcentaje de habilidades requeridas que
          declaraste en tu perfil. Sirve como orientación; la decisión de
          postularte es tuya.
        </p>
      )}
    </>
  );
}
