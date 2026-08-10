/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === "production" ? "/arete-analytics" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/arete-analytics/" : "",
};

export default nextConfig;
