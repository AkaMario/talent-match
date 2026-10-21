import {
  LayoutDashboard,
  BriefcaseBusiness,
  UserRound,
  FileText,
} from "lucide-react";
import { getPortalPaths } from "./paths.js";

export function getNavigation(role) {
  const paths = getPortalPaths(role);
  const company = role === "company";
  return [
    {
      path: paths.home,
      label: "Vista general",
      icon: LayoutDashboard,
      end: true,
    },
    {
      path: paths.opportunities,
      label: company ? "Mis prácticas" : "Explorar prácticas",
      icon: BriefcaseBusiness,
    },
    {
      path: paths.applications,
      label: company ? "Candidatos" : "Mis postulaciones",
      icon: FileText,
    },
    {
      path: paths.profile,
      label: company ? "Mi empresa" : "Mi perfil",
      icon: UserRound,
    },
  ];
}
