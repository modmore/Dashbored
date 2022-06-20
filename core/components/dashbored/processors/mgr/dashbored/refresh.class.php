<?php

abstract class DashboredRefreshProcessor extends modProcessor {

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

        $this->loadSettingFields();

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
     * Load fields from modUserSetting into $this->fields
     */
    abstract protected function loadSettingFields();


    /**
     * @return array
     */
    abstract protected function getData(): array;
}
return 'DashboredRefreshProcessor';