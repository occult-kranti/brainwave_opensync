// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useNavigate, type NavigateFunction } from "react-router";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { SessionProvider } from "@/ui/session/SessionContext";
import { LiveEngine } from "@/ui/audio/liveEngine";
import { SpatialProvider } from "../SpatialProvider";
import { useSpatial } from "../spatialContext";
import { WorldToolbar } from "../WorldToolbar";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
let spatial: ReturnType<typeof useSpatial>, navigate: NavigateFunction;
function Probe() {
  spatial = useSpatial();
  navigate = useNavigate();
  return null;
}
beforeEach(async () => {
  localStorage.clear();
  vi.spyOn(LiveEngine.prototype, "start").mockReturnValue(true);
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () =>
    root.render(
      <MemoryRouter>
        <SessionProvider>
          <SpatialProvider>
            <Probe />
            <WorldToolbar theme="night-country" onThemeChange={() => {}} />
          </SpatialProvider>
        </SessionProvider>
      </MemoryRouter>,
    ),
  );
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  localStorage.clear();
});
async function click(label: string) {
  const button = Array.from(
    host.querySelectorAll<HTMLButtonElement>("button"),
  ).find(
    (b) => b.getAttribute("aria-label") === label || b.textContent === label,
  );
  expect(button, label).toBeDefined();
  await act(async () => button!.click());
}
it("keeps world choices through navigation without starting or reconfiguring sound", async () => {
  await click("Zoom in world");
  await click("4D");
  await click("Pause world motion");
  const details = host.querySelector("details")!;
  details.open = true;
  await act(async () => navigate("/studio"));
  expect(details.open).toBe(false);
  expect(spatial?.settings).toMatchObject({
    dimension: "4d",
    zoom: 1.1,
    motion: false,
  });
  expect(LiveEngine.prototype.start).not.toHaveBeenCalled();
});
it("Escape dismisses scene settings, returns focus, and retains the chosen view", async () => {
  const details = host.querySelector("details")!;
  details.open = true;
  await click("Particles");
  await act(async () =>
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  expect(details.open).toBe(false);
  expect(document.activeElement).toBe(details.querySelector("summary"));
  expect(spatial?.settings.material).toBe("particles");
});
