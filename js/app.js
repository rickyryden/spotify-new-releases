import React from 'react';
import ReactDOM from 'react-dom';

import App from './containers/App';

require('./bootstrap');

const app = document.getElementById('root');

ReactDOM.render(<App />, app);
