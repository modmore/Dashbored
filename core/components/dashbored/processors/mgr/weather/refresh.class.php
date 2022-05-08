<?php

class DashboredWeatherRefreshProcessor extends modProcessor {
    
    protected $dashbored;
    protected $location;
    protected $tempType;
    protected $windType;
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
        
        $location = $this->getProperty('location');
        $this->location = $location 
            ? filter_var($location, FILTER_SANITIZE_STRING) 
            : $this->modx->getOption('dashbored.weather.default_city', '', 'amsterdam', true);

        // 'c' or 'f'
        $tempType = $this->getProperty('temp_type');
        $this->tempType = $tempType
            ? filter_var($tempType, FILTER_SANITIZE_STRING)
            : $this->modx->getOption('dashbored.weather.default_temperature_type', '', 'c', true);

        // 'km' or 'mile'
        $windType = $this->getProperty('wind_type');
        $this->windType = $windType
            ? filter_var($windType, FILTER_SANITIZE_STRING)
            : $this->modx->getOption('dashbored.weather.default_wind_type', '', 'km', true);

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
            unset($data['contact_author']);

            $data['currentConditions']['temp'] = $data['currentConditions']['temp'][$this->tempType];
            $data['currentConditions']['temp_type'] = $this->tempType;

            $data['currentConditions']['wind'] = $data['currentConditions']['wind'][$this->windType];
            $data['currentConditions']['temp_type'] = $this->tempType;

            // Remove the first day as it's the same as the current day.
            array_shift($data['next_days']);
            
            foreach ($data['next_days'] as $k => $day) {
                $data['next_days'][$k]['max_temp'] = $data['next_days'][$k]['max_temp'][$this->tempType];
            }
            
            $data = filter_var_array($data, FILTER_SANITIZE_STRING) ?? [];
            
            $this->modx->cacheManager->set('weather_data', $data, 7200, Dashbored::$cacheOptions);
        }
        
        return $data ?? [];
    }
}
return 'DashboredWeatherRefreshProcessor';