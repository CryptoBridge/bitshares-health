Bitshares Health check
======================

## Install

    npm install -g bitshares-health

## Usage

    btshealth wss://eu.nodes.bitshares.ws
    btshealth wss://eu.nodes.bitshares.ws --es # uses https://eu.nodes.bitshares.ws:8443 
    btshealth wss://eu.nodes.bitshares.ws http://95.216.32.252:5010

## Development

    nodemon bin/cli.js wss://eu.nodes.bitshares.ws
    nodemon bin/cli.js wss://eu.nodes.bitshares.ws http://95.216.32.252:5010
