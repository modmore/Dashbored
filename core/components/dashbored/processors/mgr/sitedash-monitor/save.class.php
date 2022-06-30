<?php

require_once dirname(__DIR__) . '/dashbored/save.class.php';
require_once dirname(__DIR__, 3) . '/elements/widgets/sitedashmonitor.class.php';

class DashboredSiteDashMonitorSaveProcessor extends DashboredSaveProcessor {
    protected $widgetClass = DashboredSiteDashMonitorDashboardWidget::class;
    protected $prefix = 'dashbored.sitedash_monitor.';
    protected $area = 'sitedash';
}
return 'DashboredSiteDashMonitorSaveProcessor';