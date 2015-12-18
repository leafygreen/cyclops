'use strict';

const Backbone = require('backbone');

module.exports = Backbone.Model.extend({
    defaults: function() {
        return {
            name: null,
            tags: [],
            diskMetrics: [],
            diskSpaceUsed: null,
            diskSpaceFree: null
        };
    },

    handleDiskMetrics: function(metrics) {
        this.get('diskMetrics').push(metrics);
        this.set({
            tags: metrics.tags,
            diskSpaceUsed: metrics.diskSpaceUsed,
            diskSpaceFree: metrics.diskSpaceFree
        });
    }
});
