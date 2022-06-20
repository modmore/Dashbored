<?php

require_once dirname(__DIR__) . '/dashbored/save.class.php';
require_once dirname(__DIR__, 3) . '/elements/widgets/newsfeed.class.php';

class DashboredNewsFeedSaveProcessor extends DashboredSaveProcessor {
    protected $widgetClass = DashboredNewsFeedDashboardWidget::class;
    protected $prefix = 'dashbored.newsfeed.';
    protected $area = 'newsfeed';
}
return 'DashboredNewsFeedSaveProcessor';