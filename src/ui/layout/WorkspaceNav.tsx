import { NavLink, useLocation } from "react-router";
import { ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { navigationForPath, entriesForCategory, RESEARCH_LAB_PATHS } from "@/app/navigation";

const LISTENING = [
  "/presets",
  "/listen",
  "/meditate",
  "/practice-plan",
  "/overnight",
  "/hypnosis",
];
const LABELS: Record<string, string> = {
  "/presets": "Sound library",
  "/listen": "Player",
  "/meditate": "Session finder",
  "/practice-plan": "Home practice plan",
  "/overnight": "Overnight",
  "/hypnosis": "Hypnosis & dreaming",
};
export function WorkspaceNav() {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  if (pathname === "/" || pathname === "/research-hub" || RESEARCH_LAB_PATHS.some(path => path === pathname)) return null;
  const entry = navigationForPath(pathname);
  const links = LISTENING.includes(pathname)
    ? LISTENING.map((path) => ({ path, title: LABELS[path] }))
    : entriesForCategory(entry?.category ?? "research").map((item) => ({
        path: item.route.path,
        title: item.title,
      }));
  const navigation = (
    <nav className="workspace-subnav" aria-label="Related tools">
      <span>
        {LISTENING.includes(pathname)
          ? "Listening"
          : entry?.category === "research" || pathname === "/research-hub"
            ? "Reading"
            : "Related tools"}
      </span>
      {links.map((link) => (
        <NavLink key={link.path} to={link.path}>
          {link.title}
        </NavLink>
      ))}
    </nav>
  );
  return isMobile ? <details key={pathname} className="atlas-related-disclosure"><summary>Related tools <ChevronDown size={17} aria-hidden="true" /></summary>{navigation}</details> : navigation;
}
