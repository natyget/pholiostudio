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

  // Replace exact occurrences to avoid .js.js issues across cached environments
  src = src.replace(/require\(['"]\.\/router['"]\)/g, "require('./router/index.js')");
  src = src.replace(/require\(['"]\.\/router\/index['"]\)/g, "require('./router/index.js')");
  src = src.replace(/require\(['"]\.\/middleware\/init['"]\)/g, "require('./middleware/init.js')");
  src = src.replace(/require\(['"]\.\/middleware\/query['"]\)/g, "require('./middleware/query.js')");

  if (src !== originalSrc) {
    fs.writeFileSync(abs, src);
    console.log(`patched: ${filePath}`);
  }
});

// Fix Netlify's nft/esbuild dropping server files due to 'browser' field confusion
const pkgTargets = [
  'node_modules/iconv-lite/package.json',
  'node_modules/readable-stream/package.json',
  'node_modules/pg/package.json'
];

pkgTargets.forEach(t => {
  const absPkg = path.resolve(__dirname, '..', t);
  if (fs.existsSync(absPkg)) {
    let pkg = JSON.parse(fs.readFileSync(absPkg, 'utf8'));
    if (pkg.browser) {
      delete pkg.browser;
      fs.writeFileSync(absPkg, JSON.stringify(pkg, null, 2));
      console.log(`Stripped browser field from: ${t}`);
    }
  }
});

// Netlify's Linux environment fundamentally physically rejects parsing extend-node.js.
// Since Express does not use Node's Buffer.isEncoding streaming overrides, we can brutally
// disable the dynamic requires.
const iconvFile = path.resolve(__dirname, '..', 'node_modules/iconv-lite/lib/index.js');
if (fs.existsSync(iconvFile)) {
    let code = fs.readFileSync(iconvFile, 'utf8');
    let ocode = code;
    code = code.replace(/require\(['"]\.\/streams['"]\)\(iconv\);/g, '// require("./streams")(iconv);');
    code = code.replace(/require\(['"]\.\/extend-node['"]\)\(iconv\);/g, '// require("./extend-node")(iconv);');
    if (code !== ocode) {
        fs.writeFileSync(iconvFile, code);
        console.log('Disabled optional esoteric Next/Netlify crashing extends inside iconv-lite.');
    }
}
