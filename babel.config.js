module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          tests: ['./tests/'],
          '@': './app-v3',
          'app-v2': './app',
          'app-v1': './app-v1',
          types: './types',
        },
      },
    ],
  ],
};
