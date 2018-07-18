#!/usr/bin/env node

const os = require('os');
const express = require('express');
const HealthCheck = require('../lib/healthcheck');
const pkg = require('../package.json');

console.log = () => {};

process.on('uncaughtException', err => {
    console.error(err.message);
    process.exit(1);
});
process.on('unhandledRejection', err => {
    console.error(err.message);
});

function asyncMiddleware(fn) {
    return (req, res, next) => {
        Promise
            .resolve(fn(req, res, next))
            .catch(next);
    };
}

function parseArgs() {
    const args = process.argv;
    if (args[2] === '--es') {
        return [null, '--es'];
    }
    return [args[2], args[3]]
}

(async function() {
    const args = parseArgs();
    const app = express();
    let inst = await HealthCheck.getInstance(undefined, ...args);

    setInterval(async () => {
        inst = await HealthCheck.getInstance({ reconnect: true }, ...args);
    }, process.env.RECONNECT_INTERVAL || 30000);

    app.get('/health', (req, res) => {
        res.status(200).json({ healthy: true, hostname: os.hostname() });
    });

    app.get('/info', (req, res) => {
        res.status(200).json({ name: pkg.name, version: pkg.version });
    });

    app.get('/', asyncMiddleware(async(req, res) => {
        const status = { healthy: true, hostname: os.hostname() };
        try {
            status.bitshares = await inst.bitshares();
        } catch (err) {
            res.status(502);
            status.healthy = false;
            status.bitshares = { error: err.message };
            console.error(`Error: ${err.message}`);
        }
        try {
            status.esWrapper = await inst.esWrapper();
        } catch (err) {
            res.status(502);
            status.healthy = false;
            status.esWrapper = { error: err.message };
            console.error(`Error: ${err.message}`);
        }
        res.json(status);
    }));

    app.get('/bitshares', asyncMiddleware(async(req, res) => {
        const status = { healthy: true, hostname: os.hostname() };
        try {
            status.bitshares = await inst.bitshares();
        } catch (err) {
            res.status(502);
            status.healthy = false;
            status.bitshares = { error: err.message };
            console.error(`Error: ${err.message}`);
        }
        res.json(status);
    }));

    app.get('/eswrapper', asyncMiddleware(async(req, res) => {
        const status = { healthy: true, hostname: os.hostname() };
        try {
            status.esWrapper = await inst.esWrapper();
        } catch (err) {
            res.status(502);
            status.healthy = false;
            status.esWrapper = { error: err.message };
            console.error(`Error: ${err.message}`);
        }
        res.json(status);
    }));

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.info('Bitshares health check is running on port ' + port);
        inst.bitshares().catch(err => console.error(`Unhealthy ${err}`));
        inst.esWrapper().catch(err => console.error(`Unhealthy ${err}`));
    });
}());
