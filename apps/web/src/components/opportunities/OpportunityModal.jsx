import { ArrowUpRight } from "lucide-react";
import React, { useState } from "react";
import {
  Sparkles,
  MapPin,
  Target,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import Tag from "../ui/Tag.jsx";
import Modal from "../ui/Modal.jsx";
import { request } from "../../services/api.js";

export default function OpportunityModal({
  opportunity: o,
  close,
  documents,
  applications,
  act,
}) {
  const [plan, setPlan] = useState(null),
    [thinking, setThinking] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [cv, setCv] = useState(documents.find((d) => d.kind === "cv")?.id || ""),
    [sent, setSent] = useState(
      applications.some((a) => a.opportunity_id === o.id),
    );
  const cvs = documents.filter((d) => d.kind === "cv");
  return (
    <Modal close={close} title={o.title}>
      <div className="eyebrow">
        {o.company_name} · {o.modality}
      </div>
      <h1>{o.title}</h1>
      <p className="muted">
        <MapPin size={15} />
        {o.location} · {o.area}
      </p>
      <p className="job-description">{o.description}</p>
      <div className="comparison">
        <div className="comparison-score">
          <strong>{o.score}%</strong>
          <span>de compatibilidad</span>
        </div>
        <div>
          <h3>Así conecta con tu perfil</h3>
          <p>
            {o.matched.length} de {o.skills.length} habilidades requeridas
            declaradas.
          </p>
          <small>
            Este porcentaje orienta tu búsqueda y no garantiza una selección.
          </small>
        </div>
      </div>
      <div className="comparison-columns">
        <div>
          <h3>
            <CheckCircle2 size={17} />
            Tus coincidencias
          </h3>
          {o.matched.map((s) => (
            <Tag green key={s}>
              {s}
            </Tag>
          ))}
          {!o.matched.length && (
            <p className="muted">Aún no declaraste estas habilidades.</p>
          )}
        </div>
        <div>
          <h3>
            <Target size={17} />
            Por fortalecer
          </h3>
          {o.missing.map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
          {!o.missing.length && (
            <p className="muted">¡Cumples todas las habilidades declaradas!</p>
          )}
        </div>
      </div>
      <section className="ai-panel">
        <div className="section-heading">
          <h3>
            <Sparkles size={19} /> Tu siguiente paso con IA
          </h3>
          <Tag>Ollama · local</Tag>
        </div>
        <p>
          Recibe acciones concretas para practicar las habilidades que te
          faltan.
        </p>
        <button
          className="secondary"
          disabled={thinking}
          onClick={async () => {
            setThinking(true);
            setError("");
            try {
              setPlan(
                await request(`/opportunities/${o.id}/plan`, {
                  method: "POST",
                }),
              );
            } catch (e) {
              setError(e.message);
            } finally {
              setThinking(false);
            }
          }}
        >
          {thinking ? (
            <>
              <LoaderCircle className="spin" size={17} />
              Generando plan…
            </>
          ) : (
            <>
              <Sparkles size={16} />
              {plan ? "Volver a generar" : "Generar mi plan"}
            </>
          )}
        </button>
        {thinking && (
          <small className="thinking-note" role="status">
            El modelo corre en tu equipo. La primera respuesta puede tardar
            hasta 75 segundos.
          </small>
        )}
        {plan && (
          <div className="plan" role="status">
            <p
              className={
                plan.source === "fallback" ? "inline-warning" : "muted"
              }
            >
              {plan.message}
            </p>
            {plan.plan.map((step, i) => (
              <div className="plan-step" key={step.skill}>
                <span>{i + 1}</span>
                <div>
                  <strong>{step.skill}</strong>
                  <p>{step.action}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="apply-section">
        <h3>¿Te imaginas aquí?</h3>
        <p>
          La decisión es tuya. Puedes postularte aunque tengas habilidades por
          fortalecer.
        </p>
        {sent ? (
          <div className="alert success">
            <CheckCircle2 size={18} /> Ya enviaste tu postulación. Consúltala en
            Mis postulaciones.
          </div>
        ) : !cvs.length ? (
          <div className="alert">
            Sube primero tu hoja de vida en Mi perfil para poder postularte.
          </div>
        ) : (
          <>
            <label>
              Hoja de vida que compartirás
              <select value={cv} onChange={(e) => setCv(e.target.value)}>
                {cvs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="info-note">
              Al postularte, compartirás tu perfil y el CV seleccionado con{" "}
              {o.company_name}.
            </p>
            <button
              disabled={busy || !cv}
              onClick={async () => {
                setBusy(true);
                setError("");
                try {
                  await request("/applications", {
                    method: "POST",
                    body: JSON.stringify({
                      opportunityId: o.id,
                      documentId: cv,
                    }),
                  });
                  setSent(true);
                  await act(async () => {});
                } catch (e) {
                  setError(e.message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Enviando…" : "Enviar mi postulación"}
              <ArrowUpRight size={17} />
            </button>
          </>
        )}
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
      </section>
    </Modal>
  );
}
