import Image from "next/image";

/** Official brand mark: keep public/images/brand/logo.png up to date. */
const LOGO_SRC = "/images/brand/logo.png";

export default function BrandLogo({
  className = "",
  size = 40,
  priority = false,
  alt = "Wisdom Tower Academy",
}: {
  className?: string;
  size?: number;
  priority?: boolean;
  alt?: string;
}) {
  return (
    <Image
      src={LOGO_SRC}
      alt={alt}
      width={size}
      height={size}
      className={className}
      priority={priority}
      unoptimized
    />
  );
}

export const brandLogoSrc = LOGO_SRC;
