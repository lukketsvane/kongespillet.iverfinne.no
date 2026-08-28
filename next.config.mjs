/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:path*',
          destination: 'https://finn-harald.iver-raknes-finne.chatgpt.site/:path*',
        },
      ],
    };
  },
};

export default nextConfig;
