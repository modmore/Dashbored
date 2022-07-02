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
    this.auditPanel = this.topPanel.querySelector('.dashbored-sitedash-audit');
    
    this.middlePanel = this.panel.querySelector('.dashbored-sitedash-middle');
    this.firstCol = this.middlePanel.querySelector('.first-col');
    this.secondCol = this.middlePanel.querySelector('.second-col');
    this.thirdCol = this.middlePanel.querySelector('.third-col');
    
    this.updatedAt = '';
    
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
        if (typeof data.site_url !== 'undefined') {
            this.renderAPIData(data);
        }
        else {
            // Render error msg
            Dashbored.displayMessage(this.containerEl, _('dashbored.no_data_msg', {type: 'SiteDash'}));
        }
        
        Dashbored.renderBackground(this, data);
        this.disableSpinner();
    },
    
    renderAPIData: function(data) {
        this.auditPanel.innerHTML = null;
        this.containerEl.querySelectorAll('.dashbored-error-msg').forEach((msg) => {
            msg.remove();
        });
        this.containerEl.querySelector('.dashbored-sitedash-top .dashbored-sitedash-updated-at').textContent 
            = Dashbored.renderTimestamp(data.lighthouse.updated_at);
        for (const score in data.lighthouse.scores) {
            this.renderLighthouseScore(score, data.lighthouse.scores[score]);
        }
        
        this.renderColumns(data);
        
    },
    
    renderLighthouseScore: function(type, score) {
        const outerDiv = document.createElement('div'),
            metricDiv = document.createElement('div'),
            scoreDiv = document.createElement('div'),
            nameDiv = document.createElement('div'),
            span = document.createElement('span'),
            ns = 'http://www.w3.org/2000/svg',
            svg = document.createElementNS(ns,'svg'),
            svgPath = document.createElementNS(ns,'path');
        
        // Set classes, values and attributes
        outerDiv.classList.add('audit-' + type);
        metricDiv.classList.add('audit-metric');
        scoreDiv.classList.add('audit-score');
        
        nameDiv.classList.add('audit-metric-name');
        nameDiv.textContent = _('dashbored.sitedash.' + type);
        span.textContent = score;
        
        svg.classList.add('audit-metric-circle');
        svg.setAttribute('viewBox', '0 0 36 36');
        svgPath.setAttribute('d', `M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831`);
        svgPath.setAttribute('fill', 'none');
        svgPath.setAttribute('stroke', '#ffe168');
        svgPath.setAttribute('stroke-width', '3');
        svgPath.setAttribute('stroke-dasharray', score + ', 100');
        
        // Append
        svg.appendChild(svgPath);
        scoreDiv.appendChild(span);
        metricDiv.appendChild(scoreDiv);
        metricDiv.appendChild(svg);
        outerDiv.appendChild(metricDiv);
        outerDiv.appendChild(nameDiv);
        
        this.auditPanel.appendChild(outerDiv);
    },
    
    renderColumns: function(data) {
        this.updatedAt = Dashbored.renderTimestamp(data.updated_at);
        this.renderConfigColumn(data.config);
        this.renderSecurityColumn(data.security);
        this.renderChecksColumn(data.checks);
    },
    
    renderColumnTitle: function(type) {
        let title = document.createElement('h3'),
            span = document.createElement('span');
        title.classList.add('section-title');
        title.textContent = _('dashbored.sitedash.' + type);
        span.classList.add('dashbored-sitedash-updated-at');
        span.textContent = this.updatedAt;
        title.appendChild(span);
        return title;
    },
    
    renderConfigColumn: function(rows) {
        this.firstCol.innerHTML = '';
        this.firstCol.appendChild(this.renderColumnTitle('config'));
        for (const item in rows) {
            let row = document.createElement('div'),
                tag = document.createElement('span'),
                dots = document.createElement('div'),
                value = document.createElement('span');
            
            tag.classList.add('tag');
            dots.classList.add('dots');
            value.classList.add('sd-value');
            
            switch (item) {
                case 'database_version':
                case 'modx_upgrade_available':
                    continue;
                case 'modx_version':
                case 'ip':
                case 'php_version':
                    tag.textContent = _('dashbored.sitedash.' + item);
                    value.textContent = rows[item];
                    break;
                case 'web_server':
                    tag.textContent = _('dashbored.sitedash.web');
                    value.textContent = rows['web_server'] || '';
                    break;
                case 'database_type':
                    if (rows['database_version'].length > 10) {
                        rows['database_version'] = rows['database_version'].split('-')[0];
                    }
                    tag.textContent = _('dashbored.sitedash.' + rows[item]);
                    value.textContent = rows['database_version'] || '';
                    break;
            }
            
            row.appendChild(tag);
            row.appendChild(dots);
            row.appendChild(value);
            this.firstCol.appendChild(row);
            
        }
    },

    renderSecurityColumn: function(rows) {
        this.secondCol.innerHTML = '';
        this.secondCol.appendChild(this.renderColumnTitle('security'));
        for (const item in rows) {
            let row = document.createElement('div'),
                tag = document.createElement('span'),
                dots = document.createElement('div'),
                value = document.createElement('span');

            tag.classList.add('tag');
            dots.classList.add('dots');
            value.classList.add('sd-value');

            switch (item) {
                case 'ssl_cert':
                    tag.textContent = _('dashbored.sitedash.' + item);
                    if (rows[item] !== 'valid') {
                        value.classList.add('sd-alert');
                    }
                    value.textContent = _('dashbored.sitedash.' + rows[item]);
                    break;
                case 'tls_version':
                    tag.textContent = _('dashbored.sitedash.protocol');
                    value.textContent = rows[item];
                    break;
                case 'core_protected':
                case 'renamed_manager':
                case 'setup_removed':
                    tag.textContent = _('dashbored.sitedash.' + item);
                    value.innerHTML = rows[item] === '1'
                        ? '<i class="icon icon-check"></i>' : '<i class="icon icon-close sd-alert"></i>';
                    break;
            }

            row.appendChild(tag);
            row.appendChild(dots);
            row.appendChild(value);
            this.secondCol.appendChild(row);
        }
    },

    renderChecksColumn: function(rows) {
        this.thirdCol.innerHTML = '';
        this.thirdCol.appendChild(this.renderColumnTitle('checks'));
        for (const item in rows) {
            let row = document.createElement('div'),
                tag = document.createElement('span'),
                dots = document.createElement('div'),
                value = document.createElement('span');

            tag.classList.add('tag');
            dots.classList.add('dots');
            value.classList.add('sd-value');

            switch (item) {
                case 'checks_passed':
                    tag.textContent = _('dashbored.sitedash.' + item);
                    value.textContent = rows[item] + '/' + rows['checks_total'];
                    break;
                case 'checks_total':
                    continue;
                case 'error_log':
                case 'disk_used':
                case 'extras_installed':
                    tag.textContent = _('dashbored.sitedash.' + item);
                    value.textContent = rows[item];
                    break;
                case 'updates_available':
                    tag.textContent = _('dashbored.sitedash.' + item);
                    if (parseInt(rows[item]) < parseInt(rows['extras_installed'])) {
                        value.classList.add('sd-info');
                    }
                    value.textContent = rows[item];
                    break;
            }

            row.appendChild(tag);
            row.appendChild(dots);
            row.appendChild(value);
            this.thirdCol.appendChild(row);

        }
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
    renderAboutTabContent: function() {
        return `
        <h2>SiteDash</h2>
        <p>SiteDash checks all of your sites 4 times a day for security issues, out-of-date extras, error logs growing out of control, crashed tables, and more.</p> 
        <p>SiteDash notifies you about what you really need to know immediately, gives you powerful remote management features, and presents it all in a user (and mobile) friendly dashboard.</p>
        <a href="https://sitedash.app/" target="_blank" rel="noopener">https://sitedash.app</a>
        `;
    }
});
Ext.reg('dashboredsitedash-settings', DashboredSiteDash.Settings);
