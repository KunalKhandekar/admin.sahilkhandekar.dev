/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    remotePatterns: [new URL('https://dzdw2zccyu2wu.cloudfront.net/**')],
  },
};

export default nextConfig;
