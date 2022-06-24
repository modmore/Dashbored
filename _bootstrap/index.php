<?php

use MODX\Revolution\modDashboardWidget;

if (!file_exists(dirname(__DIR__).'/config.core.php')) {
    die('ERROR: missing ' . dirname(__DIR__).'/config.core.php file defining the MODX core path.');
}

echo "<pre>";
/* Boot up MODX */
echo "Loading modX...\n";
require_once dirname(dirname(__FILE__)).'/config.core.php';
require_once MODX_CORE_PATH.'model/modx/modx.class.php';
$modx = new modX();
echo "Initializing manager...\n";
$modx->initialize('mgr');
$modx->getService('error','error.modError', '', '');

$componentPath = dirname(dirname(__FILE__));

$dashbored = $modx->getService('dashbored','Dashbored', $componentPath.'/core/components/dashbored/model/dashbored/', array(
    'dashbored.core_path' => $componentPath.'/core/components/dashbored/',
));

/* Namespace */
if (!createObject('modNamespace', [
    'name' => 'dashbored',
    'path' => $componentPath.'/core/components/dashbored/',
    'assets_path' => $componentPath.'/assets/components/dashbored/',
],'name', false)) {
    echo "Error creating namespace dashbored.\n";
}

/* Path settings */
if (!createObject('modSystemSetting', [
    'key' => 'dashbored.core_path',
    'value' => $componentPath.'/core/components/dashbored/',
    'xtype' => 'textfield',
    'namespace' => 'dashbored',
    'area' => 'Paths',
    'editedon' => time(),
], 'key', false)) {
    echo "Error creating dashbored.core_path setting.\n";
}

if (!createObject('modSystemSetting', [
    'key' => 'dashbored.assets_path',
    'value' => $componentPath.'/assets/components/dashbored/',
    'xtype' => 'textfield',
    'namespace' => 'dashbored',
    'area' => 'Paths',
    'editedon' => time(),
], 'key', false)) {
    echo "Error creating dashbored.assets_path setting.\n";
}

/* Fetch assets url */
$url = 'http';
if (isset($_SERVER['HTTPS']) && ($_SERVER['HTTPS'] == 'on')) {
    $url .= 's';
}
$url .= '://'.$_SERVER["SERVER_NAME"];
if ($_SERVER['SERVER_PORT'] != '80') {
    $url .= ':'.$_SERVER['SERVER_PORT'];
}
$requestUri = $_SERVER['REQUEST_URI'];
$bootstrapPos = strpos($requestUri, '_bootstrap/');
$requestUri = rtrim(substr($requestUri, 0, $bootstrapPos), '/').'/';
$assetsUrl = "{$url}{$requestUri}assets/components/dashbored/";

if (!createObject('modSystemSetting', [
    'key' => 'dashbored.assets_url',
    'value' => $assetsUrl,
    'xtype' => 'textfield',
    'namespace' => 'dashbored',
    'area' => 'Paths',
    'editedon' => time(),
], 'key', false)) {
    echo "Error creating dashbored.assets_url setting.\n";
}
// Widgets
$widgets = include $componentPath . '/_build/data/transport.dashboard_widgets.php';
if (empty($widgets)) $modx->log(modX::LOG_LEVEL_ERROR,'Could not create widgets.');
foreach ($widgets as $key => $obj) {
    /** @var modDashboardWidget $obj */
    if (!createObject(modDashboardWidget::class, $obj->toArray(), 'name', false)) {
        echo "Error creating ".$obj->get('name')." widget.\n";
    }
}

echo "Done.";


/**
 * Creates an object.
 *
 * @param string $className
 * @param array $data
 * @param string $primaryField
 * @param bool $update
 * @return bool
 */
function createObject ($className = '', array $data = array(), $primaryField = '', $update = true) {
    global $modx;
    /* @var xPDOObject $object */
    $object = null;

    /* Attempt to get the existing object */
    if (!empty($primaryField)) {
        if (is_array($primaryField)) {
            $condition = array();
            foreach ($primaryField as $key) {
                $condition[$key] = $data[$key];
            }
        }
        else {
            $condition = array($primaryField => $data[$primaryField]);
        }
        $object = $modx->getObject($className, $condition);
        if ($object instanceof $className) {
            if ($update) {
                $object->fromArray($data);
                return $object->save();
            } else {
                $condition = $modx->toJSON($condition);
                echo "Skipping {$className} {$condition}: already exists.\n";
                return true;
            }
        }
    }

    /* Create new object if it doesn't exist */
    if (!$object) {
        $object = $modx->newObject($className);
        $object->fromArray($data, '', true);
        return $object->save();
    }

    return false;
}

