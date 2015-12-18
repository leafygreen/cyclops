'use strict';

const $ = require('jquery');
const _ = require('underscore');
const Backbone = require('backbone');

const AgentData = require('./AgentData');
const AgentDataCollection = Backbone.Collection.extend({
    model: AgentData,
    comparator: 'hostname'
});

function ClopsStream(opts) {
    this.url = opts.url;
    this.connection = null;
    this.hasInitialData = $.Deferred();
    this.messageCount = 0;
    this.agentMap = {};
    this.agentCollection = new AgentDataCollection();
};

_.extend(ClopsStream.prototype, {
    createConnection: function() {
        this.connection = new WebSocket(this.url);
        this.connection.onopen = () => {
            console.log('Websocket.onopen', arguments);
        };

        this.connection.onerror = () => {
            console.log('WebSocket.onerror', arguments);
        };

        this.connection.onclose = () => {
            console.log('WebSocket.onclose', arguments);
            setTimeout(this.createConnection, 5000);
        };

        this.connection.onmessage = (message) => {
            console.log('WebSocket.onmessage', message.data);
            this._storeAgentData(message);
            this._trackMessageCount();
        };
    },

    _storeAgentData: function(message) {
        const data = JSON.parse(message.data);
        const hostname = data.ah;
        const type = data.type;
        const content = data.content;
        const agentData = this._findOrCreateAgentData(hostname);
        agentData.handleMessage(type, content);
    },

    _findOrCreateAgentData: function(hostname) {
        let agentData = this.agentMap[hostname];
        if (!agentData) {
            agentData = new AgentData({ hostname });
            this.agentMap[hostname] = agentData;
            this.agentCollection.add(agentData);
        }

        return agentData;
    },

    _trackMessageCount: function() {
        this.messageCount++;
        if (this.messageCount >= 3) {
            this.hasInitialData.resolve();
        }
    },

    getAgentDataCollection: function() {
        return this.agentCollection;
    },

    whenHasInitialData: function() {
        return this.hasInitialData.promise();
    }
});

module.exports = ClopsStream;
