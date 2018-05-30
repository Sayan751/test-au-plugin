import 'aurelia-polyfills';
import 'aurelia-loader-webpack';

// disable stacktrace limit so we do not loose any error information
Error.stackTraceLimit = Infinity;

// load and run tests:
var testModuleContexts = loadTestModules();
runTests(testModuleContexts);

function loadTestModules() {
    var srcContext = require.context(
        // directory:
        '../src',
        // recursive:
        true,
        /\.ts$/im
    );

    var testContext = require.context(
        // directory:
        './',
        // recursive:
        true,
        // tests in ./unit folder regex:
        /\.spec\.[tj]s$/im
    );

    return [srcContext, testContext];
}

function runTests(contexts) {
    contexts.forEach(requireAllInContext);
}

function requireAllInContext(requireContext) {
    return requireContext.keys().map(requireContext);
}