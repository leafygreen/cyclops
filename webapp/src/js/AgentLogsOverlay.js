'use strict';

const _ = require('underscore');

const Marionette = require('backbone.marionette');

module.exports = Marionette.ItemView.extend({
    className: 'overlay',
    template: require('./agentLogsOverlay.hbs'),

    events: {
        'click button[name="close"]': 'closeOverlay'
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
