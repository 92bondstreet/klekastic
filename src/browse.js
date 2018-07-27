const {API_ALGOLIA_URL} = require('./constants');
const randomUseragent = require('random-useragent');
const request = require('superagent');

require('superagent-proxy')(request);

const RANDOM_USER_AGENT = randomUseragent.getRandom(ua => ua.osName === 'Mac OS' && ua.browserName === 'Chrome' && parseFloat(ua.browserVersion) >= 50);
const STATUS = /^[2-3][0-9][0-9]$/;
const TIMEOUT = 60000;
const HEADERS = {
  'accept': '*/*',
  'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
  'cache-control': 'no-cache',
  'pragma': 'no-cache',
  'referer': 'https://stockx.com',
  'user-agent': RANDOM_USER_AGENT,
  'x-requested-with': 'XMLHttpRequest'
};

/**
 * Format superagent error for better logging
 * @param  {String} reason
 * @param  {Object} response
 * @return {String}
 */
const formatError = (reason, response) => {
  const splitMessage = response.message ? response.message.split('\n') : [response.error];
  const message = splitMessage[splitMessage.length - 1];
  const status = response.status || response.type || response.name;

  return `${reason} - ${status} - ${message}`;
};

const supererror = error => {
  let message = formatError('UNTRACKED_ERROR', error);
  const {response} = error;

  if (error.status === 404) {
    message = 'PAGE_NOT_FOUND';
  } else if (response && ! STATUS.test(response.status)) {
    message = formatError('STATUS_4xx_5xx', response);
  }

  return message;
};

/**
 * [flat description]
 * @param  {[type]} product [description]
 * @return {[type]}         [description]
 */
const flat = product => {
  const {'inventory': inventories} = product;

  delete product.inventory;

  return inventories.map(inventory => Object.assign(inventory, product));
};

 /**
 * [browse description]
 * @param  {Object} configuration
 * @return {Array}
 */
module.exports = async function browse (configuration) {
  const {product, proxy} = configuration;
  const action = `${API_ALGOLIA_URL}/${product}`;
  const queries = {
    'x-algolia-agent': 'Algolia for vanilla JavaScript (lite) 3.24.9',
    'x-algolia-application-id': '4BGYHA3FMU',
    'x-algolia-api-key': 'e1de1e2a0ec319eb6d78b7a462516981'
  };
  let rqst;

  return new Promise(async (resolve, reject) => {
    const timer = setTimeout(() => {
      rqst.abort();
      reject('STRICT_TIMEOUT');
    }, TIMEOUT);

    rqst = request.agent()
      .get(action)
      .query(queries)
      .set(HEADERS)
      .timeout(TIMEOUT);

    if (proxy) {
      rqst = rqst.proxy(`http://${proxy}`);
    }

    try {
      const response = await rqst;

      clearTimeout(timer);

      if (! STATUS.test(response.status)) {
        const message = formatError('STATUS_4xx_5xx', response);

        return reject(message);
      }

      return resolve(flat(JSON.parse(response.text)));
    } catch (err) {
      clearTimeout(timer);
      return reject(supererror(err));
    }
  });
};
