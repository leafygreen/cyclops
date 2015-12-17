'use strict';

const Backbone = require('backbone');

module.exports = Backbone.Model.extend({
    defaults: {
        name: null,
        errorCode: 0,
        lastGoalVersionAchieved: -1,
        plan: null,
        cpuMetrics: [],
        sampleTime: null,
        cpuTimeKernel: null,
        cpuTimeUser: null
    },

    handleStatus: function(status) {
        this.set({
            errorCode: status.errorCode,
            lastGoalVersionAchieved: status.lastGoalVersionAchieved,
            plan: status.plan
        });
    },

    handleCpuMetrics: function(metrics) {
        this.get('cpuMetrics').push(metrics);
        this.set({
            sampleTime: new Date(metrics.sampleTime).toISOString(),
            cpuTimeKernel: metrics.kernel,
            cpuTimeUser: metrics.user
        });
    }
});
