<?php

require_once __DIR__ . '/abstract.class.php';

class QuotesDashboardWidget extends DashboredAbstractDashboardWidget
{
    public function render(): string
    {
        $this->initialize();

        $this->controller->addCss($this->dashbored->config['assets_url'] . 'css/mgr.css');

        $titleBar = $this->getWidgetTitleBar('quotes');
        $this->widget->set('name', $titleBar);
        
        $this->controller->addHtml(<<<HTML
<style>
    #dashboard-block-{$this->widget->get('id')} {
        background: rgb(255,149,121);
        background: linear-gradient(120deg, rgba(255,149,121,1) 0%, rgba(255,128,95,1) 34%, rgba(255,85,41,1) 85%); 
    }
    #dashboard-block-{$this->widget->get('id')} .title-wrapper {background: #fff;}
</style>
<script src="{$this->dashbored->config['assets_url']}quotes/quotes.js"></script>
<script>
Ext.onReady(function() {
    new DashboredQuotes('#dashbored{$this->widget->get('id')}-quotes').setup();
});
</script>

HTML
        );

        return <<<HTML
<div class="dashbored-quotes-mask">
    <svg class="dashbored-spinner" viewBox="0 0 50 50">
      <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
    </svg>
</div>
<div id="dashbored{$this->widget->get('id')}-quotes" data-id="{$this->widget->get('id')}" class="dashbored-quotes-widget">
    <blockquote class="quote"></blockquote>
</div>
HTML;
    }
}
return 'QuotesDashboardWidget';