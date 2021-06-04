import axios from 'axios';

const callApi = function callApi(url, options) {
    if (!options.mode) {
        options.mode = 'cors';
    }
    if (options.headers) {
        if (!options.headers['Content-Type']) {
            Object.assign(options.headers, { 'Content-Type': 'application/json' });
        }
        if (options.headers.Accept == null) {
            options.headers.Accept = 'application/json';
        }
    } else {
        options.headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };
    }
    options.url = url;
    // }

    return axios(options)
        .then(
            (response) => { return response; },
            (error) => { return error; },
        );
};

export default callApi;
