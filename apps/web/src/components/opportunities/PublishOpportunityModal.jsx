import { ArrowUpRight } from "lucide-react";
import React, { useState } from "react";
import FormField from "../ui/FormField.jsx";
import Modal from "../ui/Modal.jsx";
import { request } from "../../services/api.js";
import { parseSkills } from "../../utils/format.js";

export default function PublishOpportunityModal({ close, act }) {
  const [form, setForm] = useState({
      title: "",
      description: "",
      area: "Datos",
      modality: "Remoto",
      location: "Colombia",
      skills: "",
    }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <Modal close={close} title="Publicar práctica">
      <div className="eyebrow">UNA OPORTUNIDAD PARA CRECER</div>
      <h1>Publicar una práctica</h1>
      <p className="muted">
        Define con claridad qué hará el estudiante y qué habilidades necesita.
      </p>
      <form
        className="form-panel"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await request("/opportunities", {
              method: "POST",
              body: JSON.stringify({
                ...form,
                skills: parseSkills(form.skills),
              }),
            });
            await act(
              async () => {},
              "Práctica publicada. Ya está disponible para estudiantes.",
            );
            close();
          } catch (e) {
            setError(e.message);
            setBusy(false);
          }
        }}
      >
        <FormField
          label="Título de la práctica"
          name="title"
          required
          minLength={4}
          maxLength={160}
          value={form.title}
          onChange={change}
        />
        <label>
          Descripción
          <textarea
            name="description"
            required
            minLength={30}
            maxLength={5000}
            rows={4}
            value={form.description}
            onChange={change}
          />
        </label>
        <div className="form-row">
          <FormField
            label="Área"
            name="area"
            required
            minLength={2}
            maxLength={80}
            value={form.area}
            onChange={change}
          />
          <label>
            Modalidad
            <select name="modality" value={form.modality} onChange={change}>
              {["Remoto", "Híbrido", "Presencial"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
        </div>
        <FormField
          label="Ubicación"
          name="location"
          required
          minLength={2}
          maxLength={120}
          value={form.location}
          onChange={change}
        />
        <FormField
          label="Habilidades requeridas (separadas por comas)"
          name="skills"
          required
          value={form.skills}
          onChange={change}
          placeholder="Python, SQL, Power BI"
        />
        <p className="info-note">
          Estas habilidades se usarán para calcular la compatibilidad. Revisa
          que sean precisas.
        </p>
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
        <button disabled={busy}>
          {busy ? "Publicando…" : "Publicar práctica"}
          <ArrowUpRight size={17} />
        </button>
      </form>
    </Modal>
  );
}
