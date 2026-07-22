import {createRequire} from 'module';

const require = createRequire(import.meta.url);

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  output: "standalone",

  images: {
    // Replace the deprecated `domains` with `remotePatterns`
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.zil.ink',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets-cdn.trustwallet.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'backend.multiwyre.com',
        port: '',
        pathname: '/api/v1/file/files/**', // More specific path pattern
      },
      {
        protocol: 'https',
        hostname: 'hotcoin-snp-idcard.oss-accelerate.aliyuncs.com',
        port: '',
        pathname: '/hotcoin/photo/**',
      },
      {
        protocol: 'https',
        hostname: 'hotcoin-snp-idcard.oss-accelerate.aliyuncs.com',
        port: '',
        pathname: '/cms/support/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/trustwallet/assets/master/blockchains/**',
      },
      {
        protocol: 'https',
        hostname: 'oval-resources.s3.us-east-2.amazonaws.com',
        port: '',
        pathname: '/**',
      }

    ],
    // Optional: Set a minimum cache time for optimized images
    minimumCacheTTL: 60,
    // Optional: Configure device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default config;
