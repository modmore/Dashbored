function DashboredSiteDashMonitor(widgetId) {
    if (DashboredSiteDashMonitor.instance_) {
        return DashboredSiteDashMonitor.instance_;
    }
    DashboredSiteDashMonitor.instance_ = this;

    this.window = {};
    this.widgetEl = document.querySelector('#dashboard-block-' + widgetId);
    this.containerEl = this.widgetEl.querySelector('#dashbored' + widgetId + '-sitedash-monitor');
    
    this.panel = this.containerEl.querySelector('.dashbored-sitedash-monitor-panel');
    
    this.record = {
        id: this.containerEl.dataset.id
    };

    document.querySelector('.dashbored-title-btn.config.sitedash_monitor').addEventListener('click', (e) => {
        this.openSettings(this.record);
    });
    document.querySelector('.dashbored-title-btn.refresh.sitedash_monitor').addEventListener('click', (e) => {
        this.refresh(true);
    });
}
window['DashboredSiteDashMonitor'] = DashboredSiteDashMonitor;

DashboredSiteDashMonitor.config = {};

DashboredSiteDashMonitor.prototype = {
    openSettings: function(record) {
        let that = this;
        if (this.dashboredSiteDashMonitorSettingsWindow) {
            this.dashboredSiteDashMonitorSettingsWindow.destroy();
        }
        this.dashboredSiteDashMonitorSettingsWindow = MODx.load({
            xtype: 'dashboredsitedashmonitor-settings'
            ,record: record
            ,listeners: {
                'success': {fn: function(r) {
                        this.record = r.results;
                        that.refresh(true);
                    },scope:this},
                'failure': {fn: function(r) {
                        console.error('[Dashbored] Unable to save SiteDash Monitor settings. ' + r.msg);
                    }, scope: this
                }
            }
        });
        this.dashboredSiteDashMonitorSettingsWindow.setValues(record);
        this.dashboredSiteDashMonitorSettingsWindow.show();
    },

    loadData: function(ignoreCache = false) {
        let that = this;

        this.enableSpinner();

        MODx.Ajax.request({
            url: Dashbored.config.connectorUrl
            ,params: {
                id: that.containerEl.dataset.id,
                action: 'mgr/sitedash-monitor/refresh',
                refresh: ignoreCache ? 1 : ''
            }
            ,listeners: {
                success: {
                    fn: function(r) {
                        this.record = r.results;
                        that.render(r.results);
                    }
                    ,scope: this
                }
                ,failure: {
                    fn: function(r) {
                        console.error('[Dashbored] Unable to retrieve SiteDash Monitor data from the server.');
                    }
                    ,scope: this
                }
            }
        });
    },

    render: function(data) {
        this.renderAPIData(data);
        Dashbored.renderBackground(this, data);
        this.disableSpinner();
    },

    renderAPIData: function(data) {
        let dates = data.extended.dates,
            uptime = data.extended.uptime,
            responseTime = data.extended.response_time,
            cpu = data.extended.cpu,
            memory = data.extended.memory;

        const ctx = document.getElementById('dashbored-sitedash-uptime').getContext('2d');
        if (this.lineChart) {
            this.lineChart.destroy();
        }
        this.lineChart = new Chart(ctx, {
            data: {
                labels: dates,
                datasets: [{
                    label: ['Uptime %'],
                    type: 'line',
                    data: uptime,
                    borderColor: 'rgba(0, 222, 204, 1)',
                    backgroundColor: 'rgba(0, 222, 204, 0.2)',
                    yAxisID: 'percentage'
                },{
                    label: ['CPU %'],
                    type: 'line',
                    data: cpu,
                    borderColor: 'rgba(255, 150, 64, 1)',
                    backgroundColor: 'rgba(255, 150, 64, 0.2)',
                    yAxisID: 'percentage'
                },{
                    label: ['Memory %'],
                    type: 'line',
                    data: memory,
                    borderColor: 'rgba(255, 85, 41, 1)',
                    backgroundColor: 'rgba( 255, 85, 41, 0.2)',
                    yAxisID: 'percentage'
                },{
                    label: ['Response Time'],
                    type: 'line',
                    data: responseTime,
                    borderColor: 'rgba(0, 181, 222, 1)',
                    backgroundColor: 'rgba(0, 181, 222, 0.2)',
                    yAxisID: 'responseTime'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'x',
                plugins: {
                    legend: {
                        position: 'bottom',
                        padding: 10,
                        labels: {
                            color: '#fff',
                            font: {
                                size: 10   
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        position: 'top',
                        ticks: {
                            color: '#fff',
                            font: {
                                size: 9
                            },
                            padding: 10
                        }
                    },
                    percentage: {
                        type: 'linear',
                        position: 'left',
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                            color: '#fff',
                            font: {
                                size: 9
                            }
                        },
                        title: {
                            display: true,
                            text: 'Percentage',
                            color: '#fff',
                            font: {
                                size: 11,
                            },
                            padding: {top: 0, left: 0, right: 0, bottom: 0}
                        }
                    },
                    responseTime: {
                        type: 'linear',
                        position: 'right',
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            precision: 0,
                            color: '#fff',
                            font: {
                                size: 9
                            }
                        },
                        title: {
                            display: true,
                            text: 'Microseconds',
                            color: '#fff',
                            font: {
                                size: 11,
                            },
                            padding: {top: 0, left: 0, right: 0, bottom: 0}
                        }
                    },
                },
            }
        });

    },

    disableSpinner: function() {
        document.querySelector('.dashbored-sitedash-monitor-mask').style.visibility = 'hidden';
    },

    enableSpinner: function() {
        document.querySelector('.dashbored-sitedash-monitor-mask').style.visibility = 'visible';
    },

    refresh: function() {
        this.loadData(true);
    },

    setup: function() {
        this.loadData();
    }
}

DashboredSiteDashMonitor.Settings = function(config) {
    this.widgetType = 'sitedash';
    Ext.applyIf(config,{
        title: 'Dashbored SiteDash Monitor Configuration',
        baseParams: {
            action: 'mgr/sitedash-monitor/save'
        },
    });
    DashboredSiteDashMonitor.Settings.superclass.constructor.call(this, config);
};
Ext.extend(DashboredSiteDashMonitor.Settings, Dashbored.Settings, {
    getSettingsTab: function(win) {
        return '';
    },
});
Ext.reg('dashboredsitedashmonitor-settings', DashboredSiteDashMonitor.Settings);