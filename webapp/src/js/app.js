'use strict';

const Backbone = require('backbone');
const Marionette = require('backbone.marionette');

Marionette.Renderer = {
    render: function(template, data, view) {
        return template(data);
    }
};

const Rickshaw = require('rickshaw');

const AppLayout = Marionette.LayoutView.extend({
    el: '#content',

    template: require('./appLayout.hbs'),

    onRender: function() {
        var data = [
            { x: 1450302119291, y: 40 },
            { x: 1450302119391, y: 49 },
            { x: 1450302119491, y: 17 },
            { x: 1450302119591, y: 42 }
        ];

        var graph = new Rickshaw.Graph({
            element: this.$('#chart').get(0),
            width: 100,
            height: 100,
            series: [{
                color: 'steelblue',
                data: data
            }]
        });

        var legend = this.$('#legend').get(0);

        var Hover = Rickshaw.Class.create(Rickshaw.Graph.HoverDetail, {
            render: function(args) {
                legend.innerHTML = args.formattedXValue;
                args.detail.sort(function(a, b) {
                    return a.order - b.order;
                }).forEach(function(d) {
                    var line = document.createElement('div');
                    line.className = 'line';
                    var swatch = document.createElement('div');
                    swatch.className = 'swatch';
                    swatch.style.backgroundColor = d.series.color;
                    var label = document.createElement('div');
                    label.className = 'label';
                    label.innerHTML = d.name + ': ' + d.formattedYValue;
                    line.appendChild(swatch);
                    line.appendChild(label);
                    legend.appendChild(line);
                    var dot = document.createElement('div');
                    dot.className = 'dot';
                    dot.style.top = graph.y(d.value.y0 + d.value.y) + 'px';
                    dot.style.borderColor = d.series.color;
                    this.element.appendChild(dot);
                    dot.className = 'dot active';
                    this.show();
                }, this);
            }
        });

        graph.render();
        var hover = new Hover({ graph: graph });

        console.log('rendered', data);

        setTimeout(() => {
            data.push({ x: 1450302119691, y: 50 });
            graph.render();
            console.log('rerendered', data);
        }, 1000);
    }
});

const Router = Backbone.Router.extend({
    routes: {
        '*default': 'showAgentTable'
    },

    showAgentTable: function() {
        const appLayout = new AppLayout();
        appLayout.render();
    }
});

(new Router());

setTimeout(() => {
    Backbone.history.start();
}, 10);
