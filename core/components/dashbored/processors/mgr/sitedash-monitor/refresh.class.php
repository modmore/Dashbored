<?php

require_once dirname(__DIR__) . '/dashbored/sitedash.class.php';
require_once dirname(__DIR__, 3) . '/elements/widgets/sitedashmonitor.class.php';

class DashboredSiteDashMonitorRefreshProcessor extends DashboredSiteDashAbstractProcessor {

    protected function loadSettingFields()
    {
        foreach (DashboredSiteDashMonitorDashboardWidget::ACCEPTED_FIELDS as $field => $default) {
            $this->fields[$field] = DashboredSiteDashMonitorDashboardWidget::getUserSetting($this->modx,
                    'dashbored.sitedash_monitor.' . $field, $this->modx->user->get('id')) ?? $default;
        }
    }

    /**
     * @return array
     */
    protected function getData(): array
    {
        $data = $this->modx->cacheManager->get('sitedash_monitor_data', Dashbored::$cacheOptions);

        if ($this->refresh || !$data) {
            $data = $this->getSiteDashData();
            $this->modx->cacheManager->set('sitedash_monitor_data', $data, 7200, Dashbored::$cacheOptions);
        }

        return $data ?? [];
    }
}
return 'DashboredSiteDashMonitorRefreshProcessor';