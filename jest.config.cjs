/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'backend/**/*.{js,ts,tsx}',
    '!backend/Models/**',
    '!backend/Routes/**',
    '!backend/Config/**',
    '!backend/server.tsx',
    '!**/index.{ts,tsx}',
    '!backend/Helpers/configLink.tsx',
    '!backend/Services/api-externes.services.handleNewsmech.tsx',
  ],
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.polyfills.cjs'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^react$': '<rootDir>/node_modules/react',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
}
