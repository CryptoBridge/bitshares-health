const { Apis } = require('bitsharesjs-ws');
const { ChainStore } = require('bitsharesjs');
const got = require('got');

module.exports = class HealthCheck {
    constructor({ ws, es, api }) {
        this.ws = ws;
        this.es = es;
        this.api = api;
    }

    static async getInstance(options = {}, ws, es) {
        const consoleInfo = options.reconnect ? () => {} : console.info;

        let api;
        try {
            api = await Apis.instance(ws, true).init_promise;
            consoleInfo(`Connected to ${api[0].network_name}, core_asset: ${api[0].network.core_asset}, chain_id: ${api[0].network.chain_id}`);
        } catch (err) {
            throw new Error(`Error connecting to node: ${err.message}`);
        }

        try {
            ChainStore.init();
            consoleInfo(`ChainStore initialized at ${ws}`);
        } catch (err) {
            throw new Error(`Error in ChainStore.init() at ${ws}: ${err.message}`);
        }

        if (es) {
            consoleInfo(`Elasticsearch wrapper initialized at ${es}`);
        }

        return new HealthCheck({ ws, es, api: Apis.instance() });
    }

    async bitshares() {
        let response;
        try {
            response = await this.api.db_api().exec('get_objects', [['2.1.0'], false]).then(res => res[0]);
        } catch (err) {
            throw new Error(`Error in get_objects: ${err}`);
        }

        if (!(response && response.id === '2.1.0')) {
            throw new Error('Invalid response from node.');
        }

        const now = Date.now();
        const time = Date.parse(`${response.time}Z`);

        if ((now - time) > 60000) {
            throw new Error(`Blockchain out of sync at block ${response.head_block_number}, latest block on ${new Date(time).toISOString().substr(0, 19).replace(/T/g, ' ')} (${Math.round((now - time) / 1000)} seconds behind).`);
        }

        return { url: this.ws, response };
    }

    async esWrapper() {
        if (this.es) {
            const minutes = process.env.ES_WRAPPER_MINUTES || 10;
            const to = new Date();
            const from = new Date(to); from.setMinutes(to.getMinutes() - minutes);
            let url = `${this.es}/get_account_history?account_id=${process.env.BITSHARES_ACCOUNT_ID || '1.2.374566'}&from=0&size=1&sort_by=block_data.block_time&from_date=${from.toISOString()}&to_date=${to.toISOString()}`;

            let response;
            try {
                response = await got(url, { json: true }).then(res => res.body ? res.body : {});
            } catch (err) {
                throw new Error(`Invalid response from elasticsearch wrapper: ${err}`);
            }

            if (!Array.isArray(response) || !response.length) {
                url = `${this.es}/get_account_history?account_id=${process.env.BITSHARES_ACCOUNT_ID || '1.2.374566'}&from=0&size=1&sort_by=block_data.block_time&to_date=${to.toISOString()}`;
                let blockData = {};
                try {
                    blockData = await got(url, { json: true }).then(res => res.body ? res.body[0].block_data : {});
                } catch (err) {}

                if (!blockData.block_num) {
                    throw new Error(`Account history out of sync, no tx found within ${minutes} minutes.`);
                }

                const now = Date.now();
                const time = Date.parse(`${blockData.block_time}Z`);

                throw new Error(`Account history out of sync at block ${blockData.block_num}, latest tx on ${new Date(time).toISOString().substr(0, 19).replace(/T/g, ' ')} (${Math.round((now - time) / 1000)} seconds behind).`);
            }

            return { url, response: response[0].block_data };
        }
    }
};
