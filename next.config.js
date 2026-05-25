/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'sequelize', 'pg', 'pg-hstore', 'sqlite3', 'bcryptjs']
    }
    return config
  },
}

module.exports = nextConfig
