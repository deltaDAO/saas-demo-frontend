module.exports = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.(tsx|ts)$/,
      use: [{ loader: '@svgr/webpack', options: { icon: true } }],
    })

    config.resolve.fallback = { fs: false, net: false, tls: false }

    return config
  },
}
