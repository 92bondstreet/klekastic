const {env} = process;
const ELK_HOST = env.ELK_HOST || 'localhost:9200';

module.exports = {
  'API_ALGOLIA_URL': 'https://4bgyha3fmu-dsn.algolia.net/1/indexes/dev_products2',
  'ELK_URI': `http://${ELK_HOST}`
};
