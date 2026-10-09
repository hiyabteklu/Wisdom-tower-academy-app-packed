"use client";

import { useState } from "react";

type Props = {
  src: string;
  alt?: string;
  className?: string;
};

/** Client-only cover image with graceful onError (hide / fade on fail). */
export default function SafeCoverImage({
  src,
  alt = "",
  className = "absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]",
}: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className="absolute inset-0 bg-wisdom-navy" aria-hidden />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
