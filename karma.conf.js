module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'karma-typescript'],
    files: [
      { pattern: 'src/**/*.ts', watched: true },
      { pattern: 'node_modules/express/**/*.js', included: false, watched: false },
      { pattern: 'node_modules/supertest/**/*.js', included: false, watched: false }
    ],
    preprocessors: {
      'src/**/*.ts': ['karma-typescript', 'coverage']
    },
    karmaTypescriptConfig: {
      compilerOptions: {
        module: 'commonjs',
        target: 'es5',
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        allowJs: true,
        types: ['jasmine', 'node']
      },
      tsconfig: './tsconfig.json',
      bundlerOptions: {
        transforms: [
          require('karma-typescript-es6-transform')()
        ],
        resolve: {
          directories: ['node_modules']
        }
      },
      coverageOptions: {
        exclude: /\.(d|spec|test)\.ts/i
      }
    },
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['progress', 'karma-typescript', 'coverage', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    singleRun: false,
    concurrency: Infinity
  });
};