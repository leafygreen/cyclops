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
            name: 'kernel',
            data: [],
            color: 'red'
        }, {
            name: 'user',
            data: [],
            color: 'blue'
        }];

        this.model.get('cpuMetrics').reduce((memo, datum) => {
            memo[0].data.push({
                x: datum.sampleTime,
                y: datum.kernel
            });
            memo[1].data.push({
                x: datum.sampleTime,
                y: datum.user
            });
            return memo;
        }, series);

        var graph = new Rickshaw.Graph({
            element: this.$('.cpu-info-chart').get(0),
            width: 600,
            height: 80,
            max: 150,
            series: series,
            renderer: 'line'
        });
        graph.render();
    },

    onClickViewLogs: function() {
        const overlay = new AgentLogsOverlay({
            model: this.model
        });
        $('body').append(overlay.render().el);
    }
});
