module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          jsxRuntime: "automatic",
          jsxImportSource: "react-native-css-interop",
        },
      ],
      "nativewind/babel",
    ],
    plugins: [
      // Add other plugins here if needed
    ],
  };
};