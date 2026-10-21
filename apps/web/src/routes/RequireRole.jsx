import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useTalentMatch } from "../hooks/useTalentMatch.js";
import LandingPage from "../pages/LandingPage.jsx";
import { getPortalPaths } from "./paths.js";

export default function RequireRole({ role }) {
  const { authenticated, profile } = useTalentMatch();
  if (!authenticated) return <LandingPage />;
  if (profile.role !== role)
    return <Navigate to={getPortalPaths(profile.role).home} replace />;
  return <Outlet />;
}
