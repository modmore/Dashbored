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
        if (this.dashboredWeatherSettingsWindow) {
            this.dashboredWeatherSettingsWindow.destroy();
        }
        this.dashboredWeatherSettingsWindow = MODx.load({
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
        this.dashboredWeatherSettingsWindow.setValues(record);
        this.dashboredWeatherSettingsWindow.show();
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
        
        if (typeof data.current !== 'undefined') {
            this.renderAPIData(data);
        }
        else {
            // Render error msg
            Dashbored.displayMessage(this.containerEl, _('dashbored.no_data_msg', {type: 'WeatherDB'}));
        }
        
        Dashbored.renderBackground(this, data);
        
        this.disableSpinner();
    },

    renderAPIData: function(data) {
        this.containerEl.querySelectorAll('.dashbored-error-msg').forEach((msg) => {
            msg.remove();
        });
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
}

DashboredWeather.Settings = function(config) {
    this.widgetType = 'weather';
    Ext.applyIf(config,{
        title: 'Dashbored Weather Configuration',
        baseParams: {
            action: 'mgr/weather/save'
        }
    });
    DashboredWeather.Settings.superclass.constructor.call(this, config);
};
Ext.extend(DashboredWeather.Settings, Dashbored.Settings, {
    getSettingsTab: function(win) {
        return {
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
        };
    },
    renderAboutTabContent: function() {
        return `
            <h2>Weather DB API</h2>
            <p>From the website:</p>
            <p><em>"This is an API which will provide you with the weather information fast and easy without any authentication or API key. It's completely free to use and simple to implement. "</em></p> 
            <a href="https://weatherdbi.herokuapp.com/documentation/v1" target="_blank" rel="noopener">https://weatherdbi.herokuapp.com/documentation/v1</a>
        `;
    }
});
Ext.reg('dashboredweather-settings', DashboredWeather.Settings);
