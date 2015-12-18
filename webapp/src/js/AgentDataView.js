'use strict';

const $ = require('jquery');
const _ = require('underscore');
const Marionette = require('backbone.marionette');
const Rickshaw = require('rickshaw');

const AgentLogsOverlay = require('./AgentLogsOverlay');

module.exports = Marionette.ItemView.extend({
    className: 'agent-tile',
    template: require('./agentData.hbs'),

    events: {
        'click button[name="view-logs"]': 'onClickViewLogs'
    },

    serializeData: function() {
        return _.extend({}, this.model.attributes, {
            processDataCollection: this.model.attributes.processDataCollection.toJSON(),
            diskDataCollection: this.model.attributes.diskDataCollection.toJSON()
        });
    },

    onRender: function() {
        this._drawCpuMetricsChart();
    },

    _drawCpuMetricsChart: function() {
        const series = [{
            name: 'system',
            data: [],
            color: 'red'
        }, {
            name: 'user',
            data: [],
            color: 'blue'
        }];

        this.model.get('cpuMetrics').reduce((memo, datum) => {
            if (datum.kernelUtilization && datum.userUtilization) {
                memo[0].data.push({
                    x: datum.sampleTime,
                    y: datum.kernelUtilization
                });
                memo[1].data.push({
                    x: datum.sampleTime,
                    y: datum.userUtilization
                });
            }

            return memo;
        }, series);

        if (series[0].data.length) {
            var graph = new Rickshaw.Graph({
                element: this.$('.cpu-info-chart').get(0),
                width: 600,
                height: 80,
                max: 125,
                series: series,
                renderer: 'line'
            });
            graph.render();
        }
    },

    onClickViewLogs: function() {
        const overlay = new AgentLogsOverlay({
            model: this.model
        });
        $('body').append(overlay.render().el);
    }
});
