// const readline = require("readline");
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const prompt =
  "Paste tokenURI (data:application/json;base64,...) and press Enter:\n";

rl.question(prompt, (answer) => {
  let uri = answer.trim();
  if (!uri) {
    console.error("No input provided.");
    rl.close();
    process.exit(1);
  }

  if (uri.startsWith('"') && uri.endsWith('"')) {
    uri = uri.slice(1, -1).trim();
  }

  const commaIndex = uri.indexOf(",");
  if (commaIndex === -1) {
    console.error("Invalid tokenURI format. Missing comma separator.");
    rl.close();
    process.exit(1);
  }

  const b64 = uri.slice(commaIndex + 1).trim();
  let decoded;
  try {
    decoded = Buffer.from(b64, "base64").toString("utf8");
  } catch (error) {
    console.error("Failed to decode base64 JSON payload.");
    console.error(error.message);
    rl.close();
    process.exit(1);
  }

  let json;
  try {
    json = JSON.parse(decoded);
  } catch (error) {
    console.error("Decoded payload is not valid JSON.");
    console.error(error.message);
    rl.close();
    process.exit(1);
  }

  console.log("Metadata JSON:");
  console.log(JSON.stringify(json, null, 2));

  if (typeof json.image !== "string") {
    console.log("No image field found in metadata.");
    rl.close();
    return;
  }

  const imagePrefix = "data:image/svg+xml;base64,";
  if (!json.image.startsWith(imagePrefix)) {
    console.log("Image is not an SVG data URI.");
    rl.close();
    return;
  }

  const imageB64 = json.image.slice(imagePrefix.length).trim();
  let svg;
  try {
    svg = Buffer.from(imageB64, "base64").toString("utf8");
  } catch (error) {
    console.error("Failed to decode base64 SVG image.");
    console.error(error.message);
    rl.close();
    process.exit(1);
  }

  console.log("SVG Image:");
  console.log(svg);
  rl.close();
});
