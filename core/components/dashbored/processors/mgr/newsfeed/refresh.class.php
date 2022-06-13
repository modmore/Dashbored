<?php

require_once dirname(__DIR__, 3) . '/elements/widgets/newsfeed.class.php';

class DashboredNewsFeedRefreshProcessor extends modProcessor {

    protected $dashbored;
    protected $widget;
    protected $refresh;
    protected $fields = [];
    

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
        $data = $this->modx->cacheManager->get('newsfeed_data', Dashbored::$cacheOptions);

        if ($this->refresh || !$data) {
            
            // Get feed data
            
            
            $data = json_decode($data, true);
            $data = filter_var_array($data, FILTER_SANITIZE_STRING) ?? [];
            $data = array_merge($data, $this->fields);

            $this->modx->cacheManager->set('newsfeed_data', $data, 7200, Dashbored::$cacheOptions);
        }

        return $data ?? [];
    }
}
return 'DashboredNewsFeedRefreshProcessor';