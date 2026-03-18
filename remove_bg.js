const { removeBackground } = require('@imgly/background-removal-node');
const fs = require('fs');

async function main() {
  console.log("Removing background...");
  try {
    const blob = await removeBackground('landing/public/images/model2.jpg');
    const buffer = Buffer.from(await blob.arrayBuffer());
    fs.writeFileSync('landing/public/images/model2-nobg.png', buffer);
    console.log("Success! Saved to landing/public/images/model2-nobg.png");
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
