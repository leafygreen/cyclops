'use strict';

const $ = require('jquery');
const Marionette = require('backbone.marionette');

const AgentLogsOverlay = require('./AgentLogsOverlay');

module.exports = Marionette.ItemView.extend({
    className: 'tileset-item',
    template: require('./agentData.hbs'),

    events: {
        'click button[name="view-logs"]': 'onClickViewLogs'
    },

    serializeData: function() {
        return this.model.attributes;
    },

    onClickViewLogs: function() {
        const overlay = new AgentLogsOverlay({
            model: this.model
        });
        $('body').append(overlay.render().el);
    }
});
