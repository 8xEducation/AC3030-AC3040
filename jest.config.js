module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/tests/**/*.spec.[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
