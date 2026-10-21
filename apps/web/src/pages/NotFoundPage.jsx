import React from "react";
import { Link } from "react-router-dom";
import Brand from "../components/ui/Brand.jsx";
import { useTalentMatch } from "../hooks/useTalentMatch.js";
import { getPortalPaths } from "../routes/paths.js";

export default function NotFoundPage() {
  const { authenticated, profile } = useTalentMatch();
  return (
    <div className="boot">
      <Brand />
      <h1>Página no encontrada</h1>
      <p>La dirección que abriste no corresponde a una vista de TalentMatch.</p>
      <Link
        className="secondary route-link"
        to={authenticated ? getPortalPaths(profile.role).home : "/"}
      >
        Volver al inicio
      </Link>
    </div>
  );
}
