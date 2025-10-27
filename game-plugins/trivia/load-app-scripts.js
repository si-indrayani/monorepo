// Dynamically loads built app scripts and styles
(function() {
  var stylesheets = ["https://si-gaming-fantasy.s3.amazonaws.com/trivia/static/css/main.89162b4a.css?v=1761047916549"];
  stylesheets.forEach(function(href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  });
  
  var scripts = ["https://si-gaming-fantasy.s3.amazonaws.com/trivia/static/js/main.0f2e10fc.js?v=1761047916549"];
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
        window.dispatchEvent(new CustomEvent('trivia-scripts-loaded'));
      }
    };
    s.onerror = function() {
      // Handle error silently
    };
    document.body.appendChild(s);
  });
})();