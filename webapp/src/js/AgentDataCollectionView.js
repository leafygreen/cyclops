'use strict';

const Marionette = require('backbone.marionette');

const AgentDataView = require('./AgentDataView');

module.exports = Marionette.CollectionView.extend({
    className: 'tileset',
    childView: AgentDataView,

    initialize: function() {
        this.setPoller();
    },

    setPoller: function() {
        this.pollerId = setTimeout(() => {
            this.render();
            this.setPoller();
        }, 1000);
    }
});
