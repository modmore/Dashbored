<?php

use MODX\Revolution\modDashboardWidget;

require_once dirname(__DIR__, 3) . '/elements/widgets/weather.class.php';

class DashboredWeatherRefreshProcessor extends modProcessor {
    
    protected $dashbored;
    protected $widget;
    protected $location;
    protected $tempType;
    protected $distanceType;
    protected $refresh;
    
    const ENDPOINT = 'https://weatherdbi.herokuapp.com/data/weather/';

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
        
        $this->widget = $this->modx->getObject(modDashboardWidget::class, [
            'id' => $this->getProperty('id')
        ]);
        if (!$this->widget) {
            return false;
        }
        
        $props = $this->widget->get('properties');
        $this->location = $props['location'] ?? WeatherDashboardWidget::DEFAULT_LOCATION;
        $this->tempType = $props['temp_type'] ?? WeatherDashboardWidget::DEFAULT_TEMP_TYPE;
        $this->distanceType = $props['distance_type'] ?? WeatherDashboardWidget::DEFAULT_DISTANCE_TYPE;

        $this->refresh = (bool)$this->getProperty('refresh');
        
        return true;
    }

    /**
     * @return string
     */
    public function process(): string
    {
        return $this->outputArray($this->getData());
    }

    /**
     * @return array
     */
    protected function getData(): array
    {
        $data = $this->modx->cacheManager->get('weather_data', Dashbored::$cacheOptions);
        
        if ($this->refresh || !$data) {
            $c = curl_init();
            curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($c, CURLOPT_URL, self::ENDPOINT . $this->location);
            $data = curl_exec($c);
            curl_close($c);

            $data = json_decode($data, true);

            $data['current'] = $data['currentConditions'];
            unset($data['currentConditions']);
            $data['outlook'] = $data['next_days'];
            unset($data['next_days']);
            
            $data['current']['temp'] = $data['current']['temp'][$this->tempType];
            $data['current']['temp_type'] = $this->tempType;

            $data['current']['wind'] = $data['current']['wind'][$this->distanceType];
            $data['current']['distance_type'] = $this->distanceType;

            // Remove the first day as it's the same as the current day.
            array_shift($data['outlook']);
            
            foreach ($data['outlook'] as $k => $day) {
                $data['outlook'][$k]['max_temp'] = $data['outlook'][$k]['max_temp'][$this->tempType];
            }
            
            $data = filter_var_array($data, FILTER_SANITIZE_STRING) ?? [];
            
            $this->modx->cacheManager->set('weather_data', $data, 7200, Dashbored::$cacheOptions);
        }
        
        return $data ?? [];
    }
}
return 'DashboredWeatherRefreshProcessor';