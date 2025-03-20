import { spawnSync, spawn, type ChildProcess } from 'child_process';
import os from 'node:os';
import path from 'node:path';

// keep track of the `tauri-driver` child process
let tauriDriver: ChildProcess;

export const config: WebdriverIO.Config = {
  //
  // ====================
  // Runner Configuration
  // ====================
  // WebdriverIO supports running e2e tests as well as unit and component tests.
  runner: 'local',
  //
  // ==================
  // Specify Test Files
  // ==================
  // Define which test specs should run. The pattern is relative to the directory
  // of the configuration file being run.
  //
  // The specs are defined as an array of spec files (optionally using wildcards
  // that will be expanded). The test for each spec file will be run in a separate
  // worker process. In order to have a group of spec files run in the same worker
  // process simply enclose them in an array within the specs array.
  //
  // The path of the spec files will be resolved relative from the directory of
  // of the config file unless it's absolute.
  //
  specs: ['./tests/**/*.ts'],
  // Patterns to exclude.
  exclude: [
    // 'path/to/excluded/files'
  ],
  maxInstances: 1,
  //
  // If you have trouble getting all important capabilities together, check out the
  // Sauce Labs platform configurator - a great tool to configure your capabilities:
  // https://saucelabs.com/platform/platform-configurator
  capabilities: [
    {
      // maxInstances: 1,
      hostname: '127.0.0.1',
      port: 4444,
      // @ts-expect-error types for tauri capabilities are not available
      'tauri:options': {
        application: './src-tauri/target/release/tauri-app.exe',
        appArgs: [],
        webviewOptions: {},
      },
    },
  ],
  reporters: ['spec'],
  //
  // ===================
  // Test Configurations
  // ===================
  // Define all options that are relevant for the WebdriverIO instance here
  //
  // Level of logging verbosity: trace | debug | info | warn | error | silent
  logLevel: 'info',
  //
  // Set specific log levels per logger
  // loggers:
  // - webdriver, webdriverio
  // - @wdio/browserstack-service, @wdio/lighthouse-service, @wdio/sauce-service
  // - @wdio/mocha-framework, @wdio/jasmine-framework
  // - @wdio/local-runner
  // - @wdio/sumologic-reporter
  // - @wdio/cli, @wdio/config, @wdio/utils
  // Level of logging verbosity: trace | debug | info | warn | error | silent
  // logLevels: {
  //     webdriver: 'info',
  //     '@wdio/appium-service': 'info'
  // },
  //
  // If you only want to run your tests until a specific amount of tests have failed use
  // bail (default is 0 - don't bail, run all tests).
  bail: 0,
  //
  // Set a base URL in order to shorten url command calls. If your `url` parameter starts
  // with `/`, the base url gets prepended, not including the path portion of your baseUrl.
  // If your `url` parameter starts without a scheme or `/` (like `some/path`), the base url
  // gets prepended directly.
  // baseUrl: 'http://localhost:8080',
  //
  // Default timeout for all waitFor* commands.
  waitforTimeout: 10000,
  //
  // Default timeout in milliseconds for request
  // if browser driver or grid doesn't send response
  connectionRetryTimeout: 120000,
  //
  // Default request retries count
  connectionRetryCount: 3,

  framework: 'mocha',

  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },

  onPrepare: () => spawnSync('pnpm', ['tauri:build']),
  beforeSession: () =>
    (tauriDriver = spawn(path.resolve(os.homedir(), '.cargo', 'bin', 'tauri-driver'), [], {
      stdio: [null, process.stdout, process.stderr],
    })),
  afterSession: () => {
    tauriDriver.kill();
  },
};
