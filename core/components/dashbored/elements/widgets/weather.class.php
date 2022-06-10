<?php

require_once __DIR__ . '/abstract.class.php';

class WeatherDashboardWidget extends DashboredAbstractDashboardWidget
{
    // Values are defaults
    public const ACCEPTED_FIELDS = [
        'location' => 'amsterdam',
        'temp_type' => 'c',
        'distance_type' => 'km',
        'background_type' => 'none',
        'bg_mask' => '0',
        'bg_image' => '',
        'bg_video' => '',
    ];
    
    public function render(): string
    {
        $this->initialize();

        $this->controller->addCss($this->dashbored->config['assets_url'] . 'css/mgr.css');

        $titleBar = $this->getWidgetTitleBar('weather');
        $this->widget->set('name', $titleBar);

        $props = [];
        foreach (self::ACCEPTED_FIELDS as $field => $default) {
            $props[$field] = self::getUserSetting($this->modx, 'dashbored.weather.' . $field, 
                $this->modx->user->get('id')) ?? $default;
        }
        
        $this->controller->addHtml(<<<HTML
<style>
    #dashboard-block-{$this->widget->get('id')} {
        background: rgb(255,255,255);
        background: linear-gradient(120deg, rgba(255,255,255,1) 0%, rgba(123,217,238,1) 22%, rgba(0,181,222,1) 70%); 
        padding: 0;
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
<!--<video width="600" height="300" autoplay loop style="position: absolute; object-fit: cover; width:100%; height: 100%; margin: -10px;">-->
<!--  <source src="/packages/dashbored/assets/components/dashbored/weather/videos/clouds2.mp4" type="video/mp4">-->
<!--</video>-->
<div id="dashbored{$this->widget->get('id')}-weather" style="position: relative; z-index: 2; pointer-events: none;"
    data-id="{$this->widget->get('id')}" 
    data-location="{$props['location']}" 
    data-temptype="{$props['temp_type']}" 
    data-distancetype="{$props['distance_type']}" 
    data-backgroundtype="{$props['background_type']}" 
    data-backgroundmask="{$props['bg_mask']}" 
    class="dashbored-weather-widget">
    <div class="column">
        <div class="region">
             <p class="main"></p>
             <div class="row"></div>
        </div>
        <div class="current">
            <div class="current-row">
                <span class="icon"></span><span class="temp"></span></span><span class="temp_type"></span>
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