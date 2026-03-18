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

const replacements = [
  ["require('./router')", "require('./router/index')"],
  ["require('./middleware/init')", "require('./middleware/init.js')"],
  ["require('./middleware/query')", "require('./middleware/query.js')"],
];

files.forEach(filePath => {
  const abs = path.resolve(__dirname, '..', filePath);
  if (!fs.existsSync(abs)) return;
  let src = fs.readFileSync(abs, 'utf8');
  let changed = false;
  replacements.forEach(([from, to]) => {
    if (src.includes(from)) {
      src = src.split(from).join(to);
      changed = true;
    }
  });
  if (changed) {
    fs.writeFileSync(abs, src);
    console.log(`patched: ${filePath}`);
  }
});
