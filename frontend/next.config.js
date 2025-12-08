/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_BASE_URL: '',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: 'http://localhost:3001/auth/:path*',
      },
      {
        source: '/accounts/:path*',
        destination: 'http://localhost:3001/accounts/:path*',
      },
      {
        source: '/transactions/:path*',
        destination: 'http://localhost:3001/transactions/:path*',
      },
      {
        source: '/categories/:path*',
        destination: 'http://localhost:3001/categories/:path*',
      },
      {
        source: '/budgets/:path*',
        destination: 'http://localhost:3001/budgets/:path*',
      },
      {
        source: '/goals/:path*',
        destination: 'http://localhost:3001/goals/:path*',
      },
      {
        source: '/reports/:path*',
        destination: 'http://localhost:3001/reports/:path*',
      },
      {
        source: '/chat/:path*',
        destination: 'http://localhost:3001/chat/:path*',
      },
      {
        source: '/import/:path*',
        destination: 'http://localhost:3001/import/:path*',
      },
      {
        source: '/users/:path*',
        destination: 'http://localhost:3001/users/:path*',
      },
      {
        source: '/cards/:path*',
        destination: 'http://localhost:3001/cards/:path*',
      },
      {
        source: '/webhooks/:path*',
        destination: 'http://localhost:3001/webhooks/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
      {
        source: '/admin/:path*',
        destination: 'http://localhost:3001/admin/:path*',
      },
      {
        source: '/whatsapp/:path*',
        destination: 'http://localhost:3001/whatsapp/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
