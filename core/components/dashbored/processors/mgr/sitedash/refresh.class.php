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

    /**
     * @return array
     */
    protected function getData(): array
    {
        $data = $this->modx->cacheManager->get('sitedash_data', Dashbored::$cacheOptions);

        if ($this->refresh || !$data) {
//            $c = curl_init();
//            curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
//            
//            $siteKey = $this->modx->getOption('dashbored.sitedash.site_key');
//            curl_setopt($c, CURLOPT_URL, "https://sitedash.app/integrations/{$siteKey}.json");
//
//            $data = [];
//            $data = curl_exec($c);
//            curl_close($c);

            // TODO: Remove when live data available
            $data = $this->getDummyData();

            $data = json_decode($data, true);

            $data = filter_var_array($data, FILTER_SANITIZE_STRING) ?? [];
            $data = array_merge($data, $this->fields);

            $this->modx->cacheManager->set('sitedash_data', $data, 7200, Dashbored::$cacheOptions);
        }

        return $data ?? [];
    }
}
return 'DashboredSiteDashRefreshProcessor';