// settings.mjs (written by chatgpt)
import fs from "fs";
import path from "path";

const CACHE_FILE_PATH = path.resolve(process.cwd(), ".cache.json");

let cache = new Map();

// Load values from .cache.json if it exists.
function loadCache() {
  try {
    const data = fs.readFileSync(CACHE_FILE_PATH, "utf-8");
    const json = JSON.parse(data);
    for (const key in json) {
      cache.set(key, json[key]);
    }
  } catch (err) {
    if (err.code === "ENOENT") {
      // Set defaults if the file not found
      set("cookies", null);
    } else {
      throw err; // Re-throw errors other than "file not found"
    }
  }
}

// Save the values to .cache.json
function saveCache() {
  const json = Object.fromEntries(cache);
  // Ignore undefined values
  for (const key in json) {
    if (json[key] === undefined) {
      delete json[key];
    }
  }
  fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(json, null, 2));
}

// Set a key-value pair
function set(key, value) {
  if (value === undefined) {
    cache.delete(key);
  } else {
    cache.set(key, value);
  }
  saveCache();
}

// Get a value by its key
function get(key) {
  return cache.get(key);
}

// Initialization
loadCache();

export { set, get };
