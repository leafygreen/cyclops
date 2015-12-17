'use strict';

const Marionette = require('backbone.marionette');
const Rickshaw = require('rickshaw');

module.exports = Marionette.LayoutView.extend({
    template: require('./appLayout.hbs'),

    regions: {
        content: '.appLayout-content'
    },

    showContent: function(view) {
        this.content.show(view);
    }
});
