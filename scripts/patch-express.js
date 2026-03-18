/**
 * Patches express 4.x to use explicit file paths instead of directory requires.
 * Both nft and esbuild fail to trace implicit directory requires (e.g. require('./router')
 * resolving to router/index.js). This runs as a postinstall script so the fix
 * is applied before Netlify bundles the function.
 */
const fs = require('fs');
const path = require('path');

const files = [
  'node_modules/express/lib/application.js',
  'node_modules/express/lib/express.js',
];

files.forEach(filePath => {
  const abs = path.resolve(__dirname, '..', filePath);
  if (!fs.existsSync(abs)) return;
  let src = fs.readFileSync(abs, 'utf8');
  let originalSrc = src;

  // Replace exact occurrences to avoid .js.js issues
  // Using Regex prevents replacing require('./router/index.js') with require('./router/index.js.js')
  src = src.replace(/require\(['"]\.\/router['"]\)/g, "require('./router/index.js')");
  src = src.replace(/require\(['"]\.\/router\/index['"]\)/g, "require('./router/index.js')");
  src = src.replace(/require\(['"]\.\/middleware\/init['"]\)/g, "require('./middleware/init.js')");
  src = src.replace(/require\(['"]\.\/middleware\/query['"]\)/g, "require('./middleware/query.js')");

  if (src !== originalSrc) {
    fs.writeFileSync(abs, src);
    console.log(`patched: ${filePath}`);
  }
});
