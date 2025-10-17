// Dynamically loads built app scripts and styles
(function() {
  var stylesheets = ["https://si-gaming-fantasy.s3.amazonaws.com/trivia/static/css/main.89162b4a.css"];
  stylesheets.forEach(function(href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href + '?v=' + Date.now();
    document.head.appendChild(l);
  });
  
  var scripts = [
    
    "https://si-gaming-fantasy.s3.amazonaws.com/trivia/static/js/main.0f2e10fc.js"
  ];
  var loadedCount = 0;
  var totalScripts = scripts.length;
  
  scripts.forEach(function(src) {
    var s = document.createElement('script');
    s.src = src + '?v=' + Date.now();
    s.async = true; // Load asynchronously for better performance
    s.onload = function() {
      console.log('✅ Trivia script loaded successfully from:', src);
      loadedCount++;
      if (loadedCount === totalScripts) {
        console.log('🎮 All trivia scripts loaded, dispatching event');
        window.dispatchEvent(new CustomEvent('trivia-scripts-loaded'));
      }
    };
    s.onerror = function() {
      console.error('❌ Failed to load trivia script from:', src);
    };
    document.body.appendChild(s);
  });
})();