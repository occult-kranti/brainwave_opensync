import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Minus,
  Pause,
  Play,
  Plus,
} from "lucide-react";
import { PRESETS } from "@/data/presets";
import { projectUrl } from "@/lib/assetUrl";
import { useSpatial } from "@/ui/visuals/spatialContext";
import { MAX_ZOOM, MIN_ZOOM } from "@/ui/visuals/spatialState";
import "./experience.css";

const INTENTIONS = [
  ["practice", "Meditation", "Make room for attention."],
  ["hypnosis", "Self-hypnosis", "Imagery, rhythm and suggestion."],
  ["sleep", "Sleep & dreaming", "A softer end to the day."],
  ["focus", "Focus", "A steady background for your work."],
  ["nature", "Nature", "Rain, calls and natural textures."],
  ["bashar", "Bashar studies", "Authored sound experiments."],
];
const DESTINATIONS = [
  [
    "/presets?collection=all",
    "01",
    "Sounds",
    `${PRESETS.length} original listening presets`,
  ],
  ["/studio", "02", "Studio", "Shape a sound of your own"],
  ["/cymatics", "03", "Cymatics", "Sand, surfaces & dimensional art"],
  ["/research-hub", "04", "Research", "Sources, experiments & open questions"],
];

/** The sculpture belongs to the shared world, not a second embedded canvas. */
export default function Home() {
  const [intention, setIntention] = useState("practice");
  const spatial = useSpatial();
  const selected = INTENTIONS.find(([id]) => id === intention)!;
  return (
    <div className="world-home">
      <section className="world-arrival" aria-labelledby="home-title">
        <div className="world-arrival-copy">
          <span className="world-eyebrow">
            <i /> A SPACE FOR SOUND & GEOMETRY
          </span>
          <h1 id="home-title">
            Enter
            <br />
            the <em>field.</em>
          </h1>
          <p>
            Sound you can shape.
            <br />
            Space you can explore.
          </p>
          <div className="world-arrival-actions">
            <Link className="world-primary" to="/presets?collection=all">
              Find a sound <ArrowUpRight size={18} />
            </Link>
            <Link className="world-text-link" to="/cymatics">
              Enter the visual lab <ArrowRight size={17} />
            </Link>
          </div>
          <span className="world-quiet-note">
            Sound begins only when you press play.
          </span>
        </div>
        <div className="world-scene-caption">
          <div className="world-scene-name">
            <span>LIVE STUDY / 01</span>
            <strong>
              {spatial?.settings.dimension === "4d"
                ? "Beyond the third coordinate"
                : "A field in motion"}
            </strong>
          </div>
          {spatial && (
            <div
              className="world-home-controls"
              role="group"
              aria-label="Home sculpture controls"
            >
              <div
                className="world-dimension-switch"
                role="group"
                aria-label="Sculpture dimension"
              >
                <button
                  type="button"
                  aria-pressed={spatial.settings.dimension === "3d"}
                  onClick={() =>
                    spatial.update({ dimension: "3d", ambient: true })
                  }
                >
                  3D
                </button>
                <button
                  type="button"
                  aria-pressed={spatial.settings.dimension === "4d"}
                  onClick={() =>
                    spatial.update({ dimension: "4d", ambient: true })
                  }
                >
                  4D
                </button>
              </div>
              <button
                type="button"
                aria-label={
                  spatial.settings.motion
                    ? "Pause home sculpture"
                    : "Animate home sculpture"
                }
                onClick={() =>
                  spatial.update({ motion: !spatial.settings.motion })
                }
              >
                {spatial.settings.motion ? (
                  <Pause size={14} />
                ) : (
                  <Play size={14} />
                )}
              </button>
              <button
                type="button"
                aria-label="Zoom out home sculpture"
                disabled={spatial.settings.zoom <= MIN_ZOOM}
                onClick={() => spatial.zoomBy(-0.1)}
              >
                <Minus size={15} />
              </button>
              <output aria-label="Home sculpture zoom">
                {Math.round(spatial.settings.zoom * 100)}%
              </output>
              <button
                type="button"
                aria-label="Zoom in home sculpture"
                disabled={spatial.settings.zoom >= MAX_ZOOM}
                onClick={() => spatial.zoomBy(0.1)}
              >
                <Plus size={15} />
              </button>
              {!spatial.settings.ambient && (
                <button
                  type="button"
                  onClick={() => spatial.update({ ambient: true })}
                >
                  Show scene
                </button>
              )}
            </div>
          )}
          <p>
            Generative art ·{" "}
            {spatial?.settings.dimension === "4d"
              ? "a projection of four coordinates"
              : "mathematical form, rendered live"}
          </p>
        </div>
        <nav className="world-portals" aria-label="Choose your workspace">
          {DESTINATIONS.map(([to, number, title, description]) => (
            <Link to={to} key={to}>
              <span className="world-portal-number">{number}</span>
              <div>
                <h2>{title}</h2>
                <p>{description}</p>
              </div>
              <ArrowUpRight size={19} strokeWidth={1.5} />
            </Link>
          ))}
        </nav>
        <a className="world-scroll-cue" href="#find-your-practice">
          Find your practice <ArrowDown size={13} />
        </a>
      </section>
      <section
        className="world-practice"
        id="find-your-practice"
        aria-labelledby="practice-title"
      >
        <div className="world-section-intro">
          <span className="world-eyebrow">01 / A SOUND FOR THIS MOMENT</span>
          <h2 id="practice-title">
            Where would you
            <br />
            like to begin?
          </h2>
          <p>Choose an intention. Hear a preview. Make it your own.</p>
        </div>
        <div className="world-intention-workspace">
          <div
            className="world-intentions"
            role="group"
            aria-label="Listening intention"
          >
            {INTENTIONS.map(([id, title], i) => (
              <button
                type="button"
                key={id}
                aria-pressed={intention === id}
                onClick={() => setIntention(id)}
              >
                <small>0{i + 1}</small>
                <span>{title}</span>
                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
          <div className="world-intention-result">
            <div>
              <span className="world-eyebrow">YOUR STARTING POINT</span>
              <h3>{selected[1]}</h3>
              <p>{selected[2]}</p>
            </div>
            <Link
              className="world-primary"
              to={`/presets?collection=${intention}`}
            >
              Explore {selected[1].toLowerCase()} <ArrowRight size={16} />
            </Link>
          </div>
          <Link className="world-text-link" to="/meditate">
            Help me choose <ArrowRight size={15} />
          </Link>
        </div>
      </section>
      <section
        className="world-dimension-section"
        aria-labelledby="dimension-title"
      >
        <span className="world-eyebrow">02 / THE VISUAL LAB</span>
        <div>
          <h2 id="dimension-title">
            From a grain of sand
            <br />
            to another <em>dimension.</em>
          </h2>
          <p>
            Make nodal patterns emerge. Turn a surface into a cloud of
            particles. Explore projected 4D forms, or let the sand become an
            artwork.
          </p>
          <Link className="world-primary" to="/cymatics">
            Open Cymatics <ArrowUpRight size={18} />
          </Link>
          <small>
            These are mathematical models and artworks, not measurements of your
            brain or body.
          </small>
        </div>
      </section>
      <section className="world-notebook" aria-labelledby="notebook-title">
        <div className="world-section-intro">
          <span className="world-eyebrow">03 / FOLLOW YOUR CURIOSITY</span>
          <h2 id="notebook-title">A little deeper.</h2>
          <p>
            Explore the ideas behind the sounds, with sources and limitations in
            view.
          </p>
        </div>
        <nav
          className="world-note-links"
          aria-label="Explore sound and research"
        >
          {[
            [
              "/lucid",
              "Dreaming & the mind",
              "Sleep-onset imagery, recall and cue research",
              "home-lab-lucid",
            ],
            [
              "/healing",
              "Sound & healing traditions",
              "Comfort, history and clinical limitations",
              "home-lab-healing",
            ],
            [
              "/nature",
              "Patterns in nature",
              "Acoustic portraits and natural textures",
              "home-lab-nature",
            ],
            [
              "/traditions",
              "Programs & archives",
              "Original sources and reconstruction limits",
              "",
            ],
            [
              "/overnight",
              "Plan your night",
              "Sound, transitions and quiet time",
              "",
            ],
          ].map(([to, title, note, test]) => (
            <Link key={to} to={to} data-testid={test || undefined}>
              <div>
                <h3>{title}</h3>
                <p>{note}</p>
              </div>
              <ArrowUpRight size={19} />
            </Link>
          ))}
        </nav>
      </section>
      <footer className="world-footer">
        <strong>Open Sync</strong>
        <span>Sound. Space. Possibility.</span>
        <Link to="/research-hub#tools">All tools</Link>
        <Link to="/safety">Listening safely</Link>
        <a href={projectUrl("previous/")}>Previous version ↗</a>
        <a href={projectUrl("")}>Original workspace ↗</a>
      </footer>
    </div>
  );
}
