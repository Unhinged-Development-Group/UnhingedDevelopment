"use client";

import { useCallback } from "react";

interface Props {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function TransitionLink({ href, children, className, onClick }: Props) {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) {
        onClick?.();
        return;
      }

      e.preventDefault();
      onClick?.();

      window.dispatchEvent(
        new CustomEvent("udg-transition", {
          detail: { href, x: e.clientX, y: e.clientY },
        })
      );
    },
    [href, onClick]
  );

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
