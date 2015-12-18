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
            this.render();
            this.setPoller();
        }, 2000);
    },

    onDestroy: function() {
        clearTimeout(this.pollerId);
    },

    onRender: function() {
        this.$el.animate({
            scrollTop: this.$el.height()
        });
    },

    closeOverlay: function() {
        this.destroy();
    },

    serializeData: function() {
        return _.extend({}, this.model.attributes, {
            logs: this.model.attributes.logs.map(log => {
                return _.extend({}, log, {
                    timestamp: new Date(log.timestamp).toISOString()
                });
            })
        });
    }
});
