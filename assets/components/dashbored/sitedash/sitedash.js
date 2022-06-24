function DashboredSiteDash(widgetId) {
    if (DashboredSiteDash.instance_) {
        return DashboredSiteDash.instance_;
    }
    DashboredSiteDash.instance_ = this;

    this.window = {};
    this.widgetEl = document.querySelector('#dashboard-block-' + widgetId);
    this.containerEl = this.widgetEl.querySelector('#dashbored' + widgetId + '-sitedash');
    
    this.panel = this.containerEl.querySelector('.dashbored-sitedash-panel');
    this.topPanel = this.panel.querySelector('.dashbored-sitedash-top');
    this.middlePanel = this.panel.querySelector('.dashbored-sitedash-middle');
    this.bottomPanel = this.panel.querySelector('.dashbored-sitedash-bottom');
    
    this.footer = document.querySelector('.dashbored-sitedash-footer');
    this.sitedashBtn = this.footer.querySelector('.open-sitedash-btn');
    
    this.record = {
        id: this.containerEl.dataset.id
    };

    document.querySelector('.dashbored-title-btn.config.sitedash').addEventListener('click', (e) => {
        this.openSettings(this.record);
    });
    document.querySelector('.dashbored-title-btn.refresh.sitedash').addEventListener('click', (e) => {
        this.refresh(true);
    });
    this.sitedashBtn.addEventListener('click', (e) => {
        window.open('https://sitedash.app');
    });
}
window['DashboredSiteDash'] = DashboredSiteDash;

DashboredSiteDash.config = {};

DashboredSiteDash.prototype = {
    openSettings: function(record) {
        let that = this;
        if (this.dashboredSiteDashSettingsWindow) {
            this.dashboredSiteDashSettingsWindow.destroy();
        }
        this.dashboredSiteDashSettingsWindow = MODx.load({
            xtype: 'dashboredsitedash-settings'
            ,record: record
            ,listeners: {
                'success': {fn: function(r) {
                        this.record = r.results;
                        that.refresh(true);
                    },scope:this},
                'failure': {fn: function(r) {
                        console.error('[Dashbored] Unable to save SiteDash settings. ' + r.msg);
                    }, scope: this
                }
            }
        });
        this.dashboredSiteDashSettingsWindow.setValues(record);
        this.dashboredSiteDashSettingsWindow.show();
    },

    loadData: function(ignoreCache = false) {
        let that = this;

        this.enableSpinner();

        MODx.Ajax.request({
            url: Dashbored.config.connectorUrl
            ,params: {
                id: that.containerEl.dataset.id,
                action: 'mgr/sitedash/refresh',
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
                        console.error('Unable to retrieve SiteDash data from the server.');
                    }
                    ,scope: this
                }
            }
        });
    },

    render: function(data) {
        

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

    disableSpinner: function() {
        document.querySelector('.dashbored-sitedash-mask').style.visibility = 'hidden';
    },

    enableSpinner: function() {
        document.querySelector('.dashbored-sitedash-mask').style.visibility = 'visible';
    },

    refresh: function() {
        this.loadData(true);
    },

    setup: function() {
        this.loadData();
    }
}

DashboredSiteDash.Settings = function(config) {
    this.widgetType = 'sitedash';
    Ext.applyIf(config,{
        title: 'Dashbored SiteDash Configuration',
        baseParams: {
            action: 'mgr/sitedash/save'
        },
    });
    DashboredSiteDash.Settings.superclass.constructor.call(this, config);
};
Ext.extend(DashboredSiteDash.Settings, Dashbored.Settings, {
    getSettingsTab: function(win) {
        return '';
    },
});
Ext.reg('dashboredsitedash-settings', DashboredSiteDash.Settings);
