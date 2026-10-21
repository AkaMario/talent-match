import React, { useState } from "react";
import { FileText, Check, Plus, Download } from "lucide-react";
import PageHeading from "../components/ui/PageHeading.jsx";
import FormField from "../components/ui/FormField.jsx";
import { request, download } from "../services/api.js";
import { parseSkills } from "../utils/format.js";
import { useTalentMatch } from "../hooks/useTalentMatch.js";

function ProfileEditor() {
  const { profile, documents, company, act } = useTalentMatch();

  const [form, setForm] = useState({
      ...profile,
      skills: profile.skills.join(", "),
    }),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [kind, setKind] = useState("cv"),
    [file, setFile] = useState(null),
    [downloadError, setDownloadError] = useState("");
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    await act(
      () =>
        request("/me", {
          method: "PUT",
          body: JSON.stringify({
            name: form.name,
            career: form.career,
            semester: Number(form.semester),
            bio: form.bio,
            skills: parseSkills(form.skills),
            projects: form.projects,
            certifications: form.certifications,
          }),
        }),
      "Perfil actualizado. La compatibilidad de tus prácticas ya se recalculó.",
    );
    setBusy(false);
  }
  return (
    <>
      <PageHeading
        eyebrow={company ? "TU IDENTIDAD" : "AQUÍ EMPIEZA TODO"}
        title={company ? "Perfil de la empresa" : "Tu perfil, tu potencial"}
        description={
          company
            ? "Presenta tu empresa a los próximos profesionales."
            : "Cuenta lo que sabes y lo que has construido. Tu perfil evoluciona contigo."
        }
      />
      <div className="profile-grid">
        <form className="panel form-panel" onSubmit={save}>
          <h2>
            {company ? "Información de empresa" : "Información profesional"}
          </h2>
          <FormField
            label={company ? "Nombre de la empresa" : "Nombre completo"}
            name="name"
            value={form.name}
            onChange={change}
            required
            minLength={2}
            maxLength={120}
          />
          <label>
            Correo de la cuenta
            <input value={profile.email} disabled />
            <small>Gestionado por Keycloak.</small>
          </label>
          {!company && (
            <div className="form-row">
              <FormField
                label="Carrera"
                name="career"
                value={form.career}
                onChange={change}
                maxLength={160}
              />
              <FormField
                label="Semestre"
                name="semester"
                type="number"
                min="1"
                max="16"
                value={form.semester}
                onChange={change}
              />
            </div>
          )}
          <label>
            {company ? "Sobre la empresa" : "Sobre ti"}
            <textarea
              name="bio"
              rows="3"
              value={form.bio}
              onChange={change}
              maxLength={2000}
            />
          </label>
          {!company && (
            <>
              <FormField
                label="Habilidades (separadas por comas)"
                name="skills"
                value={form.skills}
                onChange={change}
                placeholder="Python, SQL, Trabajo en equipo"
              />
              <label>
                Proyectos
                <textarea
                  name="projects"
                  rows="3"
                  value={form.projects}
                  onChange={change}
                  maxLength={3000}
                  placeholder="Describe tus proyectos y las tecnologías que usaste."
                />
              </label>
              <label>
                Certificaciones
                <textarea
                  name="certifications"
                  rows="2"
                  value={form.certifications}
                  onChange={change}
                  maxLength={2000}
                />
              </label>
            </>
          )}
          <button disabled={busy}>
            {busy ? "Guardando…" : "Guardar perfil"}
            <Check size={17} />
          </button>
        </form>
        {!company && (
          <section className="panel documents-panel">
            <FileText size={25} />
            <h2>Tus documentos</h2>
            <p>
              Tu CV y las evidencias de lo que sabes hacer. PDF de hasta 5 MB,
              almacenados en MinIO.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!file) return;
                setUploading(true);
                const data = new FormData();
                data.append("kind", kind);
                data.append("file", file);
                await act(
                  () => request("/documents", { method: "POST", body: data }),
                  "Documento guardado.",
                );
                setUploading(false);
              }}
            >
              <label>
                Tipo de documento
                <select value={kind} onChange={(e) => setKind(e.target.value)}>
                  <option value="cv">Hoja de vida (CV)</option>
                  <option value="certificate">Certificado</option>
                  <option value="project">Proyecto / evidencia</option>
                </select>
              </label>
              <label className="upload-field">
                Seleccionar PDF
                <input
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={(e) => setFile(e.target.files[0] || null)}
                />
              </label>
              <button className="secondary" disabled={uploading || !file}>
                {uploading ? "Subiendo…" : "Subir documento"}
                <Plus size={16} />
              </button>
            </form>
            <div className="document-list">
              {documents.map((d) => (
                <div className="document" key={d.id}>
                  <FileText size={20} />
                  <div>
                    <strong>{d.name}</strong>
                    <small>
                      {d.kind === "cv"
                        ? "Hoja de vida"
                        : d.kind === "certificate"
                          ? "Certificado"
                          : "Proyecto"}{" "}
                      · {Math.ceil(d.size / 1024)} KB
                    </small>
                  </div>
                  <button
                    type="button"
                    className="icon-button"
                    title={`Descargar ${d.name}`}
                    onClick={() =>
                      download(d.id, d.name).catch((e) =>
                        setDownloadError(e.message),
                      )
                    }
                  >
                    <Download size={18} />
                  </button>
                </div>
              ))}
              {!documents.length && (
                <p className="muted">Aún no has cargado documentos.</p>
              )}
            </div>
            {downloadError && (
              <p role="alert" className="inline-error">
                {downloadError}
              </p>
            )}
          </section>
        )}
      </div>
    </>
  );
}

export default function ProfilePage() {
  const { profile } = useTalentMatch();
  return <ProfileEditor key={profile.updated_at} />;
}
