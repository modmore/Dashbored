function DashboredWeather(containerId) {
    if (DashboredWeather.instance_) {
        return DashboredWeather.instance_;
    }
    DashboredWeather.instance_ = this;

    this.window = {};
    this.containerEl = document.querySelector(containerId);
    
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
    this.record = {};
    
    document.querySelector('.dashbored-title-btn.config.weather').addEventListener('click', (e) => {
        this.record = {
            id: this.containerEl.dataset.id, 
            location: this.containerEl.dataset.location, 
            temp_type: this.containerEl.dataset.temptype, 
            distance_type: this.containerEl.dataset.distancetype,
            background_type: this.containerEl.dataset.backgroundtype
        }; 
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
                    let props = r.a.result.object.properties;
                    this.containerEl.dataset.location = props.location;
                    this.containerEl.dataset.temptype = props.temp_type;
                    this.containerEl.dataset.distancetype = props.distance_type;
                    this.containerEl.dataset.backgroundtype = props.background_type;
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
                        console.error('Unable to retrieve weather data from the server.');
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
    }
}

DashboredWeather.Settings = function(config) {
    config = config || {};
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
                    }, scope: this}
                },
                items: [{
                    xtype: 'radiogroup',
                    fieldLabel: 'Background Type',
                    cls: 'dashbored-bg-type',
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
                    html: '<div class="dashbored-settings-bg none"><span>No background</span></div>',
                    itemId: 'none',
                    type: 'bg-panel',
                    hidden: true,
                    anchor: '100%'
                },{
                    html: '<div class="dashbored-settings-bg image">' +
                            '<span>Image</span>' +
                            '<div class="overlay">' +
                                '<button class="select-img-btn">Select Image</button>' +
                            '</div>' +
                        '</div>',
                    itemId: 'image',
                    type: 'bg-panel',
                    hidden: true,
                    anchor: '100%',
                    editable: true
                },{
                    html: '<div class="dashbored-settings-bg video">' +
                            '<span>Video</span>' +
                            '<div class="overlay">' +
                                '<button class="select-video-btn">Select Video</button>' +
                            '</div>' +
                        '</div>',
                    itemId: 'video',
                    type: 'bg-panel',
                    hidden: true,
                    anchor: '100%',
                    editable: true
                }]
            },{
                title: 'API',
                items: []
            }]
        }]
    });
    DashboredWeather.Settings.superclass.constructor.call(this, config);
};
Ext.extend(DashboredWeather.Settings, MODx.Window, {
    
    switchBackgroundTab: function(radio) {
        if (!radio.checked) {
            return;
        }
        
        var that = this;
        this.getBackgroundPanels().forEach(function (panel) {
            if (radio.inputValue === panel.itemId) {
                panel.setVisible(true);
                if (panel.body && panel.editable) {
                    panel.body.on('click', function () {
                        that.selectImageFromBrowser(panel);
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
    selectImageFromBrowser: function(panel) {
        var browser = MODx.load({
            xtype: 'modx-browser',
            id: Ext.id(),
            multiple: true,
            listeners: {
                select: {fn: function(file) {
                    this.selectImageCallback(file, panel);
                }, scope: this}
            },
            allowedFileTypes: 'png,gif,jpg,jpeg,svg,webp',
            hideFiles: true,
            source: MODx.config.default_media_source,
            openTo: '/',
        });
        browser.show();
    },
    selectImageCallback: function(file, panel) {
        console.log('in the callback');
        console.log(panel);
        console.log(file);
        var container = panel.get('.dashbored-settings-bg');
        console.log(container);
        var imgTag = '<img class="dashbored-settings-bg" src="' + Ext.util.Format.htmlEncode(file.image) + '">';
        panel.update(imgTag);
    }
});
Ext.reg('dashboredweather-settings', DashboredWeather.Settings);
