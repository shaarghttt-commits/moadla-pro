/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Externalize Prisma from serverless bundles on Vercel
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

export default nextConfig;
