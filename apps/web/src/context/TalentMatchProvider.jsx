import React, { useCallback, useEffect, useState } from "react";
import { TalentMatchContext } from "./TalentMatchContext.js";
import { auth, ready } from "../services/auth.js";
import { request } from "../services/api.js";

export default function TalentMatchProvider({ children }) {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fatal, setFatal] = useState("");
  const [profile, setProfile] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const [profile, opportunities, applications, documents] = await Promise.all(
      [
        request("/me"),
        request("/opportunities"),
        request("/applications"),
        request("/documents"),
      ],
    );
    setProfile(profile);
    setOpportunities(opportunities);
    setApplications(applications);
    setDocuments(documents);
  }, []);

  const clearFeedback = useCallback(() => {
    setError("");
    setNotice("");
  }, []);

  const act = useCallback(
    async (operation, message) => {
      clearFeedback();
      try {
        await operation();
        await load();
        if (message) setNotice(message);
        return true;
      } catch (error) {
        setError(error.message || "No se pudo completar la operación.");
        return false;
      }
    },
    [clearFeedback, load],
  );

  useEffect(() => {
    let active = true;
    ready
      .then(async (authenticated) => {
        if (!active) return;
        setInitialized(true);
        try {
          if (authenticated) await load();
        } catch (error) {
          if (active) setError(error.message);
        } finally {
          if (active) setLoading(false);
        }
      })
      .catch(() => {
        if (active)
          setFatal(
            "No pudimos conectar con Keycloak. Verifica que los servicios estén iniciados y vuelve a intentar.",
          );
      });
    return () => {
      active = false;
    };
  }, [load]);

  return (
    <TalentMatchContext.Provider
      value={{
        initialized,
        loading,
        fatal,
        authenticated: auth.authenticated,
        profile,
        company: profile?.role === "company",
        opportunities,
        applications,
        documents,
        error,
        notice,
        act,
        clearFeedback,
      }}
    >
      {children}
    </TalentMatchContext.Provider>
  );
}
