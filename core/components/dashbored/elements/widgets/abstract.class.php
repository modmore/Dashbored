<?php

use MODX\Revolution\modX;
use MODX\Revolution\modUserSetting;

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

        $config = $this->modx->toJSON([
            'assetsUrl' => $this->assetsUrl,
            'connectorUrl' => $this->dashbored->config['connector_url'],
            'version' => $this->dashbored->version,
        ]);
        $this->controller->addHtml(<<<HTML
<script src="{$this->assetsUrl}js/dashbored.js"></script>
<script src="{$this->assetsUrl}js/dashbored.window.js"></script>
<script>
Ext.onReady(function() {
    Ext.applyIf(MODx.lang, {$this->modx->toJSON($this->modx->lexicon->loadCache('dashbored'))});
    Dashbored.config = $config;
});
</script>
HTML
        );
    }

    public function getWidgetTitleBar($type): string
    {
        return <<<HTML
<div class="dashbored-widget-title">
    <span>{$this->modx->lexicon("dashbored.{$type}.name")}</span>
    <div class="dashbored-title-btns">
        <div class="dashbored-title-btn-outer">
            <button title="{$this->modx->lexicon('dashbored.configuration')}" class="dashbored-title-btn config {$type}">
                <i class="icon icon-cog"></i>
            </button>
        </div>
        <div class="dashbored-title-btn-outer">
            <button title="{$this->modx->lexicon('dashbored.refresh')}" class="dashbored-title-btn refresh {$type}">
                <i class="icon icon-refresh"></i>
            </button>
        </div>
    </div>
</div>
HTML;
    }

    /**
     * @return string
     */
    public function getSpinner(): string
    {
        return <<<HTML
<svg class="dashbored-spinner" viewBox="0 0 50 50">
  <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
</svg>
HTML;
    }

    /**
     * @param modX $modx
     * @param string $key
     * @param int $userId
     * @return array|bool|float|mixed
     */
    public static function getUserSetting(modX $modx, string $key, int $userId)
    {
        $userSetting = $modx->getObject(modUserSetting::class, [
            'user' => $userId,
            'key' => $key
        ]);
        if (!$userSetting) {
            return null;
        }

        return $userSetting->get('value');
    }

    /**
     * @param modX $modx
     * @param string $key
     * @param mixed $default
     * @return array|bool|float|mixed
     */
    public static function getSystemSetting(modX $modx, string $key, mixed $default): mixed
    {
        return $modx->getOption($key, null, $default, true);
    }
}
return 'DashboredAbstractDashboardWidget';
