"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Props = {
  href: string;
  name: string;
  description?: string;
  image: string;
  /** Optional highlight styling for primary subject */
  ready?: boolean;
};

export default function SubjectCard({ href, name, image, ready = false }: Props) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <Link
      href={href}
      prefetch={true}
      className="card-modern group flex flex-col h-full justify-between shadow-md shadow-black/25 overflow-hidden rounded-xl sm:rounded-2xl"
    >
      <div className="card-media-wrap aspect-video">
        {!imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-wisdom-card p-3">
            <span className="text-center text-xs sm:text-sm font-semibold text-white/80 leading-snug">
              {name}
            </span>
          </div>
        )}
      </div>

      {/* Side-by-side title and Open button to prevent vertical space waste */}
      <div className="p-2 sm:p-2.5 md:p-3 flex items-center justify-between gap-1.5 sm:gap-2 border-t border-white/8 flex-1">
        <h3 className="text-xs sm:text-sm md:text-base font-bold leading-snug text-white group-hover:text-cyan-200 transition-colors line-clamp-2 min-w-0 flex-1">
          {name}
        </h3>

        <span className="btn-open shrink-0">
          <span>Open</span>
          <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
