/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['sequelize', 'pg', 'pg-hstore', 'bcryptjs'],
  // Forzar a NFT a incluir los node_modules de estos paquetes en el deployment
  // del Function. Sequelize hace require('pg') dinamico que NFT no rastrea
  // por si solo.
  outputFileTracingIncludes: {
    '/api/**': [
      './node_modules/pg/**',
      './node_modules/pg-hstore/**',
      './node_modules/sequelize/**',
      './node_modules/bcryptjs/**',
      './node_modules/pg-types/**',
      './node_modules/pg-pool/**',
      './node_modules/pg-protocol/**',
      './node_modules/pg-connection-string/**',
    ],
  },
}

module.exports = nextConfig
