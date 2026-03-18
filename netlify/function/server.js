// nft cannot resolve express's internal directory requires at trace time.
// Explicitly requiring each internal module via absolute package paths
// forces nft to include them in the function bundle.
require('express/lib/router');
require('express/lib/router/route');
require('express/lib/router/layer');
require('express/lib/middleware/init');
require('express/lib/middleware/query');
require('express/lib/request');
require('express/lib/response');
require('express/lib/utils');
require('express/lib/view');
require('express/lib/application');

const serverless = require('serverless-http');
const app = require('../../src/app');

exports.handler = serverless(app);
