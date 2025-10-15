const fs = require('fs');
const path = require('path');

// Path to built index.html
const htmlPath = path.join(__dirname, '../build/index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Extract <script src="..."></script>
const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["'][^>]*><\/script>/g;
let match;
const scripts = [];
while ((match = scriptRegex.exec(html)) !== null) {
  scripts.push(match[1]);
}

// Extract <link rel="stylesheet" href="...">
const cssRegex = /<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']stylesheet["'][^>]*>/g;
const stylesheets = [];
while ((match = cssRegex.exec(html)) !== null) {
  stylesheets.push(match[1]);
}

// Generate loader script
const baseUrl = 'https://si-gaming-fantasy.s3.amazonaws.com/puzzle'; // Replace with your actual S3 bucket URL
const cacheBuster = '?v=' + Date.now(); // Cache busting parameter

// Filter out absolute paths and convert relative paths
const relativeScripts = scripts.filter(src => !src.startsWith('http') && !src.startsWith('//'));
const relativeStylesheets = stylesheets.filter(href => !href.startsWith('http') && !href.startsWith('//'));

const loader = `// Dynamically loads built app scripts and styles
(function() {
  var stylesheets = ${JSON.stringify(relativeStylesheets.map(href => baseUrl + href + cacheBuster))};
  stylesheets.forEach(function(href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  });
  
  var scripts = ${JSON.stringify(relativeScripts.map(src => baseUrl + src + cacheBuster))};
  var loadedCount = 0;
  var totalScripts = scripts.length;
  
  scripts.forEach(function(src) {
    var s = document.createElement('script');
    s.src = src;
    s.async = true; // Load asynchronously for better performance
    s.onload = function() {
      loadedCount++;
      if (loadedCount === totalScripts) {
        // Dispatch event to signal all scripts are ready
        window.dispatchEvent(new CustomEvent('puzzle-scripts-loaded'));
      }
    };
    s.onerror = function() {
      // Handle error silently
    };
    document.body.appendChild(s);
  });
})();`;

// Write loader to file
const outPath = path.join(__dirname, '../build/load-app-scripts.js');
fs.writeFileSync(outPath, loader);