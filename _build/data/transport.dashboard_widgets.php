<?php
/**
 * Dashbored Dashboard Widgets ;)
 *
 * @package dashbored
 * @subpackage build
 * 
 * @var modX $modx
 * @var string $componentPath
 *
 */

$widgets = [];

// Use different base paths if we're bootstrapping rather than building.
if (isset($componentPath)) {
    $basePath = $componentPath . '/core/';
}
else {
    $basePath = '[[++core_path]]';
}

$widgets[0]= $modx->newObject('modDashboardWidget');
$widgets[0]->fromArray([
    'name' => 'dashbored.dino_game.menu_name',
    'description' => 'dashbored.dino_game.desc',
    'type' => 'file',
    'size' => 'one-third',
    'content' => $basePath . 'components/dashbored/elements/widgets/dinosaurgame.class.php',
    'namespace' => 'dashbored',
    'lexicon' => 'dashbored:default',
], '', true, true);

$widgets[1]= $modx->newObject('modDashboardWidget');
$widgets[1]->fromArray([
    'name' => 'dashbored.weather.menu_name',
    'description' => 'dashbored.weather.desc',
    'type' => 'file',
    'size' => 'one-third',
    'content' =>  $basePath . 'components/dashbored/elements/widgets/weather.class.php',
    'namespace' => 'dashbored',
    'lexicon' => 'dashbored:default',
], '', true, true);

$widgets[2]= $modx->newObject('modDashboardWidget');
$widgets[2]->fromArray([
    'name' => 'dashbored.quotes.menu_name',
    'description' => 'dashbored.quotes.desc',
    'type' => 'file',
    'size' => 'one-third',
    'content' =>  $basePath . 'core/components/dashbored/elements/widgets/quotes.class.php',
    'namespace' => 'dashbored',
    'lexicon' => 'dashbored:default',
], '', true, true);

$widgets[3]= $modx->newObject('modDashboardWidget');
$widgets[3]->fromArray([
    'name' => 'dashbored.news_feed.menu_name',
    'description' => 'dashbored.news_feed.desc',
    'type' => 'file',
    'size' => 'one-third',
    'content' =>  $basePath . 'components/dashbored/elements/widgets/newsfeed.class.php',
    'namespace' => 'dashbored',
    'lexicon' => 'dashbored:default',
], '', true, true);

$widgets[4]= $modx->newObject('modDashboardWidget');
$widgets[4]->fromArray([
    'name' => 'dashbored.sitedash.menu_name',
    'description' => 'dashbored.sitedash.desc',
    'type' => 'file',
    'size' => 'one-third',
    'content' =>  $basePath . 'components/dashbored/elements/widgets/sitedash.class.php',
    'namespace' => 'dashbored',
    'lexicon' => 'dashbored:default',
], '', true, true);

$widgets[5]= $modx->newObject('modDashboardWidget');
$widgets[5]->fromArray([
    'name' => 'dashbored.sitedash_monitor.menu_name',
    'description' => 'dashbored.sitedash_monitor.desc',
    'type' => 'file',
    'size' => 'one-third',
    'content' =>  $basePath . 'components/dashbored/elements/widgets/sitedashmonitor.class.php',
    'namespace' => 'dashbored',
    'lexicon' => 'dashbored:default',
], '', true, true);

return $widgets;