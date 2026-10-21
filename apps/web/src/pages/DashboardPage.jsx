import { ArrowUpRight } from "lucide-react";
import React from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  UserRound,
  FileText,
  Sparkles,
  Check,
  Target,
  Leaf,
} from "lucide-react";
import Tag from "../components/ui/Tag.jsx";
import PageHeading from "../components/ui/PageHeading.jsx";
import StatCard from "../components/dashboard/StatCard.jsx";
import OpportunityCard from "../components/opportunities/OpportunityCard.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { formatDate } from "../utils/format.js";
import { useTalentMatch } from "../hooks/useTalentMatch.js";
import { useOutletContext, useNavigate } from "react-router-dom";
import { getPortalPaths } from "../routes/paths.js";

export default function DashboardPage() {
  const { profile, opportunities, applications, company } = useTalentMatch();
  const { openOpportunity, openPublish } = useOutletContext();
  const navigate = useNavigate();
  const paths = getPortalPaths(company ? "company" : "student");

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
        <span className="date-label">{formatDate(new Date())}</span>
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
              company ? openPublish() : navigate(paths.opportunities)
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
        <StatCard
          icon={company ? BriefcaseBusiness : UserRound}
          label={company ? "Prácticas publicadas" : "Perfil profesional"}
          value={company ? opportunities.length : `${complete}%`}
          detail={
            company
              ? "Oportunidades de tu empresa"
              : "De información completada"
          }
          onClick={() =>
            navigate(company ? paths.opportunities : paths.profile)
          }
        />
        <StatCard
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
          onClick={() => navigate(paths.opportunities)}
        />
        <StatCard
          icon={FileText}
          label={company ? "Postulaciones recibidas" : "Mis postulaciones"}
          value={applications.length}
          detail={
            company
              ? "Conoce a tus candidatos"
              : `${applications.filter((a) => !["Aceptada", "No seleccionada"].includes(a.status)).length} en proceso de selección`
          }
          onClick={() => navigate(paths.applications)}
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
              onClick={() => navigate(paths.opportunities)}
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
                  company ? navigate(paths.opportunities) : openOpportunity(o)
                }
              />
            ))}
            {!opportunities.length && (
              <EmptyState text="Todavía no hay prácticas publicadas." />
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
                navigate(company ? paths.applications : paths.opportunities)
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
