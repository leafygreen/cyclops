'use strict';

const _ = require('underscore');
const Backbone = require('backbone');

const ProcessData = require('./ProcessData');
const ProcessDataCollection = Backbone.Collection.extend({
    model: ProcessData,
    comparator: 'name'
});
const DiskData = require('./DiskData');
const DiskDataCollection = Backbone.Collection.extend({
    model: DiskData,
    comparator: 'name'
});

module.exports = Backbone.Model.extend({
    defaults: {
        hostname: null,
        lastPing: null,
        logs: [],
        processMap: {},
        processDataCollection: new ProcessDataCollection(),
        diskMap: {},
        diskDataCollection: new DiskDataCollection(),
        platform: {},
        cpuMetrics: [],
        cpuUtilization: null,
        kernelUtilization: null,
        userUtilization: null,
        idleUtilization: null,
        diskUtilization: null
    },

    handleMessage: function(type, content) {
        this.set('lastPing', new Date().toISOString());
        switch (type) {
            case 'status': this.handleStatusMessage(content); break;
            case 'log': this.handleLogMessage(content); break;
            case 'metrics': this.handleMetricsMessage(content); break;
        }
    },

    handleStatusMessage: function(content) {
        content.forEach(status => {
            const processData = this._findOrCreateProcessData(status.name);
            processData.handleStatus(status);
        });
    },

    handleLogMessage: function(content) {
        this.set('logs', this.get('logs').concat(content));
    },

    handleMetricsMessage: function(content) {
        const platform = content.platform;
        const processCpuMetrics = content.processCpuMetrics;
        const diskMetrics = content.diskMetrics;

        // acount for missing values on OS X
        const systemCpuMetrics = _.defaults(content.systemCpuMetrics, {
            iowait: 0,
            irq: 0,
            softirq: 0,
            steal: 0
        });

        Object.keys(processCpuMetrics).forEach(name => {
            const processData = this._findOrCreateProcessData(name);
            processData.handleCpuMetrics(processCpuMetrics[name]);
        });

        Object.keys(diskMetrics).forEach(name => {
            const diskData = this._findOrCreateDiskData(name);
            diskData.handleDiskMetrics(diskMetrics[name]);
        });

        this.set('platform', platform);
        this.get('cpuMetrics').push(systemCpuMetrics);
        this._updateCPUUtilization();
        this.set({
            cpuUtilization: systemCpuMetrics.cpuUtilization,
            kernelUtilization: systemCpuMetrics.kernelUtilization,
            userUtilization: systemCpuMetrics.userUtilization,
            idleUtilization: systemCpuMetrics.idleUtilization,
            diskUtilization: this._calculateDiskUtilization()
        });
    },

    // http://stackoverflow.com/questions/23367857/accurate-calculation-of-cpu-usage-given-in-percentage-in-linux
    _updateCPUUtilization: function() {
        const cpuMetrics = this.get('cpuMetrics');
        if (cpuMetrics.length < 2) {
            return null;
        }

        const current = cpuMetrics[cpuMetrics.length - 1];
        const prev = cpuMetrics[cpuMetrics.length - 2];

        const prevIdle = prev.idle + prev.iowait;
        const idle = current.idle + current.iowait;

        const prevKernel = prev.kernel;
        const kernel = current.kernel;

        const prevUser = prev.user;
        const user = current.user;

        const prevNonIdle = prevUser + prevKernel + prev.nice + prev.irq + prev.softirq + prev.steal;
        const nonIdle = user + kernel + current.nice + current.irq + current.softirq + current.steal;

        const prevTotal = prevIdle + prevNonIdle;
        const total = idle + nonIdle;

        // differentiate: actual value minus the previous one
        const totald = total - prevTotal;
        const idled = idle - prevIdle;
        const kerneld = kernel - prevKernel;
        const userd = user - prevUser;

        // update current record
        current.kernelUtilization = ((kerneld / totald) * 100.0);
        current.userUtilization = ((userd / totald) * 100.0);
        current.idleUtilization = ((idled / totald) * 100.0);
        current.cpuUtilization = (((totald - idled) / totald) * 100.0).toFixed(2);
    },

    _calculateDiskUtilization: function() {
        let diskSpaceFree = 0;
        let diskSpaceUsed = 0;
        this.get('diskDataCollection').each(disk => {
            diskSpaceFree += disk.get('diskSpaceFree');
            diskSpaceUsed += disk.get('diskSpaceUsed');
        });

        if (diskSpaceUsed > 0) {
            return (diskSpaceUsed / (diskSpaceUsed + diskSpaceFree) * 100.0).toFixed(2);
        }
    },

    _findOrCreateProcessData: function(name) {
        const processMap = this.get('processMap');
        let processData = processMap[name];
        if (!processData) {
            processData = new ProcessData({ name });
            processMap[name] = processData;
            this.get('processDataCollection').add(processData);
        }

        return processData;
    },

    _findOrCreateDiskData: function(name) {
        const diskMap = this.get('diskMap');
        let diskData = diskMap[name];
        if (!diskData) {
            diskData = new DiskData({ name });
            diskMap[name] = diskData;
            this.get('diskDataCollection').add(diskData);
        }

        return diskData;
    }
});
