import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/robot-mascot.svg",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
