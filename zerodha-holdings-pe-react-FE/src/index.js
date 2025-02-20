import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Add this line
import App from './App';
import reportWebVitals from './reportWebVitals';

// Temporarily disable strict mode
// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
