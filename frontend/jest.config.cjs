module.exports = {
  collectCoverageFrom: ['src/domain/**/*.js'],
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/**/*.test.js'],
  transform: {
    '^.+\\.[jt]sx?$': [
      'babel-jest',
      {
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                node: 'current',
              },
            },
          ],
        ],
      },
    ],
  },
};
