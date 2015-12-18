'use strict';

const HOSTNAME_PORT = 'ec2-54-211-143-56.compute-1.amazonaws.com:9090';

const Backbone = require('backbone');
const Marionette = require('backbone.marionette');
Marionette.Renderer = {
    render: function(template, data, view) {
        return template(data, {
            helpers: {
                asGigabytes: (bytes) => {
                    return (bytes / (1024 * 1024 * 1024)).toFixed(4) + ' GB';
                }
            }
        });
    }
};

const AppLayout = require('./AppLayout');
const AgentDataCollectionView = require('./AgentDataCollectionView');
const ClopsStream = require('./ClopsStream');

// Initialize MITM Stream
const stream = new ClopsStream({ url: 'ws:// ' + HOSTNAME_PORT + ' /ws' });
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
