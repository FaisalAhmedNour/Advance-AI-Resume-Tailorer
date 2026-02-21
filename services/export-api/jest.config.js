export default {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
                tsconfig: {
                    esModuleInterop: true,
                    module: 'ESNext',
                    moduleResolution: 'node'
                }
            },
        ],
    },
    // Allow longer timeout for Playwright PDF rendering
    testTimeout: 30000,
};
