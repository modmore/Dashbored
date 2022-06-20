<?php

require_once dirname(__DIR__) . '/dashbored/refresh.class.php';
require_once dirname(__DIR__, 3) . '/elements/widgets/quotes.class.php';

class DashboredQuotesRefreshProcessor extends DashboredRefreshProcessor {
    
    const ENDPOINT = 'https://zenquotes.io/api/quotes';

    protected function loadSettingFields()
    {
        foreach (QuotesDashboardWidget::ACCEPTED_FIELDS as $field => $default) {
            $this->fields[$field] = QuotesDashboardWidget::getUserSetting($this->modx,
                    'dashbored.quotes.' . $field, $this->modx->user->get('id')) ?? $default;
        }
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