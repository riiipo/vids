(function() {
  const React = require('react');
  const ReactDOM = require('react-dom');
  
  window.React = React;
  window.ReactDOM = ReactDOM;
  
  // Also expose commonly used functions
  if (React.useState) window.useState = React.useState;
  if (React.useEffect) window.useEffect = React.useEffect;
})();
