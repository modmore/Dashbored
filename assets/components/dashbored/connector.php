<?php
$basePath = dirname(__DIR__, 3);

require_once $basePath . '/config.core.php';
require_once MODX_CORE_PATH . 'config/' . MODX_CONFIG_KEY . '.inc.php';
require_once MODX_CONNECTORS_PATH . 'index.php';

/** @var modX $modx */
$corePath = $modx->getOption('dashbored.core_path', null, $modx->getOption('core_path') . 'components/dashbored/');
$dashbored = $modx->getService('dashbored', 'Dashbored', $corePath . 'model/dashbored/');
$modx->request->handleRequest([
    'processors_path' => $dashbored->config['processors_path']
]);