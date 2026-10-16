import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Orbit,
  Waves,
  BookOpen,
} from "lucide-react";
import { PRESETS } from "@/data/presets";
import { ResonanceField } from "@/ui/visuals/ResonanceField";
import { assetUrl, projectUrl } from "@/lib/assetUrl";
import "./experience.css";

const INTENTIONS = [
  ["practice", "Meditation", "Make room for attention."],
  ["hypnosis", "Self-hypnosis", "Imagery, rhythm and suggestion."],
  ["sleep", "Sleep & dreaming", "Find a softer end to the day."],
  ["focus", "Focus", "A steady background for your work."],
  ["nature", "Nature", "Calls, rain and natural textures."],
  ["bashar", "Bashar studies", "Explore the authored sound experiments."],
];
export default function Home() {
  const [intention, setIntention] = useState("practice");
  return (
    <div className="res-home">
      <section className="res-hero" aria-labelledby="home-title">
        <img
          className="res-hero-image"
          src={assetUrl("art/resonance-gallery.webp")}
          alt="An original copper filament and glass sound sculpture suspended in a dark gallery"
          fetchPriority="high"
        />
        <div className="res-hero-shade" />
        <div className="res-hero-copy">
          <span className="res-kicker">
            <i /> AN OPEN STUDIO FOR SOUND
          </span>
          <h1 id="home-title">
            Listen.
            <br />
            See the sound.
            <br />
            <em>Stay curious.</em>
          </h1>
          <p>
            Find a listening practice. Shape your own sound.
            <br />
            Explore the geometry that connects them.
          </p>
          <div className="res-actions">
            <Link className="res-primary" to="/presets?collection=all">
              Find a sound <ArrowUpRight size={18} />
            </Link>
            <Link className="res-text-link" to="/cymatics">
              Enter the visual lab <ArrowRight size={17} />
            </Link>
          </div>
          <span className="res-hero-note">
            No account. Sound starts when you choose.
          </span>
        </div>
        <div className="res-art-credit">
          <span>STUDY 01 — RESONANCE</span>
          <span>Original generative artwork</span>
        </div>
      </section>
      <nav className="res-paths" aria-label="Choose your workspace">
        {[
          {
            to: "/presets?collection=all",
            number: "01",
            title: "Listen",
            description: `${PRESETS.length} sounds, organised by intention`,
            icon: AudioLines,
          },
          {
            to: "/studio",
            number: "02",
            title: "Create",
            description: "Tones, textures and your own mixes",
            icon: Waves,
          },
          {
            to: "/cymatics",
            number: "03",
            title: "Visualise",
            description: "Cymatics, 3D surfaces and 4D forms",
            icon: Orbit,
          },
          {
            to: "/research-hub",
            number: "04",
            title: "Understand",
            description: "Sources, experiments and open questions",
            icon: BookOpen,
          },
        ].map(({ to, number, title, description, icon: Icon }) => (
          <Link to={to} key={to}>
            <span className="res-path-number">{number}</span>
            <Icon size={23} strokeWidth={1.3} />
            <div>
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
            <ArrowUpRight size={16} />
          </Link>
        ))}
      </nav>
      <section className="res-practice">
        <div>
          <span className="res-kicker">A SOUND FOR THIS MOMENT</span>
          <h2>
            Where would you
            <br />
            like to begin?
          </h2>
          <p>
            Choose an intention, then preview a sound before loading it into
            your player.
          </p>
        </div>
        <div>
          <div className="res-intentions">
            {INTENTIONS.map(([id, title, note]) => (
              <button
                key={id}
                aria-pressed={intention === id}
                onClick={() => setIntention(id)}
              >
                <span>{title}</span>
                <small>{note}</small>
                <ArrowUpRight size={15} />
              </button>
            ))}
          </div>
          <Link className="res-primary" to={`/presets?collection=${intention}`}>
            Explore{" "}
            {INTENTIONS.find((i) => i[0] === intention)?.[1].toLowerCase()}{" "}
            <ArrowRight size={16} />
          </Link>
          <Link className="res-text-link" to="/meditate">
            Help me choose
          </Link>
        </div>
      </section>
      <section className="res-geometry">
        <div className="res-geometry-copy">
          <span className="res-kicker">THE VISUAL LAB</span>
          <h2>
            Sound has a shape.
            <br />
            <em>Take a closer look.</em>
          </h2>
          <p>
            Turn a toroidal field. Rotate a Clifford torus through its fourth
            coordinate. Change a virtual plate and watch its nodal patterns
            emerge.
          </p>
          <Link className="res-primary" to="/cymatics">
            Open Cymatics <ArrowUpRight size={18} />
          </Link>
          <small>
            These are mathematical models and artworks. They are not
            measurements of your brain or body.
          </small>
        </div>
        <div className="res-live-field">
          <ResonanceField />
          <span className="res-kicker">
            INTERACTIVE GEOMETRY · DRAG TO TURN
          </span>
        </div>
      </section>
      <section className="res-notebook">
        <div>
          <span className="res-kicker">FOLLOW YOUR CURIOSITY</span>
          <h2>There is more to explore.</h2>
        </div>
        <div className="res-note-links">
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
              <ArrowUpRight size={20} />
            </Link>
          ))}
        </div>
      </section>
      <footer className="res-footer">
        <strong>Open Sync</strong>
        <span>An open space for sound & geometry.</span>
        <Link to="/research-hub#tools">All tools</Link>
        <Link to="/safety">Listening safely</Link>
        <a href={projectUrl("previous/")}>Previous version ↗</a>
        <a href={projectUrl("")}>Original workspace ↗</a>
      </footer>
    </div>
  );
}
