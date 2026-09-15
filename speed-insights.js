// Vercel Speed Insights integration
// This script initializes Speed Insights for vanilla HTML/JavaScript

// Initialize the queue for Speed Insights
(function() {
  if (window.si) return;
  window.si = function() {
    window.siq = window.siq || [];
    window.siq.push(arguments);
  };
})();

// Inject the Speed Insights script
(function() {
  // Only inject in production (on Vercel)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return;
  }
  
  var script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/speed-insights/script.js';
  
  // Insert the script into the document head
  var firstScript = document.getElementsByTagName('script')[0];
  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }
})();
