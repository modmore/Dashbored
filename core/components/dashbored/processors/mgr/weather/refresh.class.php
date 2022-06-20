<?php

require_once dirname(__DIR__) . '/dashbored/refresh.class.php';
require_once dirname(__DIR__, 3) . '/elements/widgets/weather.class.php';

class DashboredWeatherRefreshProcessor extends DashboredRefreshProcessor {
    
    protected $location;
    
    const ENDPOINT = 'https://weatherdbi.herokuapp.com/data/weather/';

    protected function loadSettingFields()
    {
        foreach (WeatherDashboardWidget::ACCEPTED_FIELDS as $field => $default) {
            $this->fields[$field] = WeatherDashboardWidget::getUserSetting($this->modx,
                    'dashbored.weather.' . $field, $this->modx->user->get('id')) ?? $default;
        }
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
            curl_setopt($c, CURLOPT_URL, self::ENDPOINT . $this->fields['location']);
            $data = curl_exec($c);
            curl_close($c);

            $data = json_decode($data, true);

            $data['current'] = $data['currentConditions'];
            unset($data['currentConditions']);
            $data['outlook'] = $data['next_days'];
            unset($data['next_days']);
            
            $data['current']['temp'] = $data['current']['temp'][$this->fields['temp_type']];
            $data['current']['temp_type'] = $this->fields['temp_type'];

            $data['current']['wind'] = $data['current']['wind'][$this->fields['distance_type']];
            $data['current']['distance_type'] = $this->fields['distance_type'];

            // Remove the first day as it's the same as the current day.
            array_shift($data['outlook']);
            
            foreach ($data['outlook'] as $k => $day) {
                $data['outlook'][$k]['max_temp'] = $data['outlook'][$k]['max_temp'][$this->fields['temp_type']];
            }
            
            $data = filter_var_array($data, FILTER_SANITIZE_STRING) ?? [];
            $data = array_merge($data, $this->fields);
            
            $this->modx->cacheManager->set('weather_data', $data, 7200, Dashbored::$cacheOptions);
        }
        
        return $data ?? [];
    }
}
return 'DashboredWeatherRefreshProcessor';