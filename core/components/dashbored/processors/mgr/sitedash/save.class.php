<?php

require_once dirname(__DIR__) . '/dashbored/save.class.php';
require_once dirname(__DIR__, 3) . '/elements/widgets/sitedash.class.php';

class DashboredSiteDashSaveProcessor extends DashboredSaveProcessor {
    protected $widgetClass = DashboredSiteDashDashboardWidget::class;
    protected $prefix = 'dashbored.sitedash.';
    protected $area = 'sitedash';
}
return 'DashboredSiteDashSaveProcessor';