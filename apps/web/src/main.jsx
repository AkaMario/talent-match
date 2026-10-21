import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  LayoutDashboard,
  BriefcaseBusiness,
  UserRound,
  FileText,
  LogOut,
  Sparkles,
  Check,
  MapPin,
  Search,
  Plus,
  X,
  GraduationCap,
  Target,
  ChevronRight,
  Download,
  Building2,
  Leaf,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import { auth, ready, request, download } from "./auth";
import "./style.css";
const icons = {
  dashboard: LayoutDashboard,
  opportunities: BriefcaseBusiness,
  profile: UserRound,
  applications: FileText,
};
const date = (v) =>
  new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(v));
const skillList = (text) =>
  text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
function Brand() {
  return (
    <div className="brand">
      <span className="brandmark">
        <Leaf size={21} />
      </span>
      <span>
        talentmatch<span className="brand-dot">.</span>
      </span>
    </div>
  );
}
function Tag({ children, green = false }) {
  return <span className={`tag ${green ? "green" : ""}`}>{children}</span>;
}
function App() {
  const [initialized, setInitialized] = useState(false),
    [fatal, setFatal] = useState(""),
    [profile, setProfile] = useState(null),
    [opportunities, setOpportunities] = useState([]),
    [applications, setApplications] = useState([]),
    [documents, setDocuments] = useState([]),
    [page, setPage] = useState("dashboard"),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [selected, setSelected] = useState(null),
    [publishing, setPublishing] = useState(false);
  const company = profile?.role === "company";
  async function load() {
    const [p, o, a, d] = await Promise.all([
      request("/me"),
      request("/opportunities"),
      request("/applications"),
      request("/documents"),
    ]);
    setProfile(p);
    setOpportunities(o);
    setApplications(a);
    setDocuments(d);
  }
  useEffect(() => {
    ready
      .then(async (logged) => {
        setInitialized(true);
        if (logged) {
          setLoading(true);
          try {
            await load();
          } catch (e) {
            setError(e.message);
          } finally {
            setLoading(false);
          }
        }
      })
      .catch(() =>
        setFatal(
          "No pudimos conectar con Keycloak. Verifica que los servicios estén iniciados y vuelve a intentar.",
        ),
      );
  }, []);
  async function act(fn, message) {
    setError("");
    setNotice("");
    try {
      await fn();
      await load();
      if (message) setNotice(message);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  }
  const nav = company
    ? [
        ["dashboard", "Vista general"],
        ["opportunities", "Mis prácticas"],
        ["applications", "Candidatos"],
        ["profile", "Mi empresa"],
      ]
    : [
        ["dashboard", "Vista general"],
        ["opportunities", "Explorar prácticas"],
        ["applications", "Mis postulaciones"],
        ["profile", "Mi perfil"],
      ];
  if (fatal)
    return (
      <div className="boot">
        <Brand />
        <p role="alert">{fatal}</p>
        <button onClick={() => location.reload()}>Reintentar</button>
      </div>
    );
  if (!initialized)
    return (
      <div className="boot">
        <Brand />
        <LoaderCircle className="spin" />
        <p>Preparando tu próximo paso…</p>
      </div>
    );
  if (!auth.authenticated)
    return (
      <div className="landing">
        <header>
          <Brand />
          <span className="local-label">Desarrollo profesional · MVP</span>
        </header>
        <main>
          <div className="eyebrow">
            <span /> TU TALENTO TIENE UN LUGAR
          </div>
          <h1>
            Tu próximo paso
            <br />
            empieza con <em>lo que sabes.</em>
          </h1>
          <p>
            Descubre prácticas que conectan contigo, identifica nuevas
            habilidades y construye el camino hacia tu futuro profesional.
          </p>
          <div className="landing-actions">
            <button onClick={() => auth.login()}>
              Ingresar a TalentMatch <ArrowUpRight size={18} />
            </button>
            <button className="secondary" onClick={() => auth.register()}>
              Crear cuenta de estudiante
            </button>
          </div>
          <div className="demo">
            <strong>Explora el prototipo</strong>
            <p>
              Estudiante: <code>estudiante</code> · Empresa:{" "}
              <code>empresa</code>
              <br />
              Contraseña de ambas cuentas: <code>Demo2026!</code>
            </p>
          </div>
        </main>
        <div className="landing-art">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="art-center">
            <Leaf size={62} />
          </div>
          <div className="floating f-one">
            <CheckCircle2 /> Habilidades con propósito
          </div>
          <div className="floating f-two">
            <Sparkles /> Tu siguiente oportunidad
          </div>
          <span className="art-foot">APRENDE. CONECTA. CRECE.</span>
        </div>
        <footer>
          TalentMatch IA · Electiva 5{" "}
          <span>Hecho para dar el primer paso.</span>
        </footer>
      </div>
    );
  return (
    <div className="shell">
      <aside>
        <Brand />
        <button
          className="mobile-logout icon-button"
          aria-label="Cerrar sesión en móvil"
          onClick={() => auth.logout({ redirectUri: location.origin })}
        >
          <LogOut size={19} />
        </button>
        <div className="workspace">
          <span className="workspace-icon">
            {company ? <Building2 size={20} /> : <GraduationCap size={20} />}
          </span>
          <div>
            <strong>
              {company ? "Portal de empresa" : "Espacio del estudiante"}
            </strong>
            <small>Tu futuro, en movimiento</small>
          </div>
        </div>
        <span className="nav-label">MI ESPACIO</span>
        <nav>
          {nav.map(([key, label]) => {
            const Icon = icons[key];
            return (
              <button
                key={key}
                className={page === key ? "active" : ""}
                onClick={() => {
                  setPage(key);
                  setError("");
                  setNotice("");
                }}
              >
                <Icon size={19} />
                {label}
                {page === key && <span className="nav-dot" />}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-note">
          <Sparkles size={21} />
          <h4>
            Pequeños pasos.
            <br />
            Grandes oportunidades.
          </h4>
          <p>
            {company
              ? "Encuentra el talento que hará crecer tus ideas."
              : "Cada habilidad que aprendes abre una nueva puerta."}
          </p>
        </div>
        <div className="account">
          <div className="avatar">
            {(profile?.name || "TM")
              .split(" ")
              .slice(0, 2)
              .map((s) => s[0])
              .join("")}
          </div>
          <div>
            <strong>{profile?.name || "Mi cuenta"}</strong>
            <small>{company ? "Empresa" : "Estudiante"}</small>
          </div>
          <button
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="icon-button"
            onClick={() => auth.logout({ redirectUri: location.origin })}
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <span>
            Mi espacio <ChevronRight size={14} />{" "}
            <strong>{nav.find((n) => n[0] === page)?.[1]}</strong>
          </span>
          <span className="top-status">
            <span /> Entorno local <Tag>MVP 01</Tag>
          </span>
        </header>
        <main className="content">
          {error && (
            <div className="alert error" role="alert">
              {error}
              <button className="text-button" onClick={() => act(load)}>
                Reintentar
              </button>
            </div>
          )}
          {notice && (
            <div className="alert success" role="status">
              {notice}
            </div>
          )}
          {loading && !profile ? (
            <div className="empty">
              <LoaderCircle className="spin" /> Cargando tu espacio…
            </div>
          ) : !profile ? (
            <div className="empty">
              No pudimos cargar tu perfil.
              <button onClick={() => act(load)}>Reintentar</button>
            </div>
          ) : (
            <>
              {page === "dashboard" && (
                <Dashboard
                  {...{
                    profile,
                    opportunities,
                    applications,
                    company,
                    setPage,
                    setSelected,
                    setPublishing,
                  }}
                />
              )}
              {page === "opportunities" && (
                <Opportunities
                  {...{
                    opportunities,
                    company,
                    setSelected,
                    setPublishing,
                    act,
                  }}
                />
              )}
              {page === "profile" && (
                <Profile
                  key={profile.updated_at}
                  {...{ profile, documents, company, act }}
                />
              )}
              {page === "applications" && (
                <Applications {...{ applications, company, act }} />
              )}
            </>
          )}
          <footer className="page-footer">
            <span>
              TalentMatch IA <span className="footer-dot">·</span> Crece a tu
              ritmo.
            </span>
            <span>Prototipo académico · 2026</span>
          </footer>
        </main>
      </div>
      {selected && (
        <OpportunityModal
          opportunity={selected}
          {...{ documents, applications, act }}
          close={() => setSelected(null)}
        />
      )}{" "}
      {publishing && (
        <PublishModal close={() => setPublishing(false)} act={act} />
      )}
    </div>
  );
}
function PageHeading({ eyebrow, title, description, children }) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
function Dashboard({
  profile,
  opportunities,
  applications,
  company,
  setPage,
  setSelected,
  setPublishing,
}) {
  const complete = Math.round(
    ([
      !!profile.name,
      !!profile.career,
      profile.skills.length > 0,
      !!profile.bio,
      !!profile.projects,
      !!profile.certifications,
    ].filter(Boolean).length /
      6) *
      100,
  );
  const gaps = [...new Set(opportunities.flatMap((o) => o.missing))].slice(
    0,
    5,
  );
  return (
    <>
      <PageHeading
        eyebrow={
          company
            ? "EL TALENTO EMPIEZA AQUÍ"
            : "UN NUEVO DÍA, NUEVAS POSIBILIDADES"
        }
        title={
          <>
            Hola, {profile.name.split(" ")[0]} <span className="wave">✳</span>
          </>
        }
        description={
          company
            ? "Conecta tus oportunidades con la próxima generación de profesionales."
            : "Cada paso cuenta. Encuentra la práctica que conecta con tu talento."
        }
      >
        <span className="date-label">{date(new Date())}</span>
      </PageHeading>
      <section className="hero">
        <div>
          <span className="hero-label">
            <span />{" "}
            {company ? "CRECE CON NUEVO TALENTO" : "TU CARRERA, TU CAMINO"}
          </span>
          <h2>
            {company ? (
              <>
                Una gran idea merece
                <br />
                un gran equipo.
              </>
            ) : (
              <>
                Lo que sabes hoy.
                <br />
                Lo que puedes lograr mañana.
              </>
            )}
          </h2>
          <p>
            {company
              ? "Publica tus prácticas y acompaña a los profesionales del futuro."
              : "Conoce tus fortalezas, descubre lo que te falta y encuentra una oportunidad para ponerlo todo en práctica."}
          </p>
          <button
            className="light-button"
            onClick={() =>
              company ? setPublishing(true) : setPage("opportunities")
            }
          >
            {company ? "Publicar una práctica" : "Explorar mis oportunidades"}
            <ArrowUpRight size={18} />
          </button>
        </div>
        <div className="hero-visual">
          <div className="hero-ring" />
          <div className="hero-ring ring-two" />
          <div className="hero-spark">
            <Sparkles size={38} />
          </div>
          <span className="hero-floating">
            <Check size={16} /> El siguiente paso es tuyo
          </span>
        </div>
        <span className="hero-number">01 / TU SIGUIENTE CAPÍTULO</span>
      </section>
      <div className="stats">
        <Stat
          icon={company ? BriefcaseBusiness : UserRound}
          label={company ? "Prácticas publicadas" : "Perfil profesional"}
          value={company ? opportunities.length : `${complete}%`}
          detail={
            company
              ? "Oportunidades de tu empresa"
              : "De información completada"
          }
          onClick={() => setPage(company ? "opportunities" : "profile")}
        />
        <Stat
          icon={Target}
          label={company ? "Prácticas abiertas" : "Prácticas disponibles"}
          value={
            company
              ? opportunities.filter((o) => o.active).length
              : opportunities.length
          }
          detail={
            company
              ? "Recibiendo postulaciones"
              : "Ordenadas según tus habilidades"
          }
          onClick={() => setPage("opportunities")}
        />
        <Stat
          icon={FileText}
          label={company ? "Postulaciones recibidas" : "Mis postulaciones"}
          value={applications.length}
          detail={
            company
              ? "Conoce a tus candidatos"
              : `${applications.filter((a) => !["Aceptada", "No seleccionada"].includes(a.status)).length} en proceso de selección`
          }
          onClick={() => setPage("applications")}
        />
      </div>
      <div className="dashboard-grid">
        <section>
          <div className="section-heading">
            <div>
              <h2>
                {company ? "Tus últimas prácticas" : "Oportunidades para ti"}
                <span className="count">{opportunities.length}</span>
              </h2>
              <p>
                {company
                  ? "Así se ven tus oportunidades publicadas."
                  : "Tu talento y el mercado, un poco más cerca."}
              </p>
            </div>
            <button
              className="text-button"
              onClick={() => setPage("opportunities")}
            >
              Ver todas <ArrowRight size={16} />
            </button>
          </div>
          <div className="opportunity-list">
            {opportunities.slice(0, 3).map((o) => (
              <OpportunityCard
                key={o.id}
                opportunity={o}
                company={company}
                onClick={() =>
                  company ? setPage("opportunities") : setSelected(o)
                }
              />
            ))}
            {!opportunities.length && (
              <Empty text="Todavía no hay prácticas publicadas." />
            )}
          </div>
        </section>
        <section className="growth-panel">
          <span className="growth-icon">
            <Leaf size={23} />
          </span>
          <div className="eyebrow">
            {company ? "CONECTA CON PERSONAS" : "DA EL SIGUIENTE PASO"}
          </div>
          <h2>
            {company
              ? "El potencial también cuenta."
              : "Tu próxima habilidad empieza aquí."}
          </h2>
          <p>
            {company
              ? "Revisa las habilidades y proyectos de tus candidatos para conocer su potencial."
              : "Estas habilidades aparecen en las prácticas disponibles y todavía no están en tu perfil."}
          </p>
          <div className="gap-tags">
            {!company && gaps.map((g) => <Tag key={g}>{g}</Tag>)}
          </div>
          <div className="growth-bottom">
            <span className="small-line" />
            <p>
              {company
                ? "Abre una conversación con el futuro de tu equipo."
                : "Abre una práctica y solicita un plan de aprendizaje con IA local."}
            </p>
            <button
              className="secondary"
              onClick={() =>
                setPage(company ? "applications" : "opportunities")
              }
            >
              {company ? "Revisar candidatos" : "Descubrir mis brechas"}
              <ArrowUpRight size={16} />
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
function Stat({ icon: Icon, label, value, detail, onClick }) {
  return (
    <button className="stat" onClick={onClick}>
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
function OpportunityCard({ opportunity: o, company, onClick }) {
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
function Opportunities({
  opportunities,
  company,
  setSelected,
  setPublishing,
  act,
}) {
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
          <button onClick={() => setPublishing(true)}>
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
              onClick={() => (company ? null : setSelected(o))}
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
        <Empty text="No encontramos prácticas con estos filtros." />
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
function Profile({ profile, documents, company, act }) {
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
            skills: skillList(form.skills),
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
          <Field
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
              <Field
                label="Carrera"
                name="career"
                value={form.career}
                onChange={change}
                maxLength={160}
              />
              <Field
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
              <Field
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
function Field({ label, ...props }) {
  return (
    <label>
      {label}
      <input {...props} />
    </label>
  );
}
function Applications({ applications, company, act }) {
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
                <p>Postulación enviada el {date(a.created_at)}</p>
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
        <Empty
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
function Modal({ children, close, title }) {
  useEffect(() => {
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previous = document.activeElement;
    const el = document.querySelector('[role="dialog"]');
    const focusables = () =>
      el?.querySelectorAll(
        'button:not(:disabled),input,select,textarea,[tabindex="0"]',
      );
    focusables()?.[0]?.focus();
    function key(e) {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const nodes = focusables();
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          className="modal-close icon-button"
          aria-label="Cerrar"
          onClick={close}
        >
          <X size={22} />
        </button>
        {children}
      </section>
    </div>
  );
}
function OpportunityModal({
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
function PublishModal({ close, act }) {
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
              body: JSON.stringify({ ...form, skills: skillList(form.skills) }),
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
        <Field
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
          <Field
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
        <Field
          label="Ubicación"
          name="location"
          required
          minLength={2}
          maxLength={120}
          value={form.location}
          onChange={change}
        />
        <Field
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
function Empty({ text }) {
  return (
    <div className="empty">
      <BriefcaseBusiness size={30} />
      <p>{text}</p>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
