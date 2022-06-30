<?php

require_once dirname(__DIR__) . '/dashbored/sitedash.class.php';
require_once dirname(__DIR__, 3) . '/elements/widgets/sitedash.class.php';

class DashboredSiteDashRefreshProcessor extends DashboredSiteDashAbstractProcessor {

    protected function loadSettingFields()
    {
        foreach (DashboredSiteDashDashboardWidget::ACCEPTED_FIELDS as $field => $default) {
            $this->fields[$field] = DashboredSiteDashDashboardWidget::getUserSetting($this->modx,
                    'dashbored.sitedash.' . $field, $this->modx->user->get('id')) ?? $default;
        }
    }
}
return 'DashboredSiteDashRefreshProcessor';