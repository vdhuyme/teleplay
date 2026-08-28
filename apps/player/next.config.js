const isProduction = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isProduction && { output: 'standalone' }),
  reactStrictMode: true,
  compiler: {
    removeConsole: isProduction,
  },
};

module.exports = nextConfig;
