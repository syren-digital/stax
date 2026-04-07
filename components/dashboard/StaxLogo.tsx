"use client";

import { useEffect, useRef } from "react";

const LETTER_PATHS = [
  { d: "M42.6,54.8c-.5-1.2-1.3-2.4-2.4-3.4-1.2-1-2.7-2-4.6-2.9-1.9-.9-4.2-1.7-7-2.4-4.3-1.2-8.1-2.6-11.4-4.3-3.3-1.7-5.9-3.5-8-5.5-2.1-2-3.6-4.2-4.7-6.6-1.1-2.4-1.6-5.1-1.6-7.9s.7-6.3,2.1-8.9c1.4-2.7,3.3-5,5.8-6.9,2.5-1.9,5.4-3.3,8.7-4.4,3.4-1,7-1.5,10.9-1.5s7.8.6,11.2,1.8c3.4,1.2,6.3,2.8,8.7,4.9,2.4,2.1,4.3,4.7,5.7,7.6.2.4.4.9.6,1.4,1.5,4-1.5,8.3-5.7,8.3h-2.4c-2.6,0-5-1.6-5.8-4.1s-.2-.5-.2-.7c-.6-1.5-1.4-2.7-2.4-3.8-1.1-1-2.5-1.8-4.1-2.4-1.6-.6-3.5-.9-5.7-.9s-3.8.2-5.3.7c-1.6.5-2.9,1.2-3.9,2-1.1.9-1.9,1.9-2.4,3.1-.6,1.2-.8,2.5-.8,3.9s.4,2.8,1.1,4c.7,1.2,1.8,2.2,3.2,3.2,1.4,1,3.1,1.8,5.1,2.6,2,.8,4.2,1.5,6.7,2.2,2.7.7,5.2,1.7,7.7,2.7,2.4,1.1,4.7,2.3,6.7,3.7,3.1,2.3,5.5,4.9,7.3,8,1.8,3,2.7,6.5,2.7,10.5s-.7,6.5-2.1,9.1c-1.4,2.7-3.3,4.9-5.7,6.7-2.4,1.9-5.3,3.3-8.7,4.2-3.4.9-7,1.4-11,1.4s-7.7-.6-11.5-1.7-7.1-2.9-9.9-5.1c-2.7-2.2-4.8-4.8-6.3-7.8-.4-.8-.7-1.5-1-2.4-1.4-4,1.5-8.2,5.8-8.2h2.5c2.7,0,5.1,1.8,5.9,4.4s.4,1.1.6,1.6c.7,1.7,1.8,3.1,3.2,4.1,1.3,1.1,2.9,1.9,4.8,2.4,1.9.5,3.9.7,6.2.7s3.8-.2,5.3-.7c1.6-.5,2.9-1.1,3.9-1.9,1.1-.8,1.9-1.8,2.5-3s.9-2.4.9-3.8-.2-2.7-.7-3.9Z", delay: 0 },
  { d: "M115,19.5v53.4c0,3.4-2.7,6.1-6.1,6.1h-2.9c-3.4,0-6.1-2.7-6.1-6.1V19.5c0-3.4-2.7-6.1-6.1-6.1h-11.5c-3.4,0-6.1-2.7-6.1-6.1h0c0-3.4,2.7-6.1,6.1-6.1h50.6c3.4,0,6.1,2.7,6.1,6.1h0c0,3.4-2.7,6.1-6.1,6.1h-11.8c-3.4,0-6.1,2.7-6.1,6.1Z", delay: 150 },
  { d: "M170,67.2l-2.1,7.4c-.7,2.6-3.2,4.5-5.9,4.5h-2.8c-4.2,0-7.1-4.1-5.8-8L175,5.3c.8-2.5,3.2-4.2,5.8-4.2h4.8c2.7,0,5,1.7,5.8,4.2l21.1,65.7c1.3,4-1.7,8-5.8,8h-2.8c-2.7,0-5.2-1.8-5.9-4.5l-2-7.3c-.7-2.6-3.1-4.5-5.9-4.5h-14.1c-2.7,0-5.1,1.8-5.9,4.5ZM189,42.2h0c-1.7-6-10.1-6-11.8,0h0c-1.1,3.9,1.8,7.8,5.9,7.8h0c4,0,7-3.9,5.9-7.8Z", delay: 300 },
];

const CHEVRON_DELAY = 1400;

const CHEVRON_TOP = "M243.8,0h0c1.9,0,3.7.8,5,2.1l13.3,13.3c2.1,2.1,5.5,2.1,7.6,0l13.3-13.3c1.3-1.3,3.2-2.1,5-2.1h0c6.4,0,9.5,7.7,5,12.2l-22.2,22.2c-2.8,2.8-7.3,2.8-10.1,0l-22.2-22.2c-4.5-4.5-1.3-12.2,5-12.2Z";
const CHEVRON_BOTTOM = "M288.1,79h0c-1.9,0-3.7-.8-5-2.1l-13.3-13.3c-2.1-2.1-5.5-2.1-7.6,0l-13.3,13.3c-1.3,1.3-3.2,2.1-5,2.1h0c-6.4,0-9.5-7.7-5-12.2l22.2-22.2c2.8-2.8,7.3-2.8,10.1,0l22.2,22.2c4.5,4.5,1.3,12.2-5,12.2Z";

export function StaxLogo({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const letterEls = svg.querySelectorAll<SVGPathElement>("[data-type='letter']");
    letterEls.forEach((path, i) => {
      const delay = LETTER_PATHS[i]?.delay ?? 0;
      const length = path.getTotalLength();

      path.style.fill = "transparent";
      path.style.stroke = "currentColor";
      path.style.strokeWidth = "1";
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
      path.style.animation = [
        `logo-draw 1.4s ease-in-out ${delay}ms forwards`,
        `logo-fill 0.5s ease ${delay + 1400}ms forwards`,
      ].join(", ");
    });

    const topEl = svg.querySelector<SVGPathElement>("[data-type='chevron-top']");
    const bottomEl = svg.querySelector<SVGPathElement>("[data-type='chevron-bottom']");

    if (topEl) {
      topEl.style.opacity = "0";
      topEl.style.animation = `logo-chevron-top 0.6s ease ${CHEVRON_DELAY}ms forwards`;
    }
    if (bottomEl) {
      bottomEl.style.opacity = "0";
      bottomEl.style.animation = `logo-chevron-bottom 0.6s ease ${CHEVRON_DELAY + 100}ms forwards`;
    }
  }, []);

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 301 80"
      aria-label="STAX"
      className={className}
      style={style}
    >
      {LETTER_PATHS.map((p, i) => (
        <path key={i} data-type="letter" d={p.d} style={{ fill: "currentColor" }} />
      ))}
      <path data-type="chevron-top" d={CHEVRON_TOP} style={{ fill: "currentColor" }} />
      <path data-type="chevron-bottom" d={CHEVRON_BOTTOM} style={{ fill: "currentColor" }} />
    </svg>
  );
}
