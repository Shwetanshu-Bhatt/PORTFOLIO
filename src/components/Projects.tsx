import { useRef, useState } from 'react';
import { projects as staticProjects, type Project } from '@/data';

const projectVisuals: Record<string, { status: string; caption: string; image?: string }> = {
  'haptic-hearing': { status: 'HARDWARE', caption: 'PROTOTYPE SCHEMATIC' },
  'lahit-animal-welfare': { status: 'LIVE PLATFORM', caption: 'SITE PHOTOGRAPH', image: '/images/projects/lahit-rescue.webp' },
  'morrow-dental-clinic': { status: 'WEBSITE CONCEPT', caption: 'DEMO IMAGE', image: '/images/projects/morrow-dental.avif' },
  'qa-engine': { status: 'INTERNAL SYSTEM', caption: 'PIPELINE DIAGRAM' },
  'ai-stock-predictor': { status: 'MODEL PROTOTYPE', caption: 'FORECAST CHART' },
  studysync: { status: 'LEARNING PLATFORM', caption: 'FEATURE DIAGRAM' },
};

function ProjectArtwork({ id }: { id: string }) {
  const shared = { className: 'art-wire', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  return (
    <svg className={`project-art project-art--${id}`} viewBox="0 0 640 220" aria-hidden="true" focusable="false">
      {id === 'haptic-hearing' && <>
        <path {...shared} className="art-wire art-route" d="M82 110c25-46 59-46 84 0s59 46 84 0" />
        <path {...shared} className="art-wire" d="M100 110c16-27 35-27 51 0s35 27 51 0" />
        <rect className="art-panel" x="275" y="61" width="150" height="98" rx="5" />
        <path className="art-wire" d="M293 82h114M293 137h114" />
        <circle className="art-node" cx="350" cy="109" r="12" />
        <path {...shared} className="art-wire art-route" d="M425 110h75l27-28h49" />
        <path className="art-hot" d="m566 74 12 8-12 8z" />
        <text className="art-caption" x="82" y="188">AMBIENT SOUND</text>
        <text className="art-caption art-caption--end" x="576" y="188">HAPTIC CUE</text>
      </>}
      {id === 'lahit-animal-welfare' && <>
        <path {...shared} className="art-wire" d="M90 158 190 93l106 46 107-69 147 82M190 93l35 84 71-38 73 50 34-119M90 158l135 19 146-27 132 2" />
        <path {...shared} className="art-wire art-route" d="M90 158 190 93l106 46 107-69 147 82" />
        <circle className="art-node" cx="90" cy="158" r="6" /><circle className="art-node" cx="190" cy="93" r="6" />
        <circle className="art-hot" cx="296" cy="139" r="8" /><circle className="art-node" cx="403" cy="70" r="6" />
        <circle className="art-node" cx="550" cy="152" r="6" />
        <path className="art-panel" d="M296 91c-18 0-32 14-32 31 0 24 32 50 32 50s32-26 32-50c0-17-14-31-32-31Z" />
        <path className="art-hot" d="M296 128c-4-6-13-2-11 5 1 5 7 9 11 12 4-3 10-7 11-12 2-7-7-11-11-5Zm-12-8c-5-7-11-2-8 4 2 4 5 5 8 6 3-1 6-2 8-6 3-6-3-11-8-4Zm24 0c-5-7-11-2-8 4 2 4 5 5 8 6 3-1 6-2 8-6 3-6-3-11-8-4Z" />
        <text className="art-caption" x="75" y="202">RESCUE</text>
        <text className="art-caption art-caption--center" x="320" y="202">CARE NETWORK</text>
        <text className="art-caption art-caption--end" x="565" y="202">ADOPTION</text>
      </>}
      {id === 'morrow-dental-clinic' && <>
        <rect className="art-panel" x="70" y="35" width="210" height="150" rx="3" />
        <path className="art-wire" d="M91 63h92M91 77h63M91 120h165M91 134h145M91 148h119" />
        <path className="art-node" d="M229 57h29v29h-29z" />
        <path stroke="var(--bg-primary)" strokeWidth="2" d="M243.5 63v17M235 71.5h17" />
        <path {...shared} className="art-wire art-tooth" d="M402 54c-18-12-45-8-58 8-12 14-12 34-6 52 6 17 13 36 25 48 6 6 13 2 18-6l13-23 13 23c5 8 12 12 18 6 12-12 19-31 25-48 6-18 6-38-6-52-13-16-40-20-58-8Z" />
        <path {...shared} className="art-wire art-route" d="M280 111h49l24-22" />
        <circle className="art-node" cx="353" cy="89" r="5" />
        <text className="art-caption" x="70" y="207">CARE INFORMATION</text>
        <text className="art-caption art-caption--end" x="571" y="207">APPOINTMENT</text>
      </>}
      {id === 'qa-engine' && <>
        <rect className="art-panel" x="60" y="66" width="125" height="76" rx="3" />
        <rect className="art-panel" x="235" y="66" width="125" height="76" rx="3" />
        <rect className="art-panel" x="410" y="66" width="125" height="76" rx="3" />
        <path {...shared} className="art-wire art-route" d="M185 104h50m125 0h50" />
        <circle className="art-node" cx="210" cy="104" r="4" /><circle className="art-hot" cx="385" cy="104" r="4" />
        <text className="art-caption" x="78" y="96">GENERATE</text><text className="art-copy" x="78" y="121">question set</text>
        <text className="art-caption" x="253" y="96">VALIDATE</text><text className="art-copy" x="253" y="121">answer quality</text>
        <text className="art-caption" x="428" y="96">RECOVER</text><text className="art-copy" x="428" y="121">retry safely</text>
        <circle className="art-panel" cx="578" cy="104" r="33" />
        <text className="art-stat" x="578" y="111">90%</text>
        <text className="art-caption art-caption--center" x="578" y="166">FASTER</text>
      </>}
      {id === 'ai-stock-predictor' && <>
        <path {...shared} className="art-wire" d="M74 176h493M74 54v122" />
        <path className="art-wire" d="M74 145h493M74 112h493M74 79h493" opacity=".45" />
        <path className="art-wire art-route" d="M95 153 170 132l68 11 69-52 76 23 64-44 97-19" />
        <path className="art-node" d="M120 106h14v48h-14zm67-33h14v60h-14zm67 44h14v34h-14zm68-61h14v40h-14zm68 18h14v41h-14zm68-48h14v57h-14zm68-17h14v34h-14z" />
        <text className="art-caption" x="75" y="204">OPEN / CLOSE</text>
        <text className="art-caption art-caption--end" x="567" y="204">NEXT SESSION</text>
      </>}
      {id === 'studysync' && <>
        <rect className="art-panel" x="85" y="43" width="245" height="142" rx="3" />
        <rect className="art-panel" x="310" y="72" width="245" height="113" rx="3" />
        <path className="art-node" d="M85 43h245v16H85z" /><path className="art-hot" d="M310 72h245v16H310z" />
        <circle className="art-node" cx="105" cy="51" r="3" /><circle className="art-hot" cx="329" cy="80" r="3" />
        <path className="art-wire" d="M108 80h148M108 95h174M108 110h128M108 143h190M338 107h175M338 122h151M338 154h117" />
        <path className="art-wire art-route" d="M260 129h76" />
        <circle className="art-node" cx="259" cy="129" r="5" /><circle className="art-hot" cx="336" cy="129" r="5" />
        <text className="art-caption" x="108" y="70">COURSE NOTES</text>
        <text className="art-caption" x="333" y="99">LIVE DISCUSSION</text>
      </>}
      {!['haptic-hearing', 'lahit-animal-welfare', 'morrow-dental-clinic', 'qa-engine', 'ai-stock-predictor', 'studysync'].includes(id) && <>
        <path {...shared} className="art-wire art-route" d="M90 150h130l55-76h100l50 76h135" />
        <circle className="art-node" cx="90" cy="150" r="8" /><circle className="art-hot" cx="450" cy="150" r="8" />
        <text className="art-caption" x="90" y="190">REQUEST</text><text className="art-caption art-caption--end" x="560" y="190">DELIVERY</text>
      </>}
    </svg>
  );
}

export default function Projects({ projects = staticProjects.projects }: { projects?: Project[] }) {
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [canMoveNext, setCanMoveNext] = useState(true);
  const projectTrackRef = useRef<HTMLDivElement>(null);
  const orderedProjects = [...projects].sort((a, b) => a.title.localeCompare(b.title));
  const visibleProjects = showAllProjects ? orderedProjects : orderedProjects.slice(0, 4);

  const moveProjects = (direction: -1 | 1) => {
    const track = projectTrackRef.current;
    const firstCard = track?.querySelector<HTMLElement>(".project-card");
    if (!track || !firstCard) return;

    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({ left: direction * (firstCard.offsetWidth + gap), behavior: reducedMotion ? "auto" : "smooth" });
  };

  const updateCarouselPosition = () => {
    const track = projectTrackRef.current;
    const firstCard = track?.querySelector<HTMLElement>(".project-card");
    if (!track || !firstCard) return;

    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
    const step = firstCard.offsetWidth + gap;
    const nextIndex = step ? Math.round(track.scrollLeft / step) : 0;
    setActiveProjectIndex((current) => current === nextIndex ? current : nextIndex);
    setCanMoveNext((current) => {
      const next = track.scrollLeft < track.scrollWidth - track.clientWidth - 2;
      return current === next ? current : next;
    });
  };

  const toggleAllProjects = () => {
    setShowAllProjects((show) => !show);
    setActiveProjectIndex(0);
    setCanMoveNext(true);
    projectTrackRef.current?.scrollTo({ left: 0, behavior: "auto" });
  };

  if (!orderedProjects.length) {
    return null;
  }

  return (
    <section className="site-section" id="projects">
      <div className="section-inner">
        <div className="projects-heading">
          <div>
            <div className="section-mark">Selected work</div>
            <h2 className="section-heading">Built to solve <em>real problems.</em></h2>
          </div>
          <p className="projects-intro">Live products, shipped systems, and prototypes—shown at equal weight and clearly labeled.</p>
        </div>

        <div className="project-carousel" role="region" aria-label="Selected project carousel" aria-roledescription="carousel">
          <div className="project-carousel-toolbar">
            <div className="project-carousel-status" aria-live="polite" aria-atomic="true">
              <span className="project-carousel-count" aria-label={`Project ${activeProjectIndex + 1} of ${visibleProjects.length}`}><strong>{String(activeProjectIndex + 1).padStart(2, '0')}</strong><span aria-hidden="true">/</span>{String(visibleProjects.length).padStart(2, '0')}</span>
              <span className="project-carousel-progress" aria-hidden="true"><i style={{ transform: `scaleX(${visibleProjects.length ? Math.min((activeProjectIndex + 1) / visibleProjects.length, 1) : 0})` }} /></span>
              <span className="project-carousel-label">Scroll the work</span>
            </div>
            <div className="project-carousel-buttons" role="group" aria-label="Project carousel controls">
              <button type="button" aria-label="Previous projects" disabled={activeProjectIndex === 0} onClick={() => moveProjects(-1)}>←</button>
              <button type="button" aria-label="Next projects" disabled={!canMoveNext} onClick={() => moveProjects(1)}>→</button>
            </div>
          </div>
          <div className="project-list" id="project-list" ref={projectTrackRef} role="group" tabIndex={0} aria-label="Projects. Use the carousel controls or scroll horizontally." onScroll={updateCarouselPosition}>
          {visibleProjects.map((project, index) => {
            const visual = projectVisuals[project.id] || { status: 'PROJECT', caption: 'PROJECT SKETCH' };
            const visualImage = project.image || visual.image;
            const slideLabel = `${project.title}, project ${index + 1} of ${visibleProjects.length}`;
            const contents = <><div className={`project-visual${visualImage ? ' has-live-image' : ''}`}><span className="project-visual-status">{visual.status}</span><span className="project-visual-index" aria-hidden="true" />{visualImage ? <img className="project-art-image" src={visualImage} alt="" loading="lazy" /> : <ProjectArtwork id={project.id} />}<span className="project-visual-caption">{visual.caption}</span></div><div className="project-card-info"><div className="project-card-titleline"><h3>{project.title}</h3>{project.link !== '#' && <span className="project-card-arrow" aria-hidden="true">↗</span>}</div><p>{project.description}</p><div className="project-card-footer"><span className="project-card-tech">{project.tech.slice(0, 2).join(' / ')}</span><span className="project-card-type">{visual.status}</span></div></div></>;
            return project.link !== '#' ? <a className="project-card" href={project.link} key={project.id} target="_blank" rel="noreferrer" aria-label={slideLabel} aria-roledescription="slide">{contents}</a> : <article className="project-card" key={project.id} role="group" aria-label={slideLabel} aria-roledescription="slide">{contents}</article>;
          })}
          </div>
        </div>
        {orderedProjects.length > 4 && <button className="projects-toggle" type="button" aria-expanded={showAllProjects} aria-controls="project-list" onClick={toggleAllProjects}>
          {showAllProjects ? 'Show less' : 'Show more'} <span aria-hidden="true">{showAllProjects ? '↑' : '↓'}</span>
        </button>}
      </div>
    </section>
  );
}
