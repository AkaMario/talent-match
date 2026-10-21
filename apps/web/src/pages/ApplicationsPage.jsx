import React, { useState } from "react";
import { Download } from "lucide-react";
import Tag from "../components/ui/Tag.jsx";
import PageHeading from "../components/ui/PageHeading.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { request, download } from "../services/api.js";
import { formatDate } from "../utils/format.js";
import { useTalentMatch } from "../hooks/useTalentMatch.js";

export default function ApplicationsPage() {
  const { applications, company, act } = useTalentMatch();

  const [busy, setBusy] = useState(null),
    [error, setError] = useState("");
  return (
    <>
      <PageHeading
        eyebrow={
          company
            ? "PERSONAS CON POTENCIAL"
            : "CADA POSTULACIÓN, UNA POSIBILIDAD"
        }
        title={company ? "Conoce a tus candidatos" : "Tus postulaciones"}
        description={
          company
            ? "Revisa los perfiles, descarga sus CV y actualiza el proceso."
            : "Sigue tus oportunidades y consulta el estado de cada proceso."
        }
      />
      <div className="application-list">
        {applications.map((a) => (
          <article className="panel application" key={a.id}>
            <div className="application-header">
              <div>
                <span className="eyebrow">
                  {company ? a.student_name : a.company_name}
                </span>
                <h2>{a.title}</h2>
                <p>Postulación enviada el {formatDate(a.created_at)}</p>
              </div>
              <Tag green={["Aceptada", "Entrevista"].includes(a.status)}>
                {a.status}
              </Tag>
            </div>
            {company && (
              <>
                <p>
                  {a.career} · Semestre {a.semester}
                </p>
                <div className="skill-tags">
                  {a.skills.map((s) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </div>
                {a.projects && (
                  <p>
                    <strong>Proyectos:</strong> {a.projects}
                  </p>
                )}
                {a.certifications && (
                  <p>
                    <strong>Certificaciones:</strong> {a.certifications}
                  </p>
                )}
                <div className="application-actions">
                  <button
                    className="secondary"
                    onClick={() =>
                      download(a.document_id, a.document_name).catch((e) =>
                        setError(e.message),
                      )
                    }
                  >
                    <Download size={16} />
                    Descargar CV
                  </button>
                  <label>
                    Estado del proceso
                    <select
                      aria-label={`Estado de ${a.student_name} en ${a.title}`}
                      disabled={busy === a.id}
                      value={a.status}
                      onChange={async (e) => {
                        const status = e.target.value;
                        setBusy(a.id);
                        await act(
                          () =>
                            request(`/applications/${a.id}/status`, {
                              method: "PUT",
                              body: JSON.stringify({ status }),
                            }),
                          "Estado de la postulación actualizado.",
                        );
                        setBusy(null);
                      }}
                    >
                      <option disabled>Enviada</option>
                      {[
                        "En revisión",
                        "Entrevista",
                        "Aceptada",
                        "No seleccionada",
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </>
            )}
          </article>
        ))}
      </div>
      {error && (
        <p role="alert" className="inline-error">
          {error}
        </p>
      )}
      {!applications.length && (
        <EmptyState
          text={
            company
              ? "Tus candidatos aparecerán aquí cuando se postulen."
              : "Todavía no te has postulado. Explora las prácticas y encuentra una para ti."
          }
        />
      )}
    </>
  );
}
