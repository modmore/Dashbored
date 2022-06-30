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
}
return 'DashboredSiteDashMonitorRefreshProcessor';