<?php

require_once dirname(__DIR__) . '/dashbored/save.class.php';
require_once dirname(__DIR__, 3) . '/elements/widgets/weather.class.php';

class DashboredWeatherSaveProcessor extends DashboredSaveProcessor {
    protected $widgetClass = WeatherDashboardWidget::class;
    protected $prefix = 'dashbored.weather.';
    protected $area = 'weather';
}
return 'DashboredWeatherSaveProcessor';