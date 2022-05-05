<?php

require_once __DIR__ . '/abstract.class.php';

class WeatherDashboardWidget extends DashboredAbstractDashboardWidget
{
    public function render()
    {
        $this->initialize();

        $this->widget->set('name', $this->modx->lexicon('dashbored.weather.name'));

        //$this->controller->addCss($this->dashbored->config['assets_url'] . 'weather/css/index.css');

        $this->controller->addHtml(<<<HTML
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
    <div class="dashbored-spinner"></div>
</div>
HTML;
    }
}
return 'WeatherDashboardWidget';