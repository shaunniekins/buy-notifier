/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/peddler",
        destination: "/peddler/view",
        permanent: false,
      },
      {
        source: "/consumer",
        destination: "/consumer/view",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
