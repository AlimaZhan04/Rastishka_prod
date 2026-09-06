"use client";

import { useState } from "react";
import Image from "next/image";

const FALLBACK_IMAGE = "/images/rastishka-hero-v1.png";

/** CMS images retain native loading, alt text and a usable fallback. */
export function ContentImage({
  src,
  alt,
  sizes,
  eager = false,
  className,
}: {
  src?: string | null;
  alt: string;
  sizes: string;
  eager?: boolean;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const imageSrc = src && src !== failedSrc ? src : FALLBACK_IMAGE;

  return (
    <Image
      src={imageSrc}
      alt={src && src === failedSrc ? "Развивающее занятие в детском саду «РАСтишка»" : alt}
      fill
      // CMS URLs can use external hosts; keep their existing direct delivery.
      unoptimized={imageSrc !== FALLBACK_IMAGE}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      sizes={sizes}
      className={className}
      onError={() => {
        if (src && imageSrc !== FALLBACK_IMAGE) setFailedSrc(src);
      }}
      onLoad={({ currentTarget }) => {
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          currentTarget.animate?.([{ opacity: 0 }, { opacity: 1 }], {
            duration: 420,
            easing: "ease-out",
          });
        }
      }}
    />
  );
}
