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
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  // Text fly-in animation when panel becomes active
  useEffect(() => {
    if (!isActive) {
      // Reset to visible state when not active (for scroll back)
      if (titleRef.current) {
        gsap.set(titleRef.current, { x: 0, opacity: 1, scale: 1 });
      }
      if (subtitleRef.current) {
        gsap.set(subtitleRef.current, { x: 0, opacity: 1 });
      }
      hasAnimatedRef.current = false;
      return;
    }
    
    if (hasAnimatedRef.current) return;
    
    hasAnimatedRef.current = true;
    const tl = gsap.timeline();
    
    // Animate title - fly in from left
    if (titleRef.current) {
      tl.fromTo(
        titleRef.current,
        { x: -100, opacity: 0, scale: 0.9 },
        { x: 0, opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" }
      );
    }
    
    // Animate subtitle - fly in from right with delay
    if (subtitleRef.current) {
      tl.fromTo(
        subtitleRef.current,
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.4" // overlap with title animation
      );
    }
    
    return () => tl.kill();
  }, [isActive]);

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

  // Reset subsections when section becomes active
  useEffect(() => {
    if (!section.animatedSubsections) return;
    
    const subs = subsectionRefs.current.filter(Boolean);
    if (!subs.length) return;
    
    if (isActive) {
      // Reset all subsections when entering the section
      gsap.set(subs, { opacity: 0, y: 12 });
      gsap.set(subs[0], { opacity: 1, y: 0 });
      activeSubRef.current = 0;
    }
  }, [isActive, section.animatedSubsections]);

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
        {index === 0 ? (
          <h1 ref={titleRef}>{section.title}</h1>
        ) : (
          <h2 ref={titleRef}>{section.title}</h2>
        )}
        <p ref={subtitleRef}>{section.subtitle}</p>

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
              key={sub.id || i}
              id={sub.id}
              className={`subsection subsection--${sub.id || i}`}
              data-subsection-id={sub.id}
              data-subsection-index={i}
              ref={(el) => (subsectionRefs.current[i] = el)}
            >
              <div className="subsection__content">
                <h3>{sub.title}</h3>
                <p>{sub.desc}</p>
              </div>
              {sub.image && (
                <div className="subsection__image">
                  <img src={sub.image} alt={sub.title} />
                </div>
              )}
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
