'use strict';

const Backbone = require('backbone');

module.exports = Backbone.Model.extend({
    defaults: {
        name: null,
        tags: [],
        diskMetrics: [],
        sampleTime: null,
        diskSpaceUsed: null,
        diskSpaceFree: null,
        readCount: null,
        writeCount: null
    },

    handleDiskMetrics: function(metrics) {
        this.get('diskMetrics').push(metrics);
        this.set({
            tags: metrics.tags,
            sampleTime: new Date(metrics.sampleTime).toISOString(),
            diskSpaceUsed: metrics.diskSpaceUsed,
            diskSpaceFree: metrics.diskSpaceFree,
            readCount: metrics.readCount,
            writeCount: metrics.writeCount
        });
    }
});
