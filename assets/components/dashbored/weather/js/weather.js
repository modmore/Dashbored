function DashboredWeather(containerId) {
    if (DashboredWeather.instance_) {
        return DashboredWeather.instance_;
    }
    DashboredWeather.instance_ = this;

    this.containerEl = document.querySelector(containerId);
    this.endpoint = 'https://weatherdbi.herokuapp.com/data/weather/';
}
window['DashboredWeather'] = DashboredWeather;

DashboredWeather.prototype = {
    loadData: function(query) {
        let that = this,
            xhr = new XMLHttpRequest();
        
        xhr.open("GET", this.endpoint + query, true);
        xhr.onload = function (e) {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    console.log(xhr.responseText);
                    that.render(xhr.responseText);
                } else {
                    console.log(xhr.responseText);
                    that.render(xhr.responseText);
                }
            }
        };
        xhr.onerror = function (e) {
            console.error(xhr.statusText);
        };
        xhr.send(null);
    },
    
    render: function(data) {
        this.containerEl.textContent = data;
    },
    
    setup: function(query) {
        this.loadData(query);
    }
}