import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Redesign 5/24 route renames — keep old links/bookmarks working
    return [
      { source: '/dashboard', destination: '/home',    permanent: true },
      { source: '/plan',      destination: '/plans',   permanent: true },
      { source: '/health',    destination: '/records', permanent: true },
    ]
  },
};

export default nextConfig;
