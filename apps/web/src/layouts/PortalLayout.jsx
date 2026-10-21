import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Sidebar from "./Sidebar.jsx";
import Tag from "../components/ui/Tag.jsx";
import OpportunityModal from "../components/opportunities/OpportunityModal.jsx";
import PublishOpportunityModal from "../components/opportunities/PublishOpportunityModal.jsx";
import { useTalentMatch } from "../hooks/useTalentMatch.js";
import { getNavigation } from "../routes/navigation.js";

export default function PortalLayout() {
  const {
    profile,
    company,
    documents,
    applications,
    error,
    notice,
    act,
    clearFeedback,
  } = useTalentMatch();
  const [selected, setSelected] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const { pathname } = useLocation();
  const title = getNavigation(profile.role).find(
    (item) => item.path === pathname,
  )?.label;

  useEffect(() => {
    clearFeedback();
    setSelected(null);
    setPublishing(false);
    window.scrollTo(0, 0);
  }, [pathname, clearFeedback]);

  return (
    <div className="shell flex min-h-screen max-sm:block">
      <Sidebar />
      <div className="main-wrap">
        <header className="topbar">
          <span>
            Mi espacio <ChevronRight size={14} />
            <strong>{title}</strong>
          </span>
          <span className="top-status">
            <span />
            Entorno local <Tag>MVP 01</Tag>
          </span>
        </header>
        <main className="content mx-auto max-w-[1450px]">
          {error && (
            <div className="alert error" role="alert">
              {error}
              <button
                className="text-button"
                onClick={() => act(async () => {})}
              >
                Reintentar
              </button>
            </div>
          )}
          {notice && (
            <div className="alert success" role="status">
              {notice}
            </div>
          )}
          <Outlet
            context={{
              openOpportunity: setSelected,
              openPublish: () => setPublishing(true),
            }}
          />
          <footer className="page-footer">
            <span>
              TalentMatch IA <span className="footer-dot">·</span> Crece a tu
              ritmo.
            </span>
            <span>Prototipo académico · 2026</span>
          </footer>
        </main>
      </div>
      {selected && !company && (
        <OpportunityModal
          opportunity={selected}
          documents={documents}
          applications={applications}
          act={act}
          close={() => setSelected(null)}
        />
      )}
      {publishing && company && (
        <PublishOpportunityModal close={() => setPublishing(false)} act={act} />
      )}
    </div>
  );
}
