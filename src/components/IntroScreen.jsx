import { useState, useEffect, useRef } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { gsap } from "gsap";

export default function IntroScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Auto-complete after animation or timeout
    const timer = setTimeout(() => {
      if (!isAnimating) handleComplete();
    }, 6000); // 6 seconds max

    return () => clearTimeout(timer);
  }, [isAnimating]);

  const handleComplete = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    // Fade out the intro screen
    gsap.to(containerRef.current, {
      opacity: 0,
      scale: 1.1,
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: () => {
        setIsVisible(false);
        onComplete();
      },
    });
  };

  if (!isVisible) return null;

  return (
    <div ref={containerRef} className="intro-screen" onClick={handleComplete}>
      <div className="intro-screen__content">
        <div className="intro-screen__lottie">
          {!loaded && <div className="intro-screen__loading"></div>}
          <DotLottieReact
            src="https://lottie.host/003aee7e-7b9f-4fc7-8886-2df05b4cb746/JUJxQdhuub.lottie"
            autoplay
            // loop
            // onLoad={() => setLoaded(true)}
          />
        </div>
        {/* <p className="intro-screen__skip">Click anywhere to skip</p> */}
      </div>
    </div>
  );
}
