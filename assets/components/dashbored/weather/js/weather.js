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
    this.current.degrees = this.current.querySelector('.degrees');
    this.current.temp_type = this.current.querySelector('.temp_type');
    this.current.comment = this.current.querySelector('.comment');
    this.current.precip = this.current.querySelector('.precip');
    this.current.humidity = this.current.querySelector('.humidity');
    this.current.wind = this.current.querySelector('.wind');
    
    this.outlook = this.containerEl.querySelector('.outlook');

    document.querySelector('.dashbored-title-btn.config.weather').addEventListener('click', (e) => {
        let record = {
            id: this.containerEl.dataset.id, 
            location: this.containerEl.dataset.location, 
            temp_type: this.containerEl.dataset.temptype, 
            distance_type: this.containerEl.dataset.distancetype
        }; 
        this.openSettings(record);
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
            ,listeners: {
                'success': {fn: function(r) {
                    let props = r.a.result.object.properties;
                    this.containerEl.dataset.location = props.location;
                    this.containerEl.dataset.temptype = props.temp_type;
                    this.containerEl.dataset.distance_type = props.distance_type;
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
        let that = this;
        
        // Region
        let split = data.region.split(', ');
        this.region.main.textContent = split[0];
        this.region.row.innerHTML = '';
        
        let dayhour = document.createElement('span');
        dayhour.classList.add('dayhour');
        dayhour.textContent = data.currentConditions.dayhour;
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
        img.src = data.currentConditions.iconURL;
        this.current.icon.appendChild(img);
        
        this.current.temp.textContent = data.currentConditions.temp;
        this.current.degrees.innerHTML = "&deg;";
        this.current.temp_type.textContent = data.currentConditions.temp_type;
        this.current.comment.textContent = data.currentConditions.comment;
        this.current.precip.innerHTML = _('dashbored.weather.precip') + ': <strong>' + data.currentConditions.precip + '</strong>';
        this.current.humidity.innerHTML = _('dashbored.weather.humidity') + ': <strong>' + data.currentConditions.humidity + '</strong>';
        this.current.wind.innerHTML = _('dashbored.weather.wind') + ': <strong>' + data.currentConditions.wind + '</strong>';
        
        // Outlook
        this.outlook.innerHTML = '';
        data.next_days.forEach(function(day) {
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
                items: []
            },{
                title: 'API',
                items: []
            }]
        }]
    });
    DashboredWeather.Settings.superclass.constructor.call(this, config);
};
Ext.extend(DashboredWeather.Settings, MODx.Window);
Ext.reg('dashboredweather-settings', DashboredWeather.Settings);
