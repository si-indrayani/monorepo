// Dynamically loads built app scripts and styles
(function() {
  var stylesheets = ["https://si-gaming-fantasy.s3.amazonaws.com/puzzle/static/css/main.8d9ceaeb.css?v=1761047908912"];
  stylesheets.forEach(function(href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  });
  
  var scripts = ["https://si-gaming-fantasy.s3.amazonaws.com/puzzle/static/js/main.06db089a.js?v=1761047908912"];
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
})();