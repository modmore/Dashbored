<?php

require_once __DIR__ . '/refresh.class.php';
require_once dirname(__DIR__, 3) . '/elements/widgets/sitedash.class.php';

abstract class DashboredSiteDashAbstractProcessor extends DashboredRefreshProcessor {

    /**
     * @return array
     */
    protected function getSiteDashData(): array
    {
        $data = [];
        $siteKey = $this->modx->getOption('dashbored.sitedash.site_integration_key');
        if (!empty($siteKey)) {
            $c = curl_init();
            curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($c, CURLOPT_URL, "https://sitedash.app/api/integrations/{$siteKey}");
            $data = curl_exec($c);
            curl_close($c);

            $data = json_decode($data, true) ?? [];
            if (isset($data['data'])) {
                $data = filter_var_array($data['data'], FILTER_SANITIZE_STRING) ?? [];
            }
            unset($data['extended']);
        }
        else {
            $data['missing_key'] = true;
        }

        return array_merge($data, $this->fields);
    }
    
    /**
     * Get some test data to populate the widget
     * @return string
     */
    protected function getDummyData(): string
    {
        return '{
        "account_valid": true,
        "site_url": "example.com",
        "sitedash_link": "https://sitedash.app/dashboard/site/",
        "updated_at": 1656142038,
        "lighthouse": {
            "scores": {
                "average": 75,
                "performance": 65,
                "accessibility": 71,
                "best_practice": 80,
                "seo": 100,
                "pwa": 40
            },
            "updated_at": 1656142038
        },
        "config": {
            "modx_version": "3.0.1-pl",
            "modx_upgrade_available": "3.0.2-pl",
            "php_version": "7.4.3",
            "web_server": "nginx",
            "web_server_version": "1.18.0",
            "database_type": "mysql",
            "database_version": "8.10.4",
            "ip": "123.123.123.123"
        },
        "security": {
            "ssl_cert": "valid",
            "tls_version": 1.3,
            "core_protected": true,
            "renamed_manager": true,
            "setup_removed": false
        },
        "checks": {
            "checks_passed": 20,
            "checks_total": 21,
            "error_log": "266.93 KB",
            "disk_used": "14.79 GB",
            "extras_installed": 13,
            "updates_available": 4
        },
        "extended": {
            "updated_at": 1656142038,
            "dates": [
                "2022-06-18",
                "2022-06-19",
                "2022-06-20",
                "2022-06-21",
                "2022-06-22",
                "2022-06-23",
                "2022-06-24"
            ],
            "uptime": [
                100.0,
                98.0,
                70.0,
                100.0,
                95.0,
                100.0,
                100.0
            ],
            "response_time": [
                788,
                1000,
                950,
                600,
                800,
                1200,
                700
            ],
            "cpu": [
                5.0,
                7.0,
                0.5,
                1.1,
                3.0,
                6.6,
                22.0
            ],
            "memory": [
                66.0,
                80.0,
                77.5,
                90.1,
                95.0,
                50.6,
                55.0
            ]
        }
    }';

    }
}
return 'DashboredSiteDashAbstractProcessor';
