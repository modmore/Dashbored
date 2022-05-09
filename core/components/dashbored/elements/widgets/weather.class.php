<?php

require_once __DIR__ . '/abstract.class.php';

class WeatherDashboardWidget extends DashboredAbstractDashboardWidget
{
    public const DEFAULT_LOCATION = 'amsterdam';
    public const DEFAULT_TEMP_TYPE = 'c';
    public const DEFAULT_DISTANCE_TYPE = 'km';
    
    public function render(): string
    {
        $this->initialize();

        $this->controller->addCss($this->dashbored->config['assets_url'] . 'css/mgr.css');

        $titleBar = $this->getWidgetTitleBar('weather');
        $this->widget->set('name', $titleBar);
        
        $props = $this->widget->get('properties');
        $props = [
            'location' => $props['location'] ?? self::DEFAULT_LOCATION,
            'temp_type' => $props['temp_type'] ?? self::DEFAULT_TEMP_TYPE,
            'distance_type' => $props['distance_type'] ?? self::DEFAULT_DISTANCE_TYPE,
        ];
        
        $this->controller->addHtml(<<<HTML
<style>
    #dashboard-block-{$this->widget->get('id')} {
        background: rgb(255,255,255);
        background: linear-gradient(120deg, rgba(255,255,255,1) 0%, rgba(123,217,238,1) 22%, rgba(0,181,222,1) 70%); 
    }
    #dashboard-block-{$this->widget->get('id')} .title-wrapper {background: #fff;}
</style>
<script src="{$this->dashbored->config['assets_url']}weather/js/weather.js"></script>
<script>
Ext.onReady(function() {
    new DashboredWeather('#dashbored{$this->widget->get('id')}-weather').setup();
});
</script>

HTML
        );

        return <<<HTML
<div class="dashbored-weather-mask">
    <svg class="dashbored-spinner" viewBox="0 0 50 50">
      <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
    </svg>
</div>
<div id="dashbored{$this->widget->get('id')}-weather" 
    data-id="{$this->widget->get('id')}" 
    data-location="{$props['location']}" 
    data-temptype="{$props['temp_type']}" 
    data-distancetype="{$props['distance_type']}" 
    class="dashbored-weather-widget">
    <div class="column">
        <div class="region">
             <p class="main"></p>
             <div class="row"></div>
        </div>
        <div class="current">
            <div class="current-row">
                <span class="icon"></span><span class="temp"></span><span class="degrees"></span><span class="temp_type"></span>
            </div>
            <div class="comment"></div>
            <div class="extras-row">
                <span class="precip"></span><span class="humidity"></span><span class="wind"></span>
            </div>
        </div>
        <div class="outlook"></div>
    </div>
</div>
HTML;
    }
}
return 'WeatherDashboardWidget';