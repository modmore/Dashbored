function DashboredQuotes(containerId) {
    if (DashboredQuotes.instance_) {
        return DashboredQuotes.instance_;
    }
    DashboredQuotes.instance_ = this;

    this.window = {};
    this.containerEl = document.querySelector(containerId);
    this.quote = this.containerEl.querySelector('.quote');

    document.querySelector('.dashbored-title-btn.config.quotes').addEventListener('click', (e) => {
        let record = {
            id: this.containerEl.dataset.id
        };
        this.openSettings(record);
    });
    document.querySelector('.dashbored-title-btn.refresh.quotes').addEventListener('click', (e) => {
        this.refresh();
    });
}
window['DashboredQuotes'] = DashboredQuotes;

DashboredQuotes.config = {};

DashboredQuotes.prototype = {
    openSettings: function(record) {
        let that = this;
        if (this.dashboredQuotesSettingsWindow) {
            this.dashboredQuotesSettingsWindow.destroy();
        }
        this.dashboredQuotesSettingsWindow = MODx.load({
            xtype: 'dashboredquotes-settings'
            ,listeners: {
                'success': {fn: function(r) {
                        let props = r.a.result.object.properties;
                        that.refresh(props.location);
                    },scope:this},
                'failure': {fn: function(r) {
                        console.error('[Dashbored] Unable to save quotes settings. ' + r.msg);
                    }, scope: this
                }
            }
        });
        this.dashboredQuotesSettingsWindow.setValues(record);
        this.dashboredQuotesSettingsWindow.show();
    },

    loadData: function(location = '', ignoreCache = false) {
        let that = this;

        this.enableSpinner();

        MODx.Ajax.request({
            url: Dashbored.config.connectorUrl
            ,params: {
                id: that.containerEl.dataset.id,
                action: 'mgr/quotes/refresh',
                refresh: ignoreCache ? 1 : ''
            }
            ,listeners: {
                success: {
                    fn: function(r) {
                        that.render(r.results);
                    }
                    ,scope: this
                }
                ,failure: {
                    fn: function(r) {
                        console.error('Unable to retrieve quotes data from the server.');
                    }
                    ,scope: this
                }
            }
        });
    },

    render: function(data) {
        this.quote.innerHTML = '“' + data[0].q  + '”';
        
        let author = document.createElement('footer');
        author.classList.add('author');
        author.textContent = data[0].a;
        this.quote.appendChild(author);
        
        this.disableSpinner();
    },

    disableSpinner: function() {
        document.querySelector('.dashbored-quotes-mask').style.visibility = 'hidden';
    },

    enableSpinner: function() {
        document.querySelector('.dashbored-quotes-mask').style.visibility = 'visible';
    },

    refresh: function(location) {
        this.loadData(location, true);
    },

    setup: function() {
        this.loadData();
    }
}

DashboredQuotes.Settings = function(config) {
    config = config || {};
    Ext.applyIf(config,{
        title: 'Dashbored Daily Quotes Configuration',
        url: Dashbored.config.connectorUrl,
        baseParams: {
            action: 'mgr/quotes/save'
        },
        layout: 'form',
        autoHeight: true,
        allowDrop: false,
        fileUpload: true,
        width: 600,
        bwrapCssClass: 'x-window-with-tabs',
        fields: [{
            xtype: 'hidden',
            name: 'id'
        },{
            xtype: 'modx-tabs',
            defaults: {
                layout: 'form'
            },
            items: [{
                title: 'Settings',
                items: [{
                    xtype: 'textfield',
                    fieldLabel: 'A field',
                    name: 'field',
                    anchor: '100%',
                    allowBlank: false
                },{
                    xtype: 'label',
                    cls: 'desc-under',
                    html: 'This is a placeholder field for now.'
                }]
            },{
                title: 'Background',
                items: []
            },{
                title: 'API',
                items: []
            }]
        }]
    });
    DashboredQuotes.Settings.superclass.constructor.call(this, config);
};
Ext.extend(DashboredQuotes.Settings, MODx.Window);
Ext.reg('dashboredquotes-settings', DashboredQuotes.Settings);
