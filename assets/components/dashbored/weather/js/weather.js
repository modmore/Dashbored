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
        this.openSettings();
    });
    document.querySelector('.dashbored-title-btn.refresh.weather').addEventListener('click', (e) => {
        this.refresh();
    });
}
window['DashboredWeather'] = DashboredWeather;

DashboredWeather.config = {};

DashboredWeather.prototype = {
    openSettings: function() {
        if (this.dashboredSettingsWindow) {
            this.dashboredSettingsWindow.destroy();
        }
        this.dashboredSettingsWindow = MODx.load({
            xtype: 'dashboredweather-settings'
            ,listeners: {
                'success': {fn: function() {
                        alert('success');
                    },scope:this},
                'failure': {fn: function(r) {
                        alert('failure');
                    }, scope: this
                }
            }
        });
        //this.dashboredSettingsWindow.setValues(values);
        this.dashboredSettingsWindow.show();
    },
    
    loadData: function(query = '', ignoreCache = false) {
        let that = this;

        this.enableSpinner();
        
        MODx.Ajax.request({
            url: Dashbored.config.connectorUrl
            ,params: {
                action: 'mgr/weather/refresh',
                location: query,
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
        if (typeof split[1] !== 'undefined') {
            let second = document.createElement('span');
            second.classList.add('secondary');
            second.innerHTML = '&bull;&nbsp;&nbsp;' + split[1];
            this.region.row.appendChild(second);
        }
        this.region.dayhour.textContent = data.currentConditions.dayhour;
        
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
    
    refresh: function() {
        this.loadData('singapore', true);
    },
    
    setup: function(query) {
        this.loadData(query);
    }
}

DashboredWeather.Settings = function(config) {
    config = config || {};
    Ext.applyIf(config,{
        title: 'Dashbored Weather Configuration',
        url: DashboredWeather.config.connectorUrl,
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
                    anchor: '100%'
                },{
                    xtype: 'label',
                    cls: 'desc-under',
                    html: 'Type the city name without spaces. e.g. newyork, hongkong, london etc.'
                },{
                    xtype: 'modx-combo',
                    fieldLabel: 'Temperature Measurement',
                    name: 'temp_type',
                    anchor: '100%',
                },{
                    xtype: 'label',
                    cls: 'desc-under',
                    html: 'Select celsius or fahrenheit'
                },{
                    xtype: 'modx-combo',
                    fieldLabel: 'Distance Measurement',
                    name: 'distance_type',
                    anchor: '100%',
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
