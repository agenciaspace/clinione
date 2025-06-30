import { useEffect, useState } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

/**
 * Retorna o breakpoint atual do viewport, permitindo lógica condicional em componentes.
 * mobile  < 768px
 * tablet  768px — 1023px
 * desktop ≥ 1024px
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'desktop';
    const override = localStorage.getItem('devViewportOverride') as Breakpoint | null;
    if (override && ["mobile", "tablet", "desktop"].includes(override)) {
      return override;
    }
    const w = window.innerWidth;
    return w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop";
  });

  useEffect(() => {
    const calcFromWidth = () => {
      const w = window.innerWidth;
      return w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop";
    };

    const computeAndSet = () => {
      const override = localStorage.getItem("devViewportOverride") as Breakpoint | null;
      if (override && ["mobile", "tablet", "desktop"].includes(override)) {
        setBreakpoint(override);
      } else {
        setBreakpoint(calcFromWidth());
      }
    };

    const onResize = () => {
      computeAndSet();
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("storage", computeAndSet); // para receber override de outras abas
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("storage", computeAndSet);
    };
  }, []);

  return breakpoint;
} 