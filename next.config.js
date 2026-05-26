/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Paquetes que Next debe mantener fuera del bundle del lado servidor
  // PERO empaquetar en el deployment de la función serverless. Sin esto
  // Vercel's NFT no los detecta y require() falla en runtime.
  serverExternalPackages: ['sequelize', 'pg', 'pg-hstore', 'bcryptjs'],
}

module.exports = nextConfig
