<?php

require_once dirname(__DIR__, 2) . '/model/dashbored/dashbored.class.php';

abstract class DashboredAbstractDashboardWidget extends modDashboardWidgetInterface
{
    public static $initialized = false;
    
    /**
     * @var Dashbored
     */
    protected $dashbored;
    /**
     * @var mixed
     */
    protected $assetsUrl;

    /**
     * @return void
     */
    public function initialize(): void
    {
        $this->dashbored = new Dashbored($this->modx);

        if (static::$initialized) {
            return;
        }
        static::$initialized = true;

        $this->modx->lexicon->load('dashbored:default');
        $this->assetsUrl = $this->dashbored->config['assets_url'];
        $this->controller->addCss($this->assetsUrl . 'css/mgr.css?v=' . urlencode($this->dashbored->version));

        // Manually load the "dashbored:default" lexicon so that translations can be accessed within the widgets.
        $this->controller->addHtml(<<<HTML
<script>
    Ext.applyIf(MODx.lang, {$this->modx->toJSON($this->modx->lexicon->loadCache('dashbored'))});
</script>
HTML
        );

        $config = $this->modx->toJSON([
            'assetsUrl' => $this->assetsUrl,
            'connectorUrl' => $this->dashbored->config['connector_url'],
            'version' => $this->dashbored->version,
        ]);
        $this->controller->addHtml(<<<HTML
<script>
    Dashbored.config = $config;
</script>
HTML
        );
    }
}
return 'DashboredAbstractDashboardWidget';