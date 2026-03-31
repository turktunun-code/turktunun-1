"use client";

import { useId } from "react";

type Props = { className?: string; "aria-hidden"?: boolean };

/**
 * `public` dosyasına bağlı kalmadan gösterilir — CDN/önbellek veya bozuk Redis URL olsa bile çalışır.
 */
export function InlineCatalogLogo({ className = "", ...rest }: Props) {
  const uid = useId().replace(/:/g, "");
  const ringId = `tt-logo-ring-${uid}`;
  const innerId = `tt-logo-inner-${uid}`;

  const hidden = rest["aria-hidden"] === true;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="none"
      className={className}
      role={hidden ? "presentation" : "img"}
      aria-label={hidden ? undefined : "Türk Tudun"}
      {...rest}
    >
      <defs>
        <linearGradient id={ringId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5ee8dc" />
          <stop offset="100%" stopColor="#30D5C8" />
        </linearGradient>
        <linearGradient id={innerId} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#1a2422" />
          <stop offset="100%" stopColor="#0d1514" />
        </linearGradient>
      </defs>
      <circle cx="128" cy="128" r="120" fill={`url(#${innerId})`} stroke={`url(#${ringId})`} strokeWidth="6" />
      <circle
        cx="128"
        cy="128"
        r="98"
        fill="none"
        stroke="#30D5C8"
        strokeOpacity="0.35"
        strokeWidth="2"
      />
      <path fill="#30D5C8" d="M78 176V108a50 50 0 0 1 100 0v68h-22v-64a28 28 0 0 0-56 0v64H78z" />
      <path fill="#1a2422" d="M94 176v-56c0-18.778 15.222-34 34-34s34 15.222 34 34v56H94z" />
      <ellipse cx="128" cy="104" rx="26" ry="20" fill="#30D5C8" opacity="0.25" />
      <path
        fill="#30D5C8"
        fillOpacity="0.9"
        d="M128 52l6.2 12.6 13.8 2-10 9.7 2.4 13.8-12.4-6.5-12.4 6.5 2.4-13.8-10-9.7 13.8-2z"
      />
    </svg>
  );
}
