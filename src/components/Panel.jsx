import { forwardRef, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import MicroAnimation from "./MicroAnimation";

const Panel = forwardRef(function Panel(
  {
    section,
    index,
    isActive,
    isPlaying,
    audioDuration,
    onAudioEnded,
    onAudioLoaded,
    audioRef,
  },
  ref
) {
  const subsectionRefs = useRef([]);
  const activeSubRef = useRef(0);

  useGSAP(
    () => {
      if (!section.animatedSubsections) return;
      const subs = subsectionRefs.current.filter(Boolean);
      gsap.set(subs, { opacity: 0, y: 12 });
      gsap.set(subs[0], { opacity: 1, y: 0 });
      activeSubRef.current = 0;
    },
    { dependencies: [section.animatedSubsections] }
  );

  useEffect(() => {
    if (!section.animatedSubsections || !isActive || !isPlaying || !audioDuration) return;

    const subs = subsectionRefs.current.filter(Boolean);
    const count = subs.length;
    const interval = (audioDuration * 1000) / count;
    let currentIndex = activeSubRef.current;

    const tick = () => {
      currentIndex++;
      if (currentIndex >= count) return;
      const prev = subs[activeSubRef.current];
      const next = subs[currentIndex];
      if (prev) gsap.to(prev, { opacity: 0, y: -8, duration: 0.4 });
      gsap.to(next, { opacity: 1, y: 0, duration: 0.5 });
      activeSubRef.current = currentIndex;
    };

    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [section.animatedSubsections, isActive, isPlaying, audioDuration]);

  return (
    <section
      ref={ref}
      className={`panel panel--${section.id}`}
      data-index={index}
    >
      <div className="panel__inner">
        {index === 0 ? <h1>{section.title}</h1> : <h2>{section.title}</h2>}
        <p>{section.subtitle}</p>

        {section.audio && (
          <audio
            ref={audioRef}
            preload="metadata"
            onEnded={onAudioEnded}
            onLoadedMetadata={(e) => onAudioLoaded(e.target.duration)}
          >
            <source src={section.audio} type="audio/wav" />
          </audio>
        )}

        <div
          className={`subsections${
            section.animatedSubsections ? " subsections--animated" : ""
          }`}
        >
          {section.subsections.map((sub, i) => (
            <div
              key={i}
              className="subsection"
              ref={(el) => (subsectionRefs.current[i] = el)}
            >
              <h3>{sub.title}</h3>
              <p>{sub.desc}</p>
            </div>
          ))}
        </div>

        {section.video && (
          <video
            className="panel__video"
            muted
            playsInline
            preload="metadata"
            ref={(el) => {
              if (!el) return;
              if (isActive && isPlaying) {
                el.play().catch(() => {});
              } else {
                el.pause();
              }
            }}
          >
            <source src={section.video} type="video/mp4" />
          </video>
        )}

        <MicroAnimation type={section.microType} isActive={isActive && isPlaying} />
      </div>
    </section>
  );
});

export default Panel;
