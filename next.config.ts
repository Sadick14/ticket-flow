
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Moved from experimental to root level
  serverExternalPackages: [
    '@opentelemetry/exporter-jaeger',
    'handlebars'
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
