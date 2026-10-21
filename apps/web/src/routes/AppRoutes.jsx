import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useTalentMatch } from "../hooks/useTalentMatch.js";
import PortalLayout from "../layouts/PortalLayout.jsx";
import LandingPage from "../pages/LandingPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import OpportunitiesPage from "../pages/OpportunitiesPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import ApplicationsPage from "../pages/ApplicationsPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import RequireRole from "./RequireRole.jsx";
import { PORTALS, getPortalPaths } from "./paths.js";

function EntryRoute() {
  const { authenticated, profile } = useTalentMatch();
  return authenticated ? (
    <Navigate to={getPortalPaths(profile.role).home} replace />
  ) : (
    <LandingPage />
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<EntryRoute />} />
      {Object.entries(PORTALS).map(([role, portal]) => (
        <Route
          key={role}
          path={`/${portal.root}`}
          element={<RequireRole role={role} />}
        >
          <Route element={<PortalLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="practicas" element={<OpportunitiesPage />} />
            <Route path="perfil" element={<ProfilePage />} />
            <Route path={portal.applications} element={<ApplicationsPage />} />
          </Route>
        </Route>
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
