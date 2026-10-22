const { TestEnvironment: JSDOMEnvironment } = require("jest-environment-jsdom");
const { TextDecoder, TextEncoder } = require("node:util");
const {
  ReadableStream,
  TransformStream,
  WritableStream,
} = require("node:stream/web");

class JSDOMEnvironmentWithFetch extends JSDOMEnvironment {
  constructor(config, context) {
    super(config, context);

    const polyfills = {
      fetch: globalThis.fetch,
      Headers: globalThis.Headers,
      ReadableStream,
      Request: globalThis.Request,
      Response: globalThis.Response,
      TextDecoder,
      TextEncoder,
      TransformStream,
      WritableStream,
    };

    for (const [name, value] of Object.entries(polyfills)) {
      this.global[name] = value;
    }
  }
}

module.exports = JSDOMEnvironmentWithFetch;
