'use strict';

const Backbone = require('backbone');

module.exports = Backbone.Model.extend({
    defaults: {
        hostname: null,
        lastPing: null
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

    },

    handleLogMessage: function(content) {

    },

    handleMetricsMessage: function(content) {

    }
});
