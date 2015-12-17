'use strict';

const Marionette = require('backbone.marionette');

const AgentDataView = require('./AgentDataView');

module.exports = Marionette.CollectionView.extend({
    className: 'tileset',
    childView: AgentDataView
});
