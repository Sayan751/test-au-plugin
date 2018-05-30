'use strict';
const path = require('path');

module.exports = function (config) {
    config.set({
        // base path that will be used to resolve all patterns (e.g. files, exclude)
        basePath: "./",

        // Frameworks to use available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser; we are building the test environment in ./spec-bundle.js
        files: [ { pattern: 'tests/karma-bundle.js', watched: false } ],

        // preprocess matching files before serving them to the browser; available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'tests/karma-bundle.js': ['webpack', 'sourcemap']
        },

        webpack: require('./tests/webpack.config')({
            srcDir: path.resolve(__dirname, "src"),
            outDir: path.resolve(__dirname, "dist"),
            testDir: path.resolve(__dirname, "tests"),
            isTest: true
        }),

        // test results reporter to use; available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ["mocha", "kjhtml"], 

        client: { clearContext: false },

        // Webpack please don't spam the console when running in karma!
        webpackServer: { stats: "errors-only" },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // start these browsers available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [ 'Chrome' ],

        // Continuous Integration mode if true, Karma captures browsers, runs the tests and exits
        singleRun: false,
    })
}