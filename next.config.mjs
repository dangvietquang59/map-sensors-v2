import createNextIntlPlugin from 'next-intl/plugin';

let userConfig = undefined;
try {
  userConfig = await import('./v0-user-next.config.mjs');
} catch (e) {
  try {
    userConfig = await import('./v0-user-next.config');
  } catch (innerError) {
    // ignore error
  }
}

const baseConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  output: 'standalone',
};

// Merge user config if exists
if (userConfig) {
  const config = userConfig.default || userConfig;
  for (const key in config) {
    if (typeof baseConfig[key] === 'object' && !Array.isArray(baseConfig[key])) {
      baseConfig[key] = {
        ...baseConfig[key],
        ...config[key],
      };
    } else {
      baseConfig[key] = config[key];
    }
  }
}

// Wrap with next-intl plugin
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(baseConfig);
