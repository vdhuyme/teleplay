const isProduction = process.env.NODE_ENV === 'production';
const isVercel = !!process.env.VERCEL;

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(!isVercel && isProduction && { output: 'standalone' }),
  reactStrictMode: true,
  compiler: {
    removeConsole: isProduction,
  },
};

module.exports = nextConfig;
