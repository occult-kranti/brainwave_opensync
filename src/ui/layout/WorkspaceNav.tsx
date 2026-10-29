import { NavLink, useLocation } from "react-router";
import { navigationForPath, entriesForCategory } from "@/app/navigation";

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
  if (pathname === "/") return null;
  const entry = navigationForPath(pathname);
  const links = LISTENING.includes(pathname)
    ? LISTENING.map((path) => ({ path, title: LABELS[path] }))
    : entriesForCategory(entry?.category ?? "research").map((item) => ({
        path: item.route.path,
        title: item.title,
      }));
  return (
    <nav className="workspace-subnav" aria-label="Related tools">
      <span>
        {LISTENING.includes(pathname)
          ? "LISTEN"
          : entry?.category === "research" || pathname === "/research-hub"
            ? "RESEARCH"
            : "WORKSPACE"}
      </span>
      {links.map((link) => (
        <NavLink key={link.path} to={link.path}>
          {link.title}
        </NavLink>
      ))}
    </nav>
  );
}
