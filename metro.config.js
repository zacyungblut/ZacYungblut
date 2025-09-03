const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Fail build on TypeScript errors
config.typescript = {
  ...config.typescript,
};

module.exports = config;
