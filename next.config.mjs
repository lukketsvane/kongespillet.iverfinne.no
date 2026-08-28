/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/origin-assets/:path*',
          destination: 'https://finn-harald.iver-raknes-finne.chatgpt.site/assets/:path*',
        },
      ],
      afterFiles: [
        {
          source: '/:path*',
          destination: 'https://finn-harald.iver-raknes-finne.chatgpt.site/:path*',
        },
      ],
    };
  },
};

export default nextConfig;
