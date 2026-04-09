const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith(".tsx") || file.endsWith(".ts")) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk("src");

files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  let newContent = content
    .replace(/var\(--background\)/g, "var(--theme-bg)")
    .replace(/var\(--foreground\)/g, "var(--theme-text)")
    .replace(/var\(--card\)/g, "var(--theme-card)")
    .replace(/var\(--popover\)/g, "var(--theme-popover)")
    .replace(/var\(--primary\)/g, "var(--theme-primary)")
    .replace(/var\(--secondary\)/g, "var(--theme-secondary)")
    .replace(/var\(--muted\)/g, "var(--theme-muted)")
    .replace(/var\(--accent\)/g, "var(--theme-accent)")
    .replace(/var\(--destructive\)/g, "var(--theme-destructive)")
    .replace(/var\(--border\)/g, "var(--theme-border)")
    .replace(/var\(--input\)/g, "var(--theme-input)")
    .replace(/var\(--ring\)/g, "var(--theme-ring)")
    .replace(/var\(--radius\)/g, "var(--theme-radius)");

  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log("Updated", file);
  }
});