'use strict';

const Backbone = require('backbone');

module.exports = Backbone.Model.extend({
    defaults: {
        name: null,
        diskMetrics: []
    },

    handleDiskMetrics: function(metrics) {
        this.get('diskMetrics').push(metrics);
    }
});
