/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/lib/**/*.test.js"],
  transform: {
    "\\.js$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!(@react-native|expo)/)"],
};
