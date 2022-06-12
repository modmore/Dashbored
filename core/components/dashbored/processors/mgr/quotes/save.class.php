<?php

require_once dirname(__DIR__) . '/dashbored/save.class.php';
require_once dirname(__DIR__, 3) . '/elements/widgets/quotes.class.php';

class DashboredQuotesSaveProcessor extends DashboredSaveProcessor {
    protected $widgetClass = QuotesDashboardWidget::class;
    protected $prefix = 'dashbored.quotes.';
    protected $area = 'quotes';
}
return 'DashboredQuotesSaveProcessor';