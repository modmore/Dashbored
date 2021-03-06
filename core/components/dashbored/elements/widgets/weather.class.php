<?php

require_once __DIR__ . '/abstract.class.php';

class WeatherDashboardWidget extends DashboredAbstractDashboardWidget
{
    // Values are defaults
    public const ACCEPTED_FIELDS = [
        'location' => 'arnhem,netherlands',
        'temp_type' => 'c',
        'distance_type' => 'km',
        'background_type' => 'none',
        'bg_mask' => '1',
        'bg_image' => '',
        'bg_video' => '',
    ];
    
    public function render(): string
    {
        $this->initialize();

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
    new DashboredWeather('{$this->widget->get('id')}').setup();
});
</script>

HTML
        );

        return <<<HTML
<div class="dashbored-weather-mask dashbored-loading-mask">
    {$this->getSpinner()}
</div>
<div class="dashbored-weather-mask dashbored-msg"></div>
<div class="dashbored-bg">
    <div class="db-bg-mask"></div>
</div>
<div id="dashbored{$this->widget->get('id')}-weather" class="dashbored-weather-widget"
    data-id="{$this->widget->get('id')}" 
    data-location="{$props['location']}" 
    data-temptype="{$props['temp_type']}" 
    data-distancetype="{$props['distance_type']}" 
    data-backgroundtype="{$props['background_type']}" 
    data-backgroundmask="{$props['bg_mask']}" 
>
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