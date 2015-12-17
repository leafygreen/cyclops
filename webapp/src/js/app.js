'use strict';

const Backbone = require('backbone');
const Marionette = require('backbone.marionette');
Marionette.Renderer = {
    render: function(template, data, view) {
        return template(data);
    }
};

const AppLayout = require('./AppLayout');
const AgentDataCollectionView = require('./AgentDataCollectionView');
const ClopsStream = require('./ClopsStream');

// Initialize MITM Stream
const stream = new ClopsStream({ url: 'ws://localhost:12345' });
stream.createConnection();

// Setup Routers
const Router = Backbone.Router.extend({
    routes: {
        '*default': 'showAgentDataTable'
    },

    initialize: function() {
        this.region = new Marionette.Region({ el: '#content' });
    },

    showAgentDataTable: function() {
        const appLayout = new AppLayout();
        this.region.show(appLayout);
        appLayout.showContent(new AgentDataCollectionView({
            collection: stream.getAgentDataCollection()
        }));
    }
});

(new Router());

stream.whenHasInitialData().then(() => {
    Backbone.history.start();
});
