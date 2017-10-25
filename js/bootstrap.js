let config = {
	apiDomain: 'https://api.spotify.com/v1',
};

window.axios = require('axios');

window.axios.defaults.headers.common.Accept = 'application/json';
window.axios.defaults.baseURL = config.apiDomain;
