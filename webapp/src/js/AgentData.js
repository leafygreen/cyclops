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
        sampleTime: null,
        cpuTimeKernel: 0,
        cpuTimeUser: 0,
        cpuTimeIdle: 0,
        cpuTimeNice: 0,
        cpuTimeIoWait: 0,
        cpuTimeIrq: 0,
        cpuTimeSoftIrq: 0,
        cpuTimeSoftSteal: 0,
        cpuUtilization: null
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
        const systemCpuMetrics = _.defaults(content.systemCpuMetrics, {
            iowait: 0,
            irq: 0,
            softirq: 0,
            steal: 0
        });
        const processCpuMetrics = content.processCpuMetrics;
        const diskMetrics = content.diskMetrics;

        const prevIdle = this.get('cpuTimeIdle') + this.get('cpuTimeIoWait');
        const idle = systemCpuMetrics.idle + systemCpuMetrics.iowait;

        const prevNonIdle = this.get('cpuTimeUser') + this.get('cpuTimeKernel') + this.get('cpuTimeNice') + this.get('cpuTimeIrq') + this.get('cpuTimeSoftIrq') + this.get('cpuTimeSteal');
        const nonIdle = systemCpuMetrics.user + systemCpuMetrics.kernel + systemCpuMetrics.nice + systemCpuMetrics.irq + systemCpuMetrics.softirq + systemCpuMetrics.steal;

        const prevTotal = prevIdle + prevNonIdle;
        const total = idle + nonIdle;

        // differentiate: actual value minus the previous one
        const totald = total - prevTotal;
        const idled = idle - prevIdle;

        const cpuPercentage = (totald - idled) / totald;

        this.set('platform', platform);
        this.get('cpuMetrics').push(systemCpuMetrics);
        this.set({
            sampleTime: new Date(systemCpuMetrics.sampleTime).toISOString(),
            cpuTimeKernel: systemCpuMetrics.kernel,
            cpuTimeUser: systemCpuMetrics.user,
            cpuTimeIdle: systemCpuMetrics.idle,
            cpuTimeNice: systemCpuMetrics.nice,
            cpuTimeIoWait: systemCpuMetrics.iowait,
            cpuTimeIrq: systemCpuMetrics.irq,
            cpuTimeSoftIrq: systemCpuMetrics.softirq,
            cpuTimeSteal: systemCpuMetrics.steal,
            cpuUtilization: cpuPercentage
        });

        Object.keys(processCpuMetrics).forEach(name => {
            const processData = this._findOrCreateProcessData(name);
            processData.handleCpuMetrics(processCpuMetrics[name]);
        });

        Object.keys(diskMetrics).forEach(name => {
            const diskData = this._findOrCreateDiskData(name);
            diskData.handleDiskMetrics(diskMetrics[name]);
        });
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
