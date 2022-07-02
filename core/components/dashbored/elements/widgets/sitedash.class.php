<?php

require_once __DIR__ . '/abstract.class.php';

class DashboredSiteDashDashboardWidget extends DashboredAbstractDashboardWidget
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

        $titleBar = $this->getWidgetTitleBar('sitedash');
        $this->widget->set('name', $titleBar);

        $props = [];
        foreach (self::ACCEPTED_FIELDS as $field => $default) {
            $props[$field] = self::getUserSetting($this->modx, 'dashbored.sitedash.' . $field,
                    $this->modx->user->get('id')) ?? $default;
        }

        $this->controller->addHtml(<<<HTML
<style>
    #dashboard-block-{$this->widget->get('id')} {
        background: rgb(63,91,123);
        background: linear-gradient(120deg, rgba(90,114,142,1) 0%, rgba(63,91,123,1) 18%, rgba(35,67,104,1) 54%);
    }
    #dashboard-block-{$this->widget->get('id')} .body {
        box-shadow: inset 0 1px 1px 0 rgb(0 0 0/.2);
    }
    #dashboard-block-{$this->widget->get('id')} .title-wrapper {background: #fff;}
</style>
<script src="{$this->dashbored->config['assets_url']}sitedash/sitedash.js"></script>
<script>
Ext.onReady(function() {
    new DashboredSiteDash('{$this->widget->get('id')}').setup();
});
</script>

HTML
        );

        return <<<HTML
<div class="dashbored-sitedash-mask">
    {$this->getSpinner()}
</div>
<div class="dashbored-bg">
    <div class="db-bg-mask"></div>
</div>
<div class="dashbored-sitedash-header"></div>
<div id="dashbored{$this->widget->get('id')}-sitedash" class="dashbored-sitedash-widget" 
    data-id="{$this->widget->get('id')}"
    data-backgroundtype="{$props['background_type']}" 
    data-backgroundmask="{$props['bg_mask']}" 
>
    <div class="dashbored-sitedash-panel">
        <div class="dashbored-sitedash-top">
            <h3 class="section-title">
                [[%dashbored.sitedash.lighthouse_audit]]
                <span class="dashbored-sitedash-updated-at"></span>
            </h3>
            <div class="dashbored-sitedash-audit"></div>
        </div>
        <div class="dashbored-sitedash-middle">
            <div class="first-col"></div>
            <div class="second-col"></div>
            <div class="third-col"></div>
        </div>
    </div>
</div>
<div class="dashbored-sitedash-footer">
    <span class="sitedash-site-url">{$this->modx->getOption('site_url')}</span>
    <button class="open-sitedash-btn" type="button">[[%dashbored.sitedash.view_in_sitedash]]</button>
</div>
HTML;
    }
}
return 'DashboredSiteDashDashboardWidget';