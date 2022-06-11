function DashboredWeather(widgetId) {
    if (DashboredWeather.instance_) {
        return DashboredWeather.instance_;
    }
    DashboredWeather.instance_ = this;

    this.window = {};
    this.widgetEl = document.querySelector('#dashboard-block-' + widgetId);
    this.containerEl = this.widgetEl.querySelector('#dashbored' + widgetId + '-weather');
    
    this.region = this.containerEl.querySelector('.region');
    this.region.main = this.region.querySelector('.main');
    this.region.dayhour = this.region.querySelector('.dayhour');
    this.region.row = this.region.querySelector('.row');
    
    this.current = this.containerEl.querySelector('.current');
    this.current.icon = this.current.querySelector('.icon');
    this.current.temp = this.current.querySelector('.temp');
    this.current.temp_type = this.current.querySelector('.temp_type');
    this.current.comment = this.current.querySelector('.comment');
    this.current.precip = this.current.querySelector('.precip');
    this.current.humidity = this.current.querySelector('.humidity');
    this.current.wind = this.current.querySelector('.wind');
    
    this.outlook = this.containerEl.querySelector('.outlook');
    
    this.record = {
        id: this.containerEl.dataset.id
    };
    
    document.querySelector('.dashbored-title-btn.config.weather').addEventListener('click', (e) => {
        this.openSettings(this.record);
    });
    document.querySelector('.dashbored-title-btn.refresh.weather').addEventListener('click', (e) => {
        this.refresh();
    });
}
window['DashboredWeather'] = DashboredWeather;

DashboredWeather.config = {};

DashboredWeather.prototype = {
    openSettings: function(record) {
        let that = this;
        if (this.dashboredSettingsWindow) {
            this.dashboredSettingsWindow.destroy();
        }
        this.dashboredSettingsWindow = MODx.load({
            xtype: 'dashboredweather-settings'
            ,record: record
            ,listeners: {
                'success': {fn: function(r) {
                    let props = r.a.result.message;
                    this.record = r.results;
                    that.refresh(props.location);
                },scope:this},
                'failure': {fn: function(r) {
                    console.error('[Dashbored] Unable to save weather settings. ' + r.msg);
                }, scope: this
                }
            }
        });
        this.dashboredSettingsWindow.setValues(record);
        this.dashboredSettingsWindow.show();
    },
    
    loadData: function(location = '', ignoreCache = false) {
        let that = this;

        this.enableSpinner();
        
        MODx.Ajax.request({
            url: Dashbored.config.connectorUrl
            ,params: {
                id: that.containerEl.dataset.id,
                action: 'mgr/weather/refresh',
                location: location,
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
                        console.error('[Dashbored] Unable to retrieve weather data from the server.');
                    }
                    ,scope: this
                }
            }
        });
    },
    
    render: function(data) {
        let that = this,
            tempType = data.current.temp_type === 'c' ? _('dashbored.weather.celsius_symbol') : _('dashbored.weather.fahrenheit_symbol'),
            distanceType = data.current.distance_type === 'km' ? _('dashbored.weather.kph') : _('dashbored.weather.mph');
        
        // Region
        let split = data.region.split(', ');
        this.region.main.textContent = split[0];
        this.region.row.innerHTML = '';
        
        let dayhour = document.createElement('span');
        dayhour.classList.add('dayhour');
        dayhour.textContent = data.current.dayhour;
        this.region.row.appendChild(dayhour);
        
        if (typeof split[1] !== 'undefined') {
            let second = document.createElement('span');
            second.classList.add('secondary');
            second.innerHTML = '&bull;&nbsp;&nbsp;' + split[1];
            this.region.row.appendChild(second);
        }
        
        // Current
        this.current.icon.innerHTML = '';
        let img = document.createElement('img');
        img.src = data.current.iconURL;
        this.current.icon.appendChild(img);
        
        this.current.temp.textContent = data.current.temp;
        this.current.temp_type.textContent = tempType;
        this.current.comment.textContent = data.current.comment;
        this.current.precip.innerHTML = _('dashbored.weather.precip') + ': <strong>' + data.current.precip + '</strong>';
        this.current.humidity.innerHTML = _('dashbored.weather.humidity') + ': <strong>' + data.current.humidity + '</strong>';
        this.current.wind.innerHTML = _('dashbored.weather.wind') + ': <strong>' + data.current.wind + ' ' + distanceType + '</strong>';
        
        // Outlook
        this.outlook.innerHTML = '';
        data.outlook.forEach(function(day) {
            let div = document.createElement('div');
            div.classList.add('day');
            
            let name = document.createElement('div');
            name.classList.add('name');
            name.textContent = day.day.substring(0, 3);
            div.appendChild(name);

            let temp = document.createElement('div');
            temp.classList.add('temp');
            temp.textContent = day.max_temp;
            div.appendChild(temp);

            let img = document.createElement('img');
            img.src = day.iconURL;
            div.appendChild(img);
            
            that.outlook.appendChild(div);
        });
        
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
            newVideo.setAttribute('loop', 'true');
            bg.appendChild(newVideo);
        }
        
        // Render mask
        if (data.bg_mask) {
            let mask = bg.querySelector('.db-bg-mask');
            mask.style.backgroundColor = this.getBackgroundStyle(data.bg_mask);
            
            // Don't darken if no background
            if (data.background_type === 'none') {
                mask.style.backgroundColor = 'rgba(0,0,0,0)';
            }
        }
        
        this.disableSpinner();
    },
    
    disableSpinner: function() {
        document.querySelector('.dashbored-weather-mask').style.visibility = 'hidden';
    },

    enableSpinner: function() {
        document.querySelector('.dashbored-weather-mask').style.visibility = 'visible';
    },
    
    refresh: function(location) {
        this.loadData(location, true);
    },
    
    setup: function() {
        this.loadData();
    },
    
    getBackgroundStyle: function(bgOpacity) {
        bgOpacity = parseInt(bgOpacity);
        if (bgOpacity < 10 && bgOpacity > 0) {
            bgOpacity = '.0' + bgOpacity;
        }
        else if (bgOpacity !== 0 && bgOpacity !== 100) {
            bgOpacity = '.' + bgOpacity;
        }
        return 'rgba(0,0,0,' + bgOpacity + ')';
    }
}

DashboredWeather.Settings = function(config) {
    config = config || {};
    this.bgOpacity = config.bgOpacity || 0;
    this.bgRendered = false;
    var win = this;
    Ext.applyIf(config,{
        title: 'Dashbored Weather Configuration',
        url: Dashbored.config.connectorUrl,
        baseParams: {
            action: 'mgr/weather/save'
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
            itemId: 'settings-tabs',
            deferRender: false,
            defaults: {
                layout: 'form'
            },
            items: [{
                title: 'Settings',
                items: [{
                    xtype: 'textfield',
                    fieldLabel: 'City',
                    name: 'location',
                    anchor: '100%',
                    allowBlank: false
                },{
                    xtype: 'label',
                    cls: 'desc-under',
                    html: 'Type the city name without spaces. e.g. newyork, hongkong, london etc.'
                },{
                    xtype: 'modx-combo',
                    fieldLabel: 'Temperature Measurement',
                    name: 'temp_type',
                    hiddenName: 'temp_type',
                    anchor: '100%',
                    store: new Ext.data.SimpleStore({
                        fields: ['d', 'v'],
                        data: [
                            [_('dashbored.weather.celsius'), 'c'],
                            [_('dashbored.weather.fahrenheit'), 'f']
                        ]
                    }),
                    displayField: 'd',
                    valueField: 'v',
                    mode: 'local',
                    value: 'c'
                },{
                    xtype: 'label',
                    cls: 'desc-under',
                    html: 'Select celsius or fahrenheit'
                },{
                    xtype: 'modx-combo',
                    fieldLabel: 'Distance Measurement',
                    name: 'distance_type',
                    hiddenName: 'distance_type',
                    anchor: '100%',
                    store: new Ext.data.SimpleStore({
                        fields: ['d', 'v'],
                        data: [
                            [_('dashbored.weather.kilometres'), 'km'],
                            [_('dashbored.weather.miles'), 'mile']
                        ]
                    }),
                    displayField: 'd',
                    valueField: 'v',
                    mode: 'local',
                    value: 'km'
                },{
                    xtype: 'label',
                    cls: 'desc-under',
                    html: 'Select kilometres or miles'
                }]
            },{
                title: 'Background',
                listeners: {
                    'activate': {fn: function(tab) {
                        var group = tab.find('itemId', 'background_type')[0];
                        group.setValue(this.record.background_type);
                        
                        var radios = group.items.items;
                        radios.forEach(function(radio) {
                            if (radio.checked) {
                                win.switchBackgroundTab(radio);
                            }
                        });

                        if (win.bgRendered === false) {
                            win.getBackgroundPanels().forEach(function (panel) {
                                // Render any saved images
                                if (panel.itemId === 'image' && panel.body) {
                                    let url = win.fp.find('name', 'bg_image')[0].getValue();
                                    if (url) {
                                        win.setImage(panel, url);
                                    }
                                }
                                // Render any saved videos
                                if (panel.itemId === 'video' && panel.body) {
                                    let url = win.fp.find('name', 'bg_video')[0].getValue();
                                    if (url) {
                                        win.setVideo(panel, url);
                                    }
                                }
                            });

                            // Set flag so backgrounds are only rendered once
                            win.bgRendered = true;
                        }
                    }, scope: this}
                },
                items: [{
                    xtype: 'hidden',
                    name: 'bg_image'
                },{
                    xtype: 'hidden',
                    name: 'bg_video'
                },{
                    xtype: 'radiogroup',
                    fieldLabel: 'Background Type',
                    cls: 'db-bg-type',
                    itemId: 'background_type',
                    items: [{
                        boxLabel: 'None',
                        name: 'background_type',
                        inputValue: 'none',
                        itemId: 'none',
                        checked: true,
                        listeners: {
                            check: {fn: this.switchBackgroundTab, scope: this}
                        }
                    },{
                        boxLabel: 'Image',
                        name: 'background_type',
                        inputValue: 'image',
                        listeners: {
                            check: {fn: this.switchBackgroundTab, scope: this}
                        }
                    },{
                        boxLabel: 'Video',
                        name: 'background_type',
                        inputValue: 'video',
                        listeners: {
                            check: {fn: this.switchBackgroundTab, scope: this}
                        }
                    }]
                },{
                    html: this.renderBackgroundPanel('none'),
                    itemId: 'none',
                    type: 'bg-panel',
                    hidden: true,
                    anchor: '100%'
                },{
                    html: this.renderBackgroundPanel('image'),
                    itemId: 'image',
                    type: 'bg-panel',
                    hidden: true,
                    anchor: '100%',
                    editable: true,
                    scope: this
                },{
                    html: this.renderBackgroundPanel('video'),
                    itemId: 'video',
                    type: 'bg-panel',
                    hidden: true,
                    anchor: '100%',
                    editable: true,
                    scope: this
                },{
                    xtype: 'sliderfield',
                    fieldLabel: 'Darken Background',
                    itemId: 'bg-mask-slider',
                    minValue: 1,
                    name: 'bg_mask',
                    listeners: {
                        'valid': {fn: function(slider) {
                            win.bgOpacity = slider.getValue();
                            win.updateOpacity(win);
                        }, scope: this},
                    }
                }]
            },{
                title: 'About',
                items: []
            }]
        }]
    });
    DashboredWeather.Settings.superclass.constructor.call(this, config);
};
Ext.extend(DashboredWeather.Settings, MODx.Window, {
    updateOpacity: function(win) {
        document.querySelectorAll('.db-settings-bg-mask').forEach(function(mask) {
            mask.style.backgroundColor = DashboredWeather.prototype.getBackgroundStyle(win.bgOpacity);
        })
    },
    
    switchBackgroundTab: function(radio) {
        if (!radio.checked) {
            return;
        }
        
        let that = this;
        this.getBackgroundPanels().forEach(function (panel) {
            if (radio.inputValue === panel.itemId) {
                panel.setVisible(true);
                if (panel.body && panel.editable) {
                    panel.body.on('click', function () {
                        that.selectFileFromBrowser(panel, radio.inputValue);
                    });
                }
            } else {
                panel.setVisible(false);
                if (panel.body) {
                    panel.body.removeAllListeners();
                }
            }
        });
        
    },
    
    getBackgroundPanels: function() {
        return this.find('itemId', 'settings-tabs')[0].getActiveTab().find('type', 'bg-panel');
    },
    
    renderBackgroundPanel: function(name) {
        if (name === 'none') {
            return `<div class="db-settings-bg none">
                    <div class="db-bg-content">
                        <span class="db-bg-label">No background</span>
                        <div class="db-settings-bg-mask" style="background: rgba(0, 0, 0, ${this.bgOpacity});"></div>
                    </div>
                </div>`;
        }
        
        return `<div class="db-settings-bg ${name}">
                    <div id="db-${name}-content" class="db-bg-content">
                        <div class="db-bg-label">${_('dashbored.' + name)}</div>
                        <div class="db-settings-bg-mask"></div>
                    </div>
                    <div class="db-overlay">
                        <span class="db-select-btn">${_('dashbored.select_' + name)}</span>
                    </div>
                </div>`;
    },
    
    selectFileFromBrowser: function(panel, type) {
        const videoTypes = ['webm', 'mp4', 'mkv'],
              imageTypes = ['png', 'gif', 'jpg', 'jpeg', 'svg', 'webp'];
        
        let browser = MODx.load({
            xtype: 'modx-browser',
            id: Ext.id(),
            multiple: true,
            listeners: {
                select: {fn: function(file) {
                    if (imageTypes.includes(file.ext) && type === 'image') {
                        this.setImage(panel, file.image);
                        this.fp.find('name', 'bg_image')[0].setValue(file.image);
                    }
                    else if (videoTypes.includes(file.ext) && type === 'video') {
                        this.setVideo(panel, '/' + file.relativeUrl);
                        this.fp.find('name', 'bg_video')[0].setValue('/' + file.relativeUrl);
                    }
                    else {
                        MODx.msg.alert('Invalid File Type', 'Invalid file type!');
                    }
                }, scope: this}
            },
            allowedFileTypes: type === 'video' ? videoTypes.join(',') : imageTypes.join(','),
            hideFiles: true,
            source: MODx.config.default_media_source,
            openTo: '/',
            root: '/'
        });
        browser.show();
    },
    
    setImage: function(panel, url) {
        let el = panel.getEl().down('#db-image-content'),
            img = document.createElement('img');
        img.classList.add('db-bg-img');
        img.src = Ext.util.Format.htmlEncode(url);
        el.appendChild(img);
    },
    
    setVideo: function(panel, url) {
        let el = panel.getEl().down('#db-video-content'),
            video = document.createElement('video');
        video.classList.add('db-bg-video');
        video.src = url;
        video.setAttribute('autoplay', 'true');
        video.setAttribute('loop', 'true');
        el.appendChild(video);
    }
});
Ext.reg('dashboredweather-settings', DashboredWeather.Settings);
