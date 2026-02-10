import { useRef, useEffect } from "react";
import { gsap } from "gsap";

export default function MicroAnimation({ type, isActive }) {
  const containerRef = useRef(null);
  const tlRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (tlRef.current) {
      tlRef.current.kill();
    }

    const tl = gsap.timeline({ repeat: -1, paused: true });

    if (type === "orbit") {
      const dots = el.querySelectorAll("span");
      gsap.set(dots, { transformOrigin: "60px 60px" });
      tl.to(dots, { rotation: 360, duration: 6, ease: "none", stagger: 0.3 });
    }

    if (type === "pulse") {
      tl.fromTo(
        el.querySelectorAll("span"),
        { scale: 0.6, opacity: 0.3 },
        { scale: 1.2, opacity: 0, duration: 2, stagger: 0.3, ease: "sine.out" }
      );
    }

    if (type === "beam") {
      tl.fromTo(el, { scaleX: 0.2, opacity: 0.2 }, { scaleX: 1, opacity: 1, duration: 1.8, ease: "sine.inOut" }).to(
        el,
        { scaleX: 0.3, opacity: 0.2, duration: 1.2, ease: "sine.inOut" }
      );
    }

    if (type === "ripple") {
      tl.fromTo(el, { scale: 0.5, opacity: 0.3 }, { scale: 1.15, opacity: 0, duration: 2.2, ease: "sine.out" });
    }

    if (type === "spin") {
      const dots = el.querySelectorAll("span");
      dots.forEach((dot, i) => {
        const angle = (i / dots.length) * Math.PI * 2;
        const radius = 50;
        gsap.set(dot, {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
        });
      });
      tl.to(el, { rotation: 360, duration: 5, ease: "none" });
    }

    tlRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [type]);

  useEffect(() => {
    if (!tlRef.current) return;
    if (isActive) {
      tlRef.current.play();
    } else {
      tlRef.current.pause();
    }
  }, [isActive]);

  const renderSpans = () => {
    if (type === "orbit" || type === "pulse") {
      return (
        <>
          <span></span>
          <span></span>
          <span></span>
        </>
      );
    }
    if (type === "spin") {
      return (
        <>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </>
      );
    }
    return null;
  };

  return (
    <div ref={containerRef} className={`micro micro--${type}`}>
      {renderSpans()}
    </div>
  );
}
