const klektastic = require('../');

const configuration = {
  'product': '9143',
  'proxy': 'localhost:8118'
};

async function save () {
  try {
    const product = await klektastic.browse(configuration);

    await klektastic.bulk(product);
  } catch (e) {
    console.error(e);
  }
}

save();
