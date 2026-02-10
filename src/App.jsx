import { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";
import Navigation from "./components/Navigation";
import Panel from "./components/Panel";
import AutoplayGate from "./components/AutoplayGate";
import "./App.css";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);

const BASE = import.meta.env.BASE_URL;

const sections = [
  {
    id: "iris",
    title: "Synamedia Iris",
    subtitle: "Audio synced, smooth, and fully automated.",
    audio: `${BASE}assets/intro.wav`,
    microType: "orbit",
    subsections: [
      { title: "Advanced video ad monetisation platform", desc: "Add supporting copy for this chapter of the script." },
      { title: "Trusted by leading media companies", desc: "Add supporting copy for this chapter of the script." },
      { title: "Campaign premium", desc: "Add supporting copy for this chapter of the script." },
    ],
    animatedSubsections: true,
  },
  {
    id: "value",
    title: "VALUE PROPOSITION",
    subtitle: "Micro animations loop only when active.",
    audio: `${BASE}assets/value-proposition.wav`,
    microType: "pulse",
    subsections: [
      { title: "Sub-section 1", desc: "Add interaction notes here." },
      { title: "Sub-section 2", desc: "Add interaction notes here." },
      { title: "Sub-section 3", desc: "Add interaction notes here." },
    ],
    animatedSubsections: true,
  },
  {
    id: "addressability",
    title: "FULL ADDRESSABILITY",
    subtitle: "Sections blend with gentle transitions.",
    audio: `${BASE}assets/full-addressability.wav`,
    microType: "beam",
    subsections: [
      { title: "Sub-section 1", desc: "Add interaction notes here." },
      { title: "Sub-section 2", desc: "Add interaction notes here." },
      { title: "Sub-section 3", desc: "Add interaction notes here." },
    ],
    animatedSubsections: true,
  },
  {
    id: "platform",
    title: "AGNOSTIC PLATFORM",
    subtitle: "Video only plays when active.",
    audio: `${BASE}assets/agnostic-platform.wav`,
    microType: "ripple",
    video: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    subsections: [
      { title: "Sub-section 1", desc: "Add interaction notes here." },
      { title: "Sub-section 2", desc: "Add interaction notes here." },
      { title: "Sub-section 3", desc: "Add interaction notes here." },
    ],
  },
  {
    id: "campaign",
    title: "STREAMLINED CAMPAIGN MANAGEMENT",
    subtitle: "Everything stays synced with the voice-over.",
    audio: `${BASE}assets/scm.wav`,
    microType: "spin",
    subsections: [
      { title: "Sub-section 1", desc: "Add interaction notes here." },
      { title: "Sub-section 2", desc: "Add interaction notes here." },
      { title: "Sub-section 3", desc: "Add interaction notes here." },
    ],
  },
    {
    id: "optimization",
    title: "YIELD OPTIMIZATION",
    subtitle: "Everything stays synced with the voice-over.",
    audio: `${BASE}assets/yield-optimization.wav`,
    microType: "spin",
    subsections: [
      { title: "Sub-section 1", desc: "Add interaction notes here." },
      { title: "Sub-section 2", desc: "Add interaction notes here." },
      { title: "Sub-section 3", desc: "Add interaction notes here." },
    ],
  },
    {
    id: "forecasting",
    title: "AUDIENCE INTELLIGENCE & FORECASTING",
    subtitle: "Everything stays synced with the voice-over.",
    audio: `${BASE}assets/audience-intelligence-forecasting.wav`,
    subsections: [
      { title: "Sub-section 1", desc: "Add interaction notes here." },
      { title: "Sub-section 2", desc: "Add interaction notes here." },
      { title: "Sub-section 3", desc: "Add interaction notes here." },
    ],
  },
];

export default function App() {
  const containerRef = useRef(null);
  const panelRefs = useRef([]);
  const audioRefs = useRef([]);
  const masterRef = useRef(null);
  const autoTweenRef = useRef(null);
  const scrollTriggerRef = useRef(null);
  const isScrollingRef = useRef(false);
  const isTransitioningRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [audioDurations, setAudioDurations] = useState({});

  const hasSectionAudio = useCallback(
    (index) => Boolean(sections[index]?.audio),
    []
  );

  const smoothScrollTo = useCallback((targetY, onComplete) => {
    // Disable ScrollTrigger snap during programmatic scroll
    isScrollingRef.current = true;
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.disable();
    }

    gsap.to(window, {
      scrollTo: { y: targetY, autoKill: false },
      duration: 1.2,
      ease: "power2.inOut",
      overwrite: "auto",
      onComplete: () => {
        // Re-enable ScrollTrigger after scroll completes
        isScrollingRef.current = false;
        if (scrollTriggerRef.current) {
          scrollTriggerRef.current.enable();
        }
        if (onComplete) onComplete();
      },
    });
  }, []);

  const startAutoScroll = useCallback(() => {
    if (!masterRef.current) return;
    if (autoTweenRef.current) {
      autoTweenRef.current.kill();
    }
    const totalDuration = (sections.length - 1) * 6;
    const remaining = 1 - masterRef.current.progress();
    autoTweenRef.current = gsap.to(masterRef.current, {
      progress: 1,
      duration: Math.max(0.1, totalDuration * remaining),
      ease: "none",
      onUpdate: () => {
        ScrollTrigger.update();
        const idx = Math.round(masterRef.current.progress() * (sections.length - 1));
        setActiveIndex((prev) => (prev !== idx ? idx : prev));
      },
    });
  }, []);

  const goToSection = useCallback(
    (index, resumeAutoScroll = true) => {
      const panel = panelRefs.current[index];
      if (!panel) return;
      const progress = index / (sections.length - 1);
      if (masterRef.current) {
        masterRef.current.progress(progress).pause();
      }
      smoothScrollTo(panel.offsetTop, () => {
        if (resumeAutoScroll && isPlaying && !hasSectionAudio(index)) {
          startAutoScroll();
        }
      });
      setActiveIndex(index);
    },
    [smoothScrollTo, isPlaying, hasSectionAudio, startAutoScroll]
  );

  const playAudio = useCallback(
    (index) => {
      audioRefs.current.forEach((el, i) => {
        if (el && i !== index) el.pause();
      });
      const audioEl = audioRefs.current[index];
      if (!audioEl) return;
      audioEl.currentTime = 0;
      audioEl.muted = isMuted;
      audioEl.play().catch(() => setShowGate(true));
    },
    [isMuted]
  );

  const handleAudioEnded = useCallback(
    (index) => {
      const nextIndex = index + 1;
      if (nextIndex >= sections.length) {
        setIsPlaying(false);
        return;
      }
      // Mark as transitioning to prevent useEffect from playing audio
      isTransitioningRef.current = true;
      // Smooth scroll to next section when audio ends
      const nextPanel = panelRefs.current[nextIndex];
      if (nextPanel) {
        smoothScrollTo(nextPanel.offsetTop, () => {
          setActiveIndex(nextIndex);
          isTransitioningRef.current = false;
          if (hasSectionAudio(nextIndex)) {
            playAudio(nextIndex);
          } else {
            startAutoScroll();
          }
        });
      }
    },
    [smoothScrollTo, hasSectionAudio, playAudio, startAutoScroll]
  );

  const pauseAllAudio = useCallback(() => {
    audioRefs.current.forEach((el) => {
      if (el) el.pause();
    });
  }, []);

  const play = useCallback(() => {
    setIsPlaying(true);
    playAudio(activeIndex);
  }, [activeIndex, playAudio]);

  const handleGateStart = useCallback(() => {
    setShowGate(false);
    play();
  }, [play]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      audioRefs.current.forEach((el) => {
        if (el) el.muted = next;
      });
      return next;
    });
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      pauseAllAudio();
      if (autoTweenRef.current) autoTweenRef.current.pause();
      return;
    }
    // Audio playback is handled by play() and handleAudioEnded() only
  }, [isPlaying, pauseAllAudio]);

  useGSAP(
    () => {
      const panels = panelRefs.current.filter(Boolean);
      const totalScroll = window.innerHeight * (panels.length - 1);

      const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
      panels.forEach((panel, index) => {
        if (index === 0) return;
        tl.to(window, { scrollTo: panel.offsetTop, duration: 1.2 });
      });
      masterRef.current = tl;

      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: `+=${totalScroll}`,
        scrub: 0.5,
        snap: {
          snapTo: 1 / (panels.length - 1),
          duration: { min: 0.3, max: 0.6 },
          delay: 0.05,
          ease: "power2.inOut",
        },
        onSnapComplete: (self) => {
          if (!isScrollingRef.current) {
            const idx = Math.round(self.progress * (panels.length - 1));
            setActiveIndex(idx);
          }
        },
      });

      // Content reveal animations for each panel
      panels.forEach((panel, index) => {
        const inner = panel.querySelector(".panel__inner");
        if (!inner) return;

        // Animate panel content on scroll
        gsap.fromTo(
          inner,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: panel,
              start: "top 80%",
              end: "top 20%",
              scrub: 1,
            },
          }
        );

        // Fade out when leaving
        gsap.to(inner, {
          opacity: 0,
          y: -40,
          scrollTrigger: {
            trigger: panel,
            start: "bottom 80%",
            end: "bottom 20%",
            scrub: 1,
          },
        });

        ScrollTrigger.create({
          trigger: panel,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActiveIndex(index),
          onEnterBack: () => setActiveIndex(index),
        });
      });
    },
    { scope: containerRef, dependencies: [] }
  );

  useEffect(() => {
    const firstAudio = audioRefs.current[0];
    if (!firstAudio) return;
    const handleLoaded = () => {
      setAudioDurations((prev) => ({ ...prev, 0: firstAudio.duration }));
      play();
    };
    if (firstAudio.readyState >= 1) {
      handleLoaded();
    } else {
      firstAudio.addEventListener("loadedmetadata", handleLoaded);
      return () => firstAudio.removeEventListener("loadedmetadata", handleLoaded);
    }
  }, [play]);

  return (
    <>
      <Navigation
        sections={sections}
        activeIndex={activeIndex}
        isMuted={isMuted}
        onMuteToggle={toggleMute}
        onSectionChange={goToSection}
      />

      <main id="scroller" ref={containerRef}>
        {sections.map((section, index) => (
          <Panel
            key={section.id}
            ref={(el) => (panelRefs.current[index] = el)}
            audioRef={(el) => (audioRefs.current[index] = el)}
            section={section}
            index={index}
            isActive={activeIndex === index}
            isPlaying={isPlaying}
            audioDuration={audioDurations[index]}
            onAudioEnded={() => handleAudioEnded(index)}
            onAudioLoaded={(duration) =>
              setAudioDurations((prev) => ({ ...prev, [index]: duration }))
            }
          />
        ))}
      </main>

      {showGate && <AutoplayGate onStart={handleGateStart} />}
    </>
  );
}
