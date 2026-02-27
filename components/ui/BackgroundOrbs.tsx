"use client";

import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";

const BackgroundOrbs = () => {
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(orb1Ref.current, {
        y: 30,
        x: 20,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(orb2Ref.current, {
        y: -40,
        x: -15,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      <div
        ref={orb1Ref}
        className="absolute top-[10%] right-[15%] w-[400px] h-[400px] bg-primary/20 blur-[120px] rounded-full -z-10"
      />
      <div
        ref={orb2Ref}
        className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] bg-secondary/10 blur-[100px] rounded-full -z-10"
      />
    </>
  );
};

export default BackgroundOrbs;
