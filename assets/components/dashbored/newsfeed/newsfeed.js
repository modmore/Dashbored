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
                        this.record = r.a.result.message;
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
        this.containerEl.innerHTML = '';
        
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
            link.textContent = data[article].title;
            link.href = data[article].url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer'
            author.textContent = data[article].author;
            date.textContent = data[article].date;
            description.innerHTML = data[article].description;
            content.innerHTML = data[article].content;

            // Add classes
            item.classList.add('dashbored-newsfeed-item');
            title.classList.add('dashbored-newsfeed-title');
            authorRow.classList.add('dashbored-newsfeed-author-row');
            author.classList.add('dashbored-newsfeed-author');
            date.classList.add('dashbored-newsfeed-date');
            link.classList.add('dashbored-newsfeed-link');
            description.classList.add('dashbored-newsfeed-description');
            content.classList.add('dashbored-newsfeed-content');
            
            // Add to DOM
            title.appendChild(link);
            item.appendChild(title);

            authorRow.appendChild(date);
            authorRow.appendChild(author);
            item.appendChild(authorRow);
            
            //item.appendChild(description);
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
                name: 'feed_url',
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
    renderAboutTabContent: function() {
        return `
        <h2>News Feed</h2>
        <h4 class="sub-heading">by MODX.today</h4>
        <p>MODX.today is an online magazine dedicated to the MODX Content Management Platform. With daily-ish news, fresh insights and reviews about all things MODX.</p>
        <p>We share MODX related content from around the web with you, and provide weekly-ish newsletters to keep you updated with minimum effort.</p> 
        <a href="https://modx.today/" target="_blank" rel="noopener">https://modx.today</a>
        `;
    }
});
Ext.reg('dashborednewsfeed-settings', DashboredNewsFeed.Settings);
