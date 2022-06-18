<?php

require_once dirname(__DIR__) . '/dashbored/save.class.php';
require_once dirname(__DIR__, 3) . '/elements/widgets/dinosaurgame.class.php';

class DashboredDinoGameSaveProcessor extends DashboredSaveProcessor {
    protected $widgetClass = DinosaurGameDashboardWidget::class;
    protected $prefix = 'dashbored.dinogame.';
    protected $area = 'dinogame';
}
return 'DashboredDinoGameSaveProcessor';