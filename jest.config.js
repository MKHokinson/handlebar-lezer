module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest',
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'ts', 'json', 'node'],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  testMatch: [
    "**/*.test.ts",
    "**/__tests__/**/*.test.ts"
  ],
};