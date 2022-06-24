<?php

require_once __DIR__ . '/abstract.class.php';

class DashboredSiteDashDashboardWidget extends DashboredAbstractDashboardWidget
{
    // Values are defaults
    public const ACCEPTED_FIELDS = [];

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
    <svg class="dashbored-spinner" viewBox="0 0 50 50">
      <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
    </svg>
</div>
<div class="dashbored-bg">
    <div class="db-bg-mask"></div>
</div>
<div class="dashbored-sitedash-header"></div>
<div id="dashbored{$this->widget->get('id')}-sitedash" class="dashbored-sitedash-widget" 
    data-id="{$this->widget->get('id')}"
>
    <div class="dashbored-sitedash-panel">
        <div class="dashbored-sitedash-top">
            <h3 class="section-title">Lighthouse Audit</h3>
            <div class="dashbored-sitedash-audit">
                <div class="audit-average">
                    <div class="audit-metric">
                        <div class="audit-score"><span>75</span></div>
                        <svg class="audit-metric-circle" viewBox="0 0 36 36">
                            <path d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ffe168" stroke-width="3" stroke-dasharray="75, 100">
                            </path>
                        </svg>
                    </div>
                    <div class="audit-metric-name">Average</div>
                </div>
                <div class="audit-performance">
                    <div class="audit-metric">
                        <div class="audit-score"><span>65</span></div>
                        <svg class="audit-metric-circle" viewBox="0 0 36 36">
                            <path d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ffe168" stroke-width="3" stroke-dasharray="65, 100">
                            </path>
                        </svg>
                    </div>
                    <div class="audit-metric-name">Performance</div>
                </div>
                <div class="audit-accesibility">
                    <div class="audit-metric">
                        <div class="audit-score"><span>71</span></div>
                        <svg class="audit-metric-circle" viewBox="0 0 36 36">
                            <path d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ffe168" stroke-width="3" stroke-dasharray="71, 100">
                            </path>
                        </svg>
                    </div>
                    <div class="audit-metric-name">Accessibility</div>
                </div>
                <div class="audit-bestpractices">
                    <div class="audit-metric">
                        <div class="audit-score"><span>80</span></div>
                        <svg class="audit-metric-circle" viewBox="0 0 36 36">
                            <path d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ffe168" stroke-width="3" stroke-dasharray="80, 100">
                            </path>
                        </svg>
                    </div>
                    <div class="audit-metric-name">Best Practice</div>
                </div>
                <div class="audit-seo">
                    <div class="audit-metric">
                        <div class="audit-score"><span>100</span></div>
                        <svg class="audit-metric-circle" viewBox="0 0 36 36">
                            <path d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ffe168" stroke-width="3" stroke-dasharray="100, 100">
                            </path>
                        </svg>
                    </div>
                    <div class="audit-metric-name">SEO</div>
                </div>
                <div class="audit-pwa">
                    <div class="audit-metric">
                        <div class="audit-score"><span>40</span></div>
                        <svg class="audit-metric-circle" viewBox="0 0 36 36">
                            <path d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ffe168" stroke-width="3" stroke-dasharray="40, 100">
                            </path>
                        </svg>
                    </div>
                    <div class="audit-metric-name">PWA</div>
                </div>
            </div>
        </div>
        <div class="dashbored-sitedash-middle">
            <div class="first-col">
                <h3 class="section-title">Config</h3>
                <div><span class="tag">MODX</span> <div class="dots"></div> 3.0.1-pl</div>
                <div><span class="tag">PHP</span> <div class="dots"></div> 7.4.3</div>
                <div><span class="tag">Nginx</span> <div class="dots"></div> 1.18.0</div>
                <div><span class="tag">MySQL</span> <div class="dots"></div> 8.10.4</div>
                <div><span class="tag">IP</span> <div class="dots"></div> 178.128.112.153</div>
            </div>
            <div class="second-col">
                <h3 class="section-title">Security</h3>
                <div><span class="tag">SSL cert</span> <div class="dots"></div> Valid </div>
                <div><span class="tag">SSL version</span> <div class="dots"></div> 3</div>
                <div><span class="tag">TLS version</span> <div class="dots"></div> 1.3</div>
                <div><span class="tag">Core protected</span> <div class="dots"></div> <i class="icon icon-check"></i></div>
                <div><span class="tag">Renamed manager</span> <div class="dots"></div> <i class="icon icon-check"></i></div>
            </div>
            <div class="third-col">
                <h3 class="section-title">Checks</h3>
                <div><span class="tag">Checks passed</span> <div class="dots"></div> 20/21</div>
                <div><span class="tag">Error log</span> <div class="dots"></div> 266.93 KB</div>
                <div><span class="tag">Disk used</span> <div class="dots"></div> 14.79 GB</div>
                <div><span class="tag">Extras installed</span> <div class="dots"></div> 13</div>
                <div><span class="tag">Updates available</span> <div class="dots"></div> 4</div>
            </div>
        </div>
        <div class="dashbored-sitedash-bottom">
            
        </div>
    </div>
</div>
<div class="dashbored-sitedash-footer">
    <span class="sitedash-site-url">{$this->modx->getOption('site_url')}</span>
    <button class="open-sitedash-btn" type="button">View in SiteDash</button>
</div>
HTML;
    }
}
return 'DashboredSiteDashDashboardWidget';