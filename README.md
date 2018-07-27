# klektastic

> index klekt into Elasticsearch

## Installation

```sh
❯ yarn add klektastic
```

## Usage

```js
const klektastic = require('klektastic');

const configuration = {
  'product': '10035',
  'proxy': 'localhost:8118'
};

async function save () {
  try {
    const inventory = await klektastic.browse(configuration);

    await klektastic.bulk(inventory);
  } catch (e) {
    console.error(e);
  }
}

save();
```
