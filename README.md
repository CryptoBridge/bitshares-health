Bitshares Health check
======================

## Install

    npm install -g bitshares-health

## Usage

    btshealth wss://your-bitshares-node-url
    btshealth wss://your-bitshares-node-url --es # defaults to https://your-bitshares-node-url:5000 
    btshealth wss://your-bitshares-node-url http://your-es-wrapper-url:5000

Now you (or most likely your LB) can curl for the health state:

    curl localhost:3000/
    
The success response comes with a `200` status code and looks like this:

```
{
  "healthy": true,
  "hostname": "myhost.com",
  "bitshares": {
    "url": "wss://your-bitshares-node-url",
    "response": {
      "id": "2.1.0",
      "head_block_number": 28834189,
      "head_block_id": "01b7f98d32cbc4fb68a110a62eac8e107ab07615",
      "time": "2018-07-18T14:52:39",
      "current_witness": "1.6.110",
      "next_maintenance_time": "2018-07-18T15:00:00",
      "last_budget_time": "2018-07-18T14:00:00",
      "witness_budget": 15000000,
      "accounts_registered_this_interval": 72,
      "recently_missed_count": 0,
      "current_aslot": 28988829,
      "recent_slots_filled": "340282366920938463463374607431768211455",
      "dynamic_flags": 0,
      "last_irreversible_block_num": 28834171
    }
  },
  "esWrapper": {
    "url": "http://your-es-wrapper-url:5000/get_account_history?account_id=1.2.374566&from=0&size=1&sort_by=block_data.block_time&from_date=2018-07-18T14:42:41.986Z&to_date=2018-07-18T14:52:41.986Z",
    "response": {
      "block_num": 28834189,
      "block_time": "2018-07-18T14:52:39",
      "trx_id": "f9323a54d949a996e377d9dfbcc9a091b4383dd0"
    }
  }
}
```
 
The worst case error response comes with a `502` error code and looks like this:

```
{
  "healthy": false,
  "hostname": "myhost.com",
  "bitshares": {
    "error": "Blockchain out of sync at block 26237721, latest block on 2018-04-18 23:29:42 (7831220 seconds behind)."
  },
  "esWrapper": {
    "error": "Account history out of sync at block 28519406, latest tx on 2018-07-07 15:08:09 (949313 seconds behind)."
  }
}
```


## Development

    nodemon bin/cli.js wss://your-bitshares-node-url
    nodemon bin/cli.js wss://your-bitshares-node-url http://your-es-wrapper-url:5000


## License

Copyright &copy; 2018 [CryptoBridge](https://github.com/cryptobridge)

Licensed under the [MIT license](http://opensource.org/licenses/MIT).
