// Dynamically loads built app scripts and styles
(function() {
  var stylesheets = ["https://si-gaming-fantasy.s3.amazonaws.com/trivia/static/css/main.60fa25de.css?v=" + Date.now()];
  stylesheets.forEach(function(href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  });
  
  var scripts = ["https://si-gaming-fantasy.s3.amazonaws.com/trivia/static/js/main.bea2ff82.js?v=" + Date.now()];
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