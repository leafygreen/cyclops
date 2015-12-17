'use strict';

const $ = require('jquery');
const _ = require('underscore');
const Marionette = require('backbone.marionette');

const AgentLogsOverlay = require('./AgentLogsOverlay');

module.exports = Marionette.ItemView.extend({
    className: 'tileset-item',
    template: require('./agentData.hbs'),

    events: {
        'click button[name="view-logs"]': 'onClickViewLogs'
    },

    serializeData: function() {
        return _.extend({}, this.model.attributes, {
            processDataCollection: this.model.attributes.processDataCollection.toJSON()
        });
    },

    onClickViewLogs: function() {
        const overlay = new AgentLogsOverlay({
            model: this.model
        });
        $('body').append(overlay.render().el);
    }
});
