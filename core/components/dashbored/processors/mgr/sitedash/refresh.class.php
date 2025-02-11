<?php

require_once dirname(__DIR__) . '/dashbored/sitedash.class.php';
require_once dirname(__DIR__, 3) . '/elements/widgets/sitedash.class.php';

class DashboredSiteDashRefreshProcessor extends DashboredSiteDashAbstractProcessor
{

    protected function loadSettingFields()
    {
        foreach (DashboredSiteDashDashboardWidget::ACCEPTED_FIELDS as $field => $default) {
            $this->fields[$field] = DashboredSiteDashDashboardWidget::getUserSetting(
                $this->modx,
                'dashbored.sitedash.' . $field,
                $this->modx->user->get('id')
            ) ?? $default;
        }
        foreach (DashboredSiteDashDashboardWidget::SYSTEM_SETTINGS as $field => $default) {
            $this->fields[$field] = DashboredSiteDashDashboardWidget::getSystemSetting(
                $this->modx,
                'dashbored.sitedash.' . $field,
                $default
            );
        }
    }

    /**
     * @return array
     */
    protected function getData(): array
    {
        $data = $this->modx->cacheManager->get('sitedash_data', Dashbored::$cacheOptions);

        if ($this->refresh || !$data) {
            $data = $this->getSiteDashData();
            $data = $this->filterData($data);
            $this->modx->cacheManager->set('sitedash_data', $data, 7200, Dashbored::$cacheOptions);
        }

        return $data ?? [];
    }

    /**
     * If parts of the sitedash widget are hidden via system/user settings, then remove that data from the output
     * @param array $data
     * @return array
     */
    protected function filterData(array $data): array
    {
        if (!$this->modx->getOption('dashbored.sitedash.display_lighthouse')) {
            unset($data['lighthouse']);
        }

        if (!$this->modx->getOption('dashbored.sitedash.display_config')) {
            unset($data['config']);
        }

        if (!$this->modx->getOption('dashbored.sitedash.display_security')) {
            unset($data['security']);
        }

        if (!$this->modx->getOption('dashbored.sitedash.display_checks')) {
            unset($data['checks']);
        }

        return $data;
    }
}
return 'DashboredSiteDashRefreshProcessor';
