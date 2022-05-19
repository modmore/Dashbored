<?php

use MODX\Revolution\modDashboardWidget;

require_once dirname(__DIR__, 3) . '/elements/widgets/weather.class.php';

class DashboredWeatherSaveProcessor extends modProcessor {

    protected $dashbored;

    /**
     * @return string[]
     */
    public function getLanguageTopics(): array
    {
        return ['dashbored:default'];
    }

    /**
     * @return bool
     */
    public function initialize(): bool
    {
        $corePath = $this->modx->getOption('dashbored.core_path', null,
            $this->modx->getOption('core_path') . 'components/dashbored/');
        $this->dashbored = $this->modx->getService('dashbored', 'Dashbored', $corePath . 'model/dashbored/');

        return true;
    }

    public function process()
    {
        if (!$id = $this->getProperty('id')) {
            return $this->failure('Cannot find widget id.');
        }

        /** @var modDashboardWidget $widget */
        $widget = $this->modx->getObject(modDashboardWidget::class, [
            'id' => $id
        ]);
        if (!$widget) {
            return $this->failure('Cannot find weather widget.');
        }
        
        $properties = [];

        $location = $this->getProperty('location');
        $properties['location'] = $this->getProperty('location')
            ? filter_var($location, FILTER_SANITIZE_STRING)
            : $this->modx->getOption('dashbored.weather.default_city', '', 'amsterdam', true);

        // 'c' or 'f'
        $tempType = $this->getProperty('temp_type');
        $properties['temp_type'] = $tempType 
            ? filter_var($tempType, FILTER_SANITIZE_STRING) : WeatherDashboardWidget::DEFAULT_TEMP_TYPE;

        // 'km' or 'mile'
        $distanceType = $this->getProperty('distance_type');
        $properties['distance_type'] = $distanceType 
            ? filter_var($distanceType, FILTER_SANITIZE_STRING) : WeatherDashboardWidget::DEFAULT_DISTANCE_TYPE;
        
        $bgType = $this->getProperty('background_type');
        $properties['background_type'] = $bgType ? filter_var($bgType, FILTER_SANITIZE_STRING) : 'none';
        
        $widget->set('properties', $properties);
        $widget->save();

        return $this->success('', $widget);
    }
}
return 'DashboredWeatherSaveProcessor';