import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // A resume is limited to 25 MiB by server validation. The extra 1 MiB covers
      // multipart form overhead so a valid boundary-size file is not rejected first.
      bodySizeLimit: "26mb",
    },
  },
};

export default nextConfig;
