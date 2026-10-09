"use client";

import { useState } from "react";

type Props = {
  src: string;
  alt: string;
};

/** Full 16:9 image, no dimming / no gradient. */
export default function SubjectHeroImage({ src, alt }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className="absolute inset-0 bg-wisdom-card" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}
