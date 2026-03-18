// Explicit require so nft static tracer includes path-to-regexp in the bundle.
// Express 5's router dependency uses a bare-string "exports" field that nft
// cannot trace transitively — this top-level require forces inclusion.
require('path-to-regexp');

const serverless = require('serverless-http');
const app = require('../../src/app');

exports.handler = serverless(app);
