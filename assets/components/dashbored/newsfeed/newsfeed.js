function DashboredNewsFeed(widgetId) {
    if (DashboredNewsFeed.instance_) {
        return DashboredNewsFeed.instance_;
    }
    DashboredNewsFeed.instance_ = this;

    this.window = {};
    this.widgetEl = document.querySelector('#dashboard-block-' + widgetId);
    this.containerEl = this.widgetEl.querySelector('#dashbored' + widgetId + '-newsfeed');

    this.record = {
        id: this.containerEl.dataset.id
    };
    
    document.querySelector('.dashbored-title-btn.config.news_feed').addEventListener('click', (e) => {
        this.openSettings(this.record);
    });
    document.querySelector('.dashbored-title-btn.refresh.news_feed').addEventListener('click', (e) => {
        this.refresh(true);
    });
}
window['DashboredNewsFeed'] = DashboredNewsFeed;

DashboredNewsFeed.config = {};

DashboredNewsFeed.prototype = {
    openSettings: function(record) {
        let that = this;
        if (this.dashboredNewsFeedSettingsWindow) {
            this.dashboredNewsFeedSettingsWindow.destroy();
        }
        this.dashboredNewsFeedSettingsWindow = MODx.load({
            xtype: 'dashborednewsfeed-settings'
            ,record: record
            ,listeners: {
                'success': {fn: function(r) {
                        this.record = r.results;
                        that.refresh(true);
                    },scope:this},
                'failure': {fn: function(r) {
                        console.error('[Dashbored] Unable to save news feed settings. ' + r.msg);
                    }, scope: this
                }
            }
        });
        this.dashboredNewsFeedSettingsWindow.setValues(record);
        this.dashboredNewsFeedSettingsWindow.show();
    },

    loadData: function(ignoreCache = false) {
        let that = this;

        this.enableSpinner();

        MODx.Ajax.request({
            url: Dashbored.config.connectorUrl
            ,params: {
                id: that.containerEl.dataset.id,
                action: 'mgr/newsfeed/refresh',
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
                        console.error('Unable to retrieve news feed data from the server.');
                    }
                    ,scope: this
                }
            }
        });
    },

    render: function(data) {
        for (const article in data) {
            // Skip non-articles
            if (typeof data[article].title === 'undefined') {
                continue;
            }
            
            // Create elements
            let item = document.createElement('div'),
                title = document.createElement('h2'),
                authorRow = document.createElement('div'),
                author = document.createElement('div'),
                date = document.createElement('div'),
                link = document.createElement('a'),
                description = document.createElement('div'),
                content = document.createElement('div');
            
            // Add content to elements
            title.textContent = data[article].title;
            link.href = data[article].url;
            author.textContent = data[article].author;
            date.textContent = data[article].date;
            description.innerHTML = data[article].description;
            content.innerHTML = data[article].content;

            // Add classes
            item.classList.add('dashbored-news-feed-item');
            title.classList.add('dashbored-news-feed-title');
            authorRow.classList.add('dashbored-news-feed-author-row');
            author.classList.add('dashbored-news-feed-author');
            date.classList.add('dashbored-news-feed-date');
            link.classList.add('dashbored-news-feed-link');
            description.classList.add('dashbored-news-feed-description');
            content.classList.add('dashbored-news-feed-content');
            
            // Add to DOM
            title.appendChild(link);
            item.appendChild(title);

            authorRow.appendChild(date);
            authorRow.appendChild(author);
            item.appendChild(authorRow);
            
            item.appendChild(description);
            item.appendChild(content);
            
            this.containerEl.appendChild(item);
        }
        
        this.disableSpinner();
    },

    disableSpinner: function() {
        document.querySelector('.dashbored-newsfeed-mask').style.visibility = 'hidden';
    },

    enableSpinner: function() {
        document.querySelector('.dashbored-newsfeed-mask').style.visibility = 'visible';
    },

    refresh: function() {
        this.loadData(true);
    },

    setup: function() {
        this.loadData();
    }
}

DashboredNewsFeed.Settings = function(config) {
    this.widgetType = 'newsfeed';
    Ext.applyIf(config,{
        title: 'Dashbored News Feed Configuration',
        baseParams: {
            action: 'mgr/newsfeed/save'
        },
    });
    DashboredNewsFeed.Settings.superclass.constructor.call(this, config);
};
Ext.extend(DashboredNewsFeed.Settings, Dashbored.Settings, {
    getSettingsTab: function(win) {
        return {
            title: 'Settings',
            items: [{
                xtype: 'textfield',
                fieldLabel: 'News Feed URL',
                name: 'url',
                anchor: '100%'
            },{
                xtype: 'label',
                cls: 'desc-under',
                html: 'Enter the URL of the RSS feed here.'
            }]
        };
    },
    getBackgroundTab: function(win) {
        return '';
    },
});
Ext.reg('dashborednewsfeed-settings', DashboredNewsFeed.Settings);
