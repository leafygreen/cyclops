'use strict';

const $ = require('jquery');
const _ = require('underscore');
const Marionette = require('backbone.marionette');
const Rickshaw = require('rickshaw');

const AgentLogsOverlay = require('./AgentLogsOverlay');

module.exports = Marionette.ItemView.extend({
    className: 'tileset-item',
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
        this.model.get('diskDataCollection').forEach(disk => {
            this._drawDiskSpaceChart(disk);
        });
    },

    _drawCpuMetricsChart: function() {
        const palette = new Rickshaw.Color.Palette({ scheme: 'munin' });
        const series = [{
            name: 'kernel',
            data: [],
            color: palette.color()
        }, {
            name: 'user',
            data: [],
            color: palette.color()
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
            element: this.$('.cpuChart').get(0),
            width: 100,
            height: 100,
            series: series
        });
        graph.render();
    },

    _drawDiskSpaceChart: function(disk) {
        const palette = new Rickshaw.Color.Palette({ scheme: 'munin' });
        const series = [{
            name: 'diskSpaceFree',
            data: [],
            color: palette.color()
        }, {
            name: 'diskSpaceUsed',
            data: [],
            color: palette.color()
        }];

        disk.get('diskMetrics').reduce((memo, datum) => {
            memo[0].data.push({
                x: datum.sampleTime,
                y: datum.diskSpaceFree
            });
            memo[1].data.push({
                x: datum.sampleTime,
                y: datum.diskSpaceUsed
            });
            return memo;
        }, series);

        var graph = new Rickshaw.Graph({
            element: this.$('.diskSpaceChart' + disk.get('name')).get(0),
            width: 100,
            height: 100,
            series: series
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
