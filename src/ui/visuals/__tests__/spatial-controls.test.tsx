// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  MemoryRouter,
  Routes,
  Route,
  useNavigate,
  type NavigateFunction,
} from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionProvider } from "@/ui/session/SessionContext";
import { useSession } from "@/ui/session/useSession";
import { LiveEngine } from "@/ui/audio/liveEngine";
import { seedAdvisoryAck } from "@/test/helpers";
import { readJson, STORAGE_KEYS, writeJson } from "@/lib/storage";
import { SpatialProvider } from "../SpatialProvider";
import { ResonanceField } from "../ResonanceField";
import { SpatialPortal } from "../SpatialEnvironment";
import { sanitizeSpatial, type SpatialSettings } from "../spatialState";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root, host: HTMLDivElement;
let session: ReturnType<typeof useSession>, navigate: NavigateFunction;
function Probe() {
  session = useSession();
  navigate = useNavigate();
  return null;
}
async function mount() {
  await act(async () =>
    root.render(
      <MemoryRouter>
        <SessionProvider>
          <SpatialProvider>
            <Probe />
            <SpatialPortal />
            <Routes>
              <Route path="/" element={<ResonanceField />} />
              <Route path="/next" element={<ResonanceField compact />} />
            </Routes>
          </SpatialProvider>
        </SessionProvider>
      </MemoryRouter>,
    ),
  );
}
function button(label: string, scope: ParentNode = host) {
  return Array.from(scope.querySelectorAll<HTMLButtonElement>("button")).find(
    (b) => b.getAttribute("aria-label") === label || b.textContent === label,
  )!;
}
async function click(label: string, scope: ParentNode = host) {
  await act(async () => button(label, scope).click());
}
beforeEach(() => {
  window.localStorage.clear();
  seedAdvisoryAck();
  vi.spyOn(LiveEngine.prototype, "start").mockReturnValue(true);
  vi.spyOn(LiveEngine.prototype, "pause").mockImplementation(() => {});
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("Spatial controls and audio isolation", () => {
  it("zooms both projections, clamps both limits, resets the view and preserves geometry across routes", async () => {
    await mount();
    await click("Zoom in geometry");
    expect(
      host.querySelector('[aria-label="Geometry zoom"]')?.textContent,
    ).toBe("110%");
    await click("4D");
    expect(host.querySelector("canvas")?.getAttribute("aria-label")).toContain(
      "Clifford",
    );
    for (let i = 0; i < 20; i++) await click("Zoom in geometry");
    expect(button("Zoom in geometry").disabled).toBe(true);
    expect(
      host.querySelector('[aria-label="Geometry zoom"]')?.textContent,
    ).toBe("180%");
    for (let i = 0; i < 20; i++) await click("Zoom out geometry");
    expect(button("Zoom out geometry").disabled).toBe(true);
    expect(
      host.querySelector('[aria-label="Geometry zoom"]')?.textContent,
    ).toBe("50%");
    await click("Reset view");
    await act(async () => navigate("/next"));
    expect(button("4D").getAttribute("aria-pressed")).toBe("true");
    expect(
      host.querySelector('[aria-label="Geometry zoom"]')?.textContent,
    ).toBe("100%");
    expect(readJson<SpatialSettings>(STORAGE_KEYS.spatial, 1)?.dimension).toBe(
      "4d",
    );
    expect(LiveEngine.prototype.start).not.toHaveBeenCalled();
  });
  it("keeps an active sound unchanged through zoom, dimension, rotation, motion and immersive view; panic closes the room", async () => {
    await mount();
    await act(async () => {
      session.start();
    });
    expect(session.running).toBe(true);
    const phases = session.phases,
      carrier = session.carrierHz;
    await click("Zoom in geometry");
    await click("4D");
    await click("Rotate geometry left");
    await click("Pause visual motion");
    await click("Open immersive visual space");
    const room = document.querySelector<HTMLElement>(".spatial-room")!;
    expect(room).not.toBeNull();
    await click("Zoom out geometry", room);
    await click("Particles", room);
    expect(session.running).toBe(true);
    expect(session.paused).toBe(false);
    expect(session.phases).toBe(phases);
    expect(session.carrierHz).toBe(carrier);
    expect(LiveEngine.prototype.start).toHaveBeenCalledTimes(1);
    await act(async () => {
      button("Stop all sound", room).click();
    });
    expect(session.running).toBe(false);
    expect(session.panicked).toBe(true);
    expect(document.querySelector(".spatial-room")).toBeNull();
  });
  it("recovers from malformed visual preferences and honors reduced motion even when motion was saved on", async () => {
    expect(
      sanitizeSpatial({
        zoom: Infinity,
        fourth: NaN,
        dimension: "5d",
        material: "bad",
      }),
    ).toMatchObject({ zoom: 1, fourth: 30, dimension: "3d", material: "silk" });
    writeJson(STORAGE_KEYS.spatial, 1, {
      zoom: 1000,
      motion: true,
      dimension: "4d",
    });
    const original = window.matchMedia.bind(window);
    vi.spyOn(window, "matchMedia").mockImplementation((query) =>
      query.includes("prefers-reduced-motion")
        ? {
            ...original(query),
            matches: true,
            addEventListener: () => {},
            removeEventListener: () => {},
          }
        : original(query),
    );
    await mount();
    expect(button("Animate geometry")).toBeDefined();
    expect(
      host.querySelector('[aria-label="Geometry zoom"]')?.textContent,
    ).toBe("180%");
    expect(host.textContent).toContain("3D rendering unavailable");
  });
});
