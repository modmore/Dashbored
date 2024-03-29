function DashboredQuotes(widgetId) {
    if (DashboredQuotes.instance_) {
        return DashboredQuotes.instance_;
    }
    DashboredQuotes.instance_ = this;

    this.window = {};
    this.widgetEl = document.querySelector('#dashboard-block-' + widgetId);
    this.containerEl = this.widgetEl.querySelector('#dashbored' + widgetId + '-quotes');
    this.quote = this.containerEl.querySelector('.quote');

    this.record = {
        id: this.containerEl.dataset.id
    };
    
    document.querySelector('.dashbored-title-btn.config.quotes').addEventListener('click', (e) => {
        this.openSettings(this.record);
    });
    document.querySelector('.dashbored-title-btn.refresh.quotes').addEventListener('click', (e) => {
        this.refresh(true);
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
            ,record: record
            ,listeners: {
                'success': {fn: function(r) {
                        this.record = r.results;
                        that.refresh(true);
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

    loadData: function(ignoreCache = false) {
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
                        this.record = r.results;
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
        this.renderAPIData(data);

        Dashbored.renderBackground(this, data);
        
        this.disableSpinner();
    },
    
    renderAPIData: function(data) {
        this.quote.innerHTML = '“' + data[0].q  + '”';

        let author = document.createElement('footer');
        author.classList.add('author');
        author.textContent = data[0].a;
        this.quote.appendChild(author);
    },

    disableSpinner: function() {
        document.querySelector('.dashbored-quotes-mask').style.visibility = 'hidden';
    },

    enableSpinner: function() {
        document.querySelector('.dashbored-quotes-mask').style.visibility = 'visible';
    },

    refresh: function() {
        this.loadData(true);
    },

    setup: function() {
        this.loadData();
    }
}

DashboredQuotes.Settings = function(config) {
    this.widgetType = 'quotes';
    Ext.applyIf(config,{
        title: 'Dashbored Daily Quotes Configuration',
        baseParams: {
            action: 'mgr/quotes/save'
        },
    });
    DashboredQuotes.Settings.superclass.constructor.call(this, config);
};
Ext.extend(DashboredQuotes.Settings, Dashbored.Settings, {
    getSettingsTab: function(win) {
        return '';
    },
    renderAboutTabContent: function() {
        return `
        <h2>ZenQuotes.io</h2>
        <p>From the website:</p>
        <p><em>Zenquotes.io is a simple API that can be used to fetch quotes from infuential figures throughout history into JSON format. While it's not hard to find a database of inspirational quotes online, most of them require registration or just plain suck.</em></p> 
        <a href="https://zenquotes.io/" target="_blank" rel="noopener">https://zenquotes.io</a>
        `;
    }
});
Ext.reg('dashboredquotes-settings', DashboredQuotes.Settings);
