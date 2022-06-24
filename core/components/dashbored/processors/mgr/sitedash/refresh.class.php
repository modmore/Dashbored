<?php

require_once dirname(__DIR__) . '/dashbored/refresh.class.php';
require_once dirname(__DIR__, 3) . '/elements/widgets/sitedash.class.php';

class DashboredSiteDashRefreshProcessor extends DashboredRefreshProcessor {

    protected function loadSettingFields()
    {
        foreach (DashboredSiteDashDashboardWidget::ACCEPTED_FIELDS as $field => $default) {
            $this->fields[$field] = DashboredSiteDashDashboardWidget::getUserSetting($this->modx,
                    'dashbored.sitedash.' . $field, $this->modx->user->get('id')) ?? $default;
        }
    }

    /**
     * @return array
     */
    protected function getData(): array
    {
        $data = $this->modx->cacheManager->get('sitedash_data', Dashbored::$cacheOptions);

        if ($this->refresh || !$data) {

            $data = [];
            

            $data = filter_var_array($data, FILTER_SANITIZE_STRING) ?? [];
            $data = array_merge($data, $this->fields);

            $this->modx->cacheManager->set('sitedash_data', $data, 7200, Dashbored::$cacheOptions);
        }

        return $data ?? [];
    }
}
return 'DashboredSiteDashRefreshProcessor';