<?php

require_once __DIR__ . '/abstract.class.php';

class WeatherDashboardWidget extends DashboredAbstractDashboardWidget
{
    public function render()
    {
        $this->initialize();

        $this->widget->set('name', $this->modx->lexicon('dashbored.weather.name'));

        $this->controller->addCss($this->dashbored->config['assets_url'] . 'css/mgr.css');

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
    new DashboredWeather('#dashbored{$this->widget->get('id')}-weather').setup('hongkong'); // todo: get dynamic query!
});
</script>
HTML
        );

        return <<<HTML
<div id="dashbored{$this->widget->get('id')}-weather" class="dashbored-weather-widget">
    <svg class="dashbored-spinner" viewBox="0 0 50 50">
      <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
    </svg>
    <div class="column">
        <div class="region">
             <p class="main"></p>
             <div class="row">
                 <p class="dayhour"></p>
             </div>
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