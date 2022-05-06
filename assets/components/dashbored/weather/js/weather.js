function DashboredWeather(containerId) {
    if (DashboredWeather.instance_) {
        return DashboredWeather.instance_;
    }
    DashboredWeather.instance_ = this;

    this.containerEl = document.querySelector(containerId);
    
    this.region = this.containerEl.querySelector('.region');
    this.region.main = this.region.querySelector('.main');
    this.region.secondary = this.region.querySelector('.secondary');
    this.region.dayhour = this.region.querySelector('.dayhour');
    
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
}
window['DashboredWeather'] = DashboredWeather;

DashboredWeather.prototype = {
    loadData: function(query) {
        let that = this;
        
        MODx.Ajax.request({
            url: Dashbored.config.connectorUrl
            ,params: {
                action: 'mgr/weather/refresh'
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
        this.region.secondary.innerHTML = '&bull;&nbsp;&nbsp;' + split[1];
        this.region.dayhour.textContent = data.currentConditions.dayhour;
        
        // Current
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
        document.querySelector('.dashbored-weather-widget .dashbored-spinner').style.visibility = 'hidden';
    },
    
    setup: function(query) {
        this.loadData(query);
    }
}