/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@my-pocket/shared'],
};

export default nextConfig;
