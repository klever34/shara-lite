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
          '@': './app',
          'app-v1': './app-v1',
          'app-v2': './app-v2',
          types: './types',
          'types-v1': './types-v1',
          'types-v2': './types-v2',
        },
      },
    ],
  ],
};
