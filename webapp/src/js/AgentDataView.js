'use strict';

const Marionette = require('backbone.marionette');

module.exports = Marionette.ItemView.extend({
    className: 'tileset-item',
    template: require('./agentData.hbs'),

    serializeData: function() {
        return this.model.attributes;
    }
});
