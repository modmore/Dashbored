<?php

require_once dirname(__DIR__, 3) . '/elements/widgets/quotes.class.php';

class DashboredQuotesRefreshProcessor extends modProcessor {
    
    protected $dashbored;
    protected $widget;
    protected $refresh;
    protected $fields = [];
    
    const ENDPOINT = 'https://zenquotes.io/api/quotes';

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

        foreach (QuotesDashboardWidget::ACCEPTED_FIELDS as $field => $default) {
            $this->fields[$field] = QuotesDashboardWidget::getUserSetting($this->modx,
                    'dashbored.quotes.' . $field, $this->modx->user->get('id')) ?? $default;
        }
        
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
        $data = $this->modx->cacheManager->get('quotes_data', Dashbored::$cacheOptions);
        
        if ($this->refresh || !$data) {
            $c = curl_init();
            curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($c, CURLOPT_URL, self::ENDPOINT);
            
            $data = [];
            $data = curl_exec($c);
            curl_close($c);
            
            $data = json_decode($data, true);
            $data = filter_var_array($data, FILTER_SANITIZE_STRING) ?? [];
            $data = array_merge($data, $this->fields);
            
            $this->modx->cacheManager->set('quotes_data', $data, 7200, Dashbored::$cacheOptions);
        }
        
        return $data ?? [];
    }
}
return 'DashboredQuotesRefreshProcessor';