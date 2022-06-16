<?php
/**
 * Dashboard Widgets
 *
 * @package dashbored
 * @subpackage build
 */

$widgets = [];

$widgets[0]= $modx->newObject('modDashboardWidget');
$widgets[0]->fromArray([
    'name' => 'dashbored.dino_game.name',
    'description' => 'dashbored.dino_game.desc',
    'type' => 'file',
    'size' => 'one-third',
    'content' =>  '[[++core_path]]components/dashbored/elements/widgets/dinosaurgame.class.php',
    'namespace' => 'dashbored',
    'lexicon' => 'dashbored:default',
], '', true, true);

$widgets[1]= $modx->newObject('modDashboardWidget');
$widgets[1]->fromArray([
    'name' => 'dashbored.weather.name',
    'description' => 'dashbored.weather.desc',
    'type' => 'file',
    'size' => 'one-third',
    'content' =>  '[[++core_path]]components/dashbored/elements/widgets/weather.class.php',
    'namespace' => 'dashbored',
    'lexicon' => 'dashbored:default',
], '', true, true);

$widgets[2]= $modx->newObject('modDashboardWidget');
$widgets[2]->fromArray([
    'name' => 'dashbored.quotes.name',
    'description' => 'dashbored.quotes.desc',
    'type' => 'file',
    'size' => 'one-third',
    'content' =>  '[[++core_path]]components/dashbored/elements/widgets/quotes.class.php',
    'namespace' => 'dashbored',
    'lexicon' => 'dashbored:default',
], '', true, true);

$widgets[3]= $modx->newObject('modDashboardWidget');
$widgets[3]->fromArray([
    'name' => 'dashbored.news_feed.name',
    'description' => 'dashbored.news_feed.desc',
    'type' => 'file',
    'size' => 'one-third',
    'content' =>  '[[++core_path]]components/dashbored/elements/widgets/newsfeed.class.php',
    'namespace' => 'dashbored',
    'lexicon' => 'dashbored:default',
], '', true, true);

return $widgets;