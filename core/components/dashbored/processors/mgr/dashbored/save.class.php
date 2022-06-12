<?php

use MODX\Revolution\modUserSetting;

abstract class DashboredSaveProcessor extends modProcessor {

    protected $widgetClass;
    public $errors = [];
    protected $dashbored;
    protected $prefix = '';
    protected $area = '';
    
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
        $output = [];
        foreach ($this->widgetClass::ACCEPTED_FIELDS as $field => $default) {
            $prop = $this->getProperty($field);
            if (filter_var($prop, FILTER_SANITIZE_STRING)) {
                $setting = $this->saveUserSetting($this->prefix . $field, $prop);
                $output[$field] = $setting->get('value');
            }
        }
        return $this->success($output);
    }

    /**
     * @param string $key
     * @param $value
     * @return \xPDO\Om\xPDOObject|null
     */
    protected function saveUserSetting(string $key, $value): ?\xPDO\Om\xPDOObject
    {
        $userId = $this->modx->user->get('id');
        $userSetting = $this->modx->getObject(modUserSetting::class, [
            'user' => $userId,
            'key' => $key
        ]);
        if (!$userSetting) {
            $userSetting = $this->modx->newObject(modUserSetting::class);
            $userSetting->set('user', $userId);
            $userSetting->set('key', $key);
        }
        $userSetting->fromArray([
            'value' => $value,
            'xtype' => 'textfield',
            'namespace' => 'dashbored',
            'area' => $this->area
        ]);
        $userSetting->save();

        return $userSetting;
    }
}
return 'DashboredSaveProcessor';