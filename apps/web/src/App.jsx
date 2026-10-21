import React from "react";
import AppRoutes from "./routes/AppRoutes.jsx";
import BootScreen from "./components/ui/BootScreen.jsx";
import { useTalentMatch } from "./hooks/useTalentMatch.js";

export default function App() {
  const { initialized, loading, fatal, error, authenticated, profile, act } =
    useTalentMatch();
  if (fatal)
    return <BootScreen error={fatal} onRetry={() => location.reload()} />;
  if (!initialized || (authenticated && loading && !profile))
    return <BootScreen />;
  if (authenticated && !profile)
    return (
      <BootScreen
        error={error || "No pudimos cargar tu perfil."}
        onRetry={() => act(async () => {})}
      />
    );
  return <AppRoutes />;
}
