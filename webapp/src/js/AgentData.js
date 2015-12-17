'use strict';

const Backbone = require('backbone');

const ProcessData = require('./ProcessData');
const ProcessDataCollection = Backbone.Collection.extend({
    model: ProcessData,
    comparator: 'name'
});

module.exports = Backbone.Model.extend({
    defaults: {
        hostname: null,
        lastPing: null,
        logs: [],
        processMap: {},
        processDataCollection: new ProcessDataCollection()
    },

    handleMessage: function(type, content) {
        this.set('lastPing', new Date().getTime());
        switch (type) {
            case 'status': this.handleStatusMessage(content); break;
            case 'log': this.handleLogMessage(content); break;
            case 'metrics': this.handleMetricsMessage(content); break;
        }
    },

    handleStatusMessage: function(content) {
        content.forEach(status => {
            const processData = this._findOrCreateProcessData(status.name);
            processData.handleStatus(status);
        });
    },

    handleLogMessage: function(content) {
        this.set('logs', this.get('logs').concat(content));
    },

    handleMetricsMessage: function(content) {

    },

    _findOrCreateProcessData: function(name) {
        const processMap = this.get('processMap');
        let processData = processMap[name];
        if (!processData) {
            processData = new ProcessData({ name });
            processMap[name] = processData;
            this.get('processDataCollection').add(processData);
        }

        return processData;
    },
});
