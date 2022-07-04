function DashboredSiteDashMonitor(widgetId) {
    if (DashboredSiteDashMonitor.instance_) {
        return DashboredSiteDashMonitor.instance_;
    }
    DashboredSiteDashMonitor.instance_ = this;

    this.window = {};
    this.widgetEl = document.querySelector('#dashboard-block-' + widgetId);
    this.containerEl = this.widgetEl.querySelector('#dashbored' + widgetId + '-sitedash-monitor');
    
    this.panel = this.containerEl.querySelector('.dashbored-sitedash-monitor-panel');
    this.messagePanel = this.widgetEl.querySelector('.dashbored-msg');
    
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

        Dashbored.hideMessage(this.messagePanel);
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
        if (typeof data.missing_key !== 'undefined') {
            Dashbored.showMessage(this.messagePanel, _('dashbored.sitedash.nokey_msg'));
        }
        else if (typeof data.account_valid === 'undefined') {
            Dashbored.showMessage(this.messagePanel, _('dashbored.no_data_msg', {type: 'SiteDash'}));
        }
        else if (data.account_valid !== '1') {
            Dashbored.showMessage(this.messagePanel, _('dashbored.sitedash.invalid_account_msg'));
        }
        else {
            this.renderAPIData(data);
        }
       
        Dashbored.renderBackground(this, data);
        this.disableSpinner();
    },

    renderAPIData: function(data) {
        this.containerEl.querySelectorAll('.dashbored-error-msg').forEach((msg) => {
            msg.remove();
        });
        this.containerEl.querySelector('.dashbored-sitedash-monitor-updated').textContent 
            = _('dashbored.sitedash_monitor.updated_at', {at: Dashbored.renderTimestamp(data.extended.updated_at)});
        
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
        this.widgetEl.querySelector('.dashbored-loading-mask').style.visibility = 'hidden';
    },

    enableSpinner: function() {
        this.widgetEl.querySelector('.dashbored-loading-mask').style.visibility = 'visible';
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
    renderAboutTabContent: function() {
        return `
        <div class="sitedash-about-content">
            <h2>SiteDash</h2>
            <p>SiteDash checks all of your sites 4 times a day for security issues, out-of-date extras, error logs growing out of control, crashed tables, and more.</p> 
            <p>SiteDash notifies you about what you really need to know immediately, gives you powerful remote management features, and presents it all in a user (and mobile) friendly dashboard.</p>
            <a href="https://sitedash.app/" target="_blank" rel="noopener">https://sitedash.app</a>
        </div>
        `;
    }
});
Ext.reg('dashboredsitedashmonitor-settings', DashboredSiteDashMonitor.Settings);
