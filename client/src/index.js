import React from 'react';
import ReactDOM from 'react-dom';
import { GeistProvider, CssBaseline } from '@geist-ui/react';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <GeistProvider>
      <CssBaseline />
      <App />
    </GeistProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
