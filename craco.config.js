const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Optimize chunking strategy
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Vendor chunk for common dependencies
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              priority: 10,
              reuseExistingChunk: true,
            },
            // Separate chunk for Firebase
            firebase: {
              test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
              name: 'firebase',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Separate chunk for React ecosystem
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
              name: 'react-vendor',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Separate chunk for charting libraries
            charts: {
              test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
              name: 'charts',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Separate chunk for UI libraries
            ui: {
              test: /[\\/]node_modules[\\/](lucide-react|framer-motion|@headlessui)[\\/]/,
              name: 'ui-vendor',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Common chunk for shared code
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };

      // Add module aliases for cleaner imports
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@': paths.appSrc,
        '@components': `${paths.appSrc}/components`,
        '@pages': `${paths.appSrc}/pages`,
        '@services': `${paths.appSrc}/services`,
        '@utils': `${paths.appSrc}/utils`,
        '@hooks': `${paths.appSrc}/hooks`,
        '@contexts': `${paths.appSrc}/contexts`,
        '@store': `${paths.appSrc}/store`,
        '@assets': `${paths.appSrc}/assets`,
      };

      // Add bundle analyzer in development
      if (env === 'development' && process.env.ANALYZE_BUNDLE) {
        webpackConfig.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            analyzerPort: 8888,
            openAnalyzer: true,
          })
        );
      }

      // Add moment.js optimization (if used)
      webpackConfig.plugins.push(
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/)
      );

      // Enable tree shaking for ES6 modules
      webpackConfig.optimization.usedExports = true;
      webpackConfig.optimization.sideEffects = false;

      return webpackConfig;
    },
  },
};