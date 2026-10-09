import type { NextConfig } from "next";

/** Always use the custom domain — never a *.vercel.app deployment URL */
const envDigital = process.env.NEXT_PUBLIC_DIGITAL_URL?.replace(/\/$/, "") || "";
const DIGITAL =
  envDigital && !/vercel\.app/i.test(envDigital) && !/localhost/i.test(envDigital)
    ? envDigital
    : "https://wisdomtower.tech";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    devtoolSegmentExplorer: false,
    cpus: 1,
    webpackMemoryOptimizations: true,
  },
  async redirects() {
    return [
      {
        source: "/sign-in",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/sign-up",
        destination: "/signup",
        permanent: false,
      },
      {
        source: "/log-in",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/sign_in",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/sign_up",
        destination: "/signup",
        permanent: false,
      },
      {
        source: "/auth/login",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/auth/signin",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/auth/signup",
        destination: "/signup",
        permanent: false,
      },
      {
        source: "/auth/register",
        destination: "/signup",
        permanent: false,
      },
      {
        source: "/academy/packages",
        destination: "/packages",
        permanent: false,
      },
      {
        source: "/academy/special-packages/ece",
        destination: "/academy/special-packages/electrical-computer-engineering",
        permanent: false,
      },
      {
        source: "/academy/special-packages/ece/:path*",
        destination: "/academy/special-packages/electrical-computer-engineering/:path*",
        permanent: false,
      },
      {
        source: "/digital",
        destination: DIGITAL,
        permanent: false,
      },
      {
        source: "/digital/:path*",
        destination: `${DIGITAL}/:path*`,
        permanent: false,
      },
      {
        source: "/services",
        destination: `${DIGITAL}/services`,
        permanent: false,
      },
      {
        source: "/services/:path*",
        destination: `${DIGITAL}/services/:path*`,
        permanent: false,
      },
      {
        source: "/dashboard",
        destination: `${DIGITAL}/dashboard`,
        permanent: false,
      },
      {
        source: "/business",
        destination: `${DIGITAL}/business`,
        permanent: false,
      },
      {
        source: "/business/:path*",
        destination: `${DIGITAL}/business/:path*`,
        permanent: false,
      },
      {
        source: "/apply",
        destination: `${DIGITAL}/apply`,
        permanent: false,
      },
      {
        source: "/request",
        destination: `${DIGITAL}/request`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
