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
                        console.error('Unable to retrieve SiteDash Monitor data from the server.');
                    }
                    ,scope: this
                }
            }
        });
    },

    render: function(data) {
        
        this.renderLineChart(data);
        
        // Render background
        let bg = this.widgetEl.querySelector('.dashbored-bg'),
            currentBg = bg.querySelector('.db-bg-element');
        if (currentBg) {
            bg.removeChild(currentBg);
        }

        // Image
        if (data.background_type === 'image' && data.bg_image) {
            let newImg = document.createElement('img');
            newImg.classList.add('db-bg-element');
            newImg.src = Ext.util.Format.htmlEncode(data.bg_image);
            bg.appendChild(newImg);
        }

        // Video
        if (data.background_type === 'video' && data.bg_video) {
            let newVideo = document.createElement('video');
            newVideo.classList.add('db-bg-element');
            newVideo.src = data.bg_video;
            newVideo.setAttribute('autoplay', 'true');
            newVideo.setAttribute('muted', 'true');
            newVideo.setAttribute('loop', 'true');
            bg.appendChild(newVideo);
        }

        // Render mask
        if (data.bg_mask) {
            let mask = bg.querySelector('.db-bg-mask');
            mask.style.backgroundColor = Dashbored.getBackgroundStyle(data.bg_mask);

            // Don't darken if no background
            if (data.background_type === 'none') {
                mask.style.backgroundColor = 'rgba(0,0,0,0)';
            }
        }

        this.disableSpinner();
    },
    
    renderLineChart: function(data) {
        
        // Dummy data
        data = {
            dates: [
                '2022-06-18',
                '2022-06-19',
                '2022-06-20',
                '2022-06-21',
                '2022-06-22',
                '2022-06-23',
                '2022-06-24',
            ],
            uptime: [
                100.0,
                98.0,
                70.0,
                100.0,
                95.0,
                100.0,
                100.0
            ],
            response_time: [
                788,
                1000,
                950,
                600,
                800,
                1200,
                700
            ],
            cpu: [
                5.0,
                7.0,
                0.5,
                1.1,
                3.0,
                6.6,
                22.0
            ],
            memory: [
                66.0,
                80.0,
                77.5,
                90.1,
                95.0,
                50.6,
                55.0
            ]
        };
        
        
        let dates = data.dates,
            uptime = data.uptime,
            responseTime = data.response_time,
            cpu = data.cpu,
            memory = data.memory;

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
