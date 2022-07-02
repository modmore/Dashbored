<?php

require_once __DIR__ . '/abstract.class.php';

class QuotesDashboardWidget extends DashboredAbstractDashboardWidget
{
    // Values are defaults
    public const ACCEPTED_FIELDS = [
        'background_type' => 'none',
        'bg_mask' => '1',
        'bg_image' => '',
        'bg_video' => '',
    ];
    
    public function render(): string
    {
        $this->initialize();

        $titleBar = $this->getWidgetTitleBar('quotes');
        $this->widget->set('name', $titleBar);

        $props = [];
        foreach (self::ACCEPTED_FIELDS as $field => $default) {
            $props[$field] = self::getUserSetting($this->modx, 'dashbored.quotes.' . $field,
                    $this->modx->user->get('id')) ?? $default;
        }
        
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
    new DashboredQuotes('{$this->widget->get('id')}').setup();
});
</script>

HTML
        );

        return <<<HTML
<div class="dashbored-quotes-mask">
    {$this->getSpinner()}
</div>
<div class="dashbored-bg">
    <div class="db-bg-mask"></div>
</div>
<div id="dashbored{$this->widget->get('id')}-quotes" class="dashbored-quotes-widget" 
    data-id="{$this->widget->get('id')}"
    data-backgroundtype="{$props['background_type']}" 
    data-backgroundmask="{$props['bg_mask']}" 
>
    <blockquote class="quote"></blockquote>
</div>
HTML;
    }
}
return 'QuotesDashboardWidget';