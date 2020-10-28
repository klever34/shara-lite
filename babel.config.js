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
          'app-v3': './app-v3',
          '@': './app',
          'app-v1': './app-v1',
          'types-v3': './types-v3',
          types: './types',
        },
      },
    ],
  ],
};
