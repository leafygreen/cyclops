'use strict';

const Backbone = require('backbone');

module.exports = Backbone.Model.extend({
    defaults: {
        name: null,
        errorCode: 0,
        lastGoalVersionAchieved: -1,
        plan: null,
        cpuMetrics: []
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
    }
});
