import { useContext } from "react";
import { TalentMatchContext } from "../context/TalentMatchContext.js";

export function useTalentMatch() {
  const context = useContext(TalentMatchContext);
  if (!context) throw new Error("useTalentMatch requiere TalentMatchProvider.");
  return context;
}
