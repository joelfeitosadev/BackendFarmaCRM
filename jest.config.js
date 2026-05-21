module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/__mocks__/prisma.ts'],
  globals: {
    'ts-jest': {
      diagnostics: { ignoreCodes: [151002] }
    }
  },
  silent: false,
  verbose: true,
};
