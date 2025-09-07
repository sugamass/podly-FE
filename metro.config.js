const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Fix for react-native-url-polyfill ESModule import issues
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

// Fix for react-native-css-interop jsx-runtime resolution
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-css-interop/jsx-runtime': 'react-native-css-interop/dist/runtime/jsx-runtime',
  'react-native-css-interop/jsx-dev-runtime': 'react-native-css-interop/dist/runtime/jsx-dev-runtime',
};

module.exports = withNativeWind(config, { input: './global.css' });