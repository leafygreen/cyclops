'use strict';

const _ = require('underscore');

const Marionette = require('backbone.marionette');

module.exports = Marionette.ItemView.extend({
    className: 'overlay',
    template: require('./agentLogsOverlay.hbs'),

    events: {
        'click button[name="close"]': 'closeOverlay'
    },

    initialize: function() {
        this.setPoller();
    },

    setPoller: function() {
        this.pollerId = setTimeout(() => {
            console.log('attempting re-render');
            this.render();
            this.setPoller();
        }, 5000);
    },

    onDestroy: function() {
        clearTimeout(this.pollerId);
    },

    closeOverlay: function() {
        this.destroy();
    },

    serializeData: function() {
        return _.extend({}, this.model.attributes, {
            logs: this.model.attributes.logs.map(log => JSON.stringify(log))
        });
    }
});
