import React from 'react';
import App from './App';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './store'
import "./assets/scss/main.scss";
import '../src/styles.css'
import '../src/mainstyle.scss'
import reportWebVitals from "./reportWebVitals";
import { createRoot } from 'react-dom/client';
import 'react-toastify/dist/ReactToastify.css';

import './socket/socket';

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  // document.getElementById('root')
);

reportWebVitals();