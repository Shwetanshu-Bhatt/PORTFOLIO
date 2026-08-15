const nextConfig = {
  // Ensure trailing slashes for proper static generation
  trailingSlash: true,
  
  // Improve SEO indexing
  poweredByHeader: false,
  
  // Ensure proper React hydration
  reactStrictMode: true,
  serverExternalPackages: ['ws'],

  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'shwetanshubhatt.apsgroupco.com' }],
        destination: 'https://shwetanshubhatt.sifakalabs.in/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
