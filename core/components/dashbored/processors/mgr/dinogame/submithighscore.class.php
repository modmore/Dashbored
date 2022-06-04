<?php

use MODX\Revolution\modDashboardWidget;

require_once dirname(__DIR__, 3) . '/elements/widgets/dinosaurgame.class.php';

class DashboredDinoGameSubmitHighScoreProcessor extends modProcessor
{

    protected $dashbored;

    /**
     * @return string[]
     */
    public function getLanguageTopics(): array
    {
        return ['dashbored:default'];
    }
    
    public function process() 
    {
        if (!$id = $this->getProperty('id')) {
            return $this->failure('Cannot find widget id.');
        }

        /** @var modDashboardWidget $widget */
        $widget = $this->modx->getObject(modDashboardWidget::class, [
            'id' => $id
        ]);
        if (!$widget) {
            return $this->failure('Cannot find dino game widget.');
        }

        $properties = [];
        
        if ($highScore = $this->getProperty('score')) {
            $properties['high_score'] = filter_var($highScore, FILTER_SANITIZE_NUMBER_INT);
        }

        $widget->set('properties', $properties);
        $widget->save();

        return $this->success('High score saved.');
    }
}
return 'DashboredDinoGameSubmitHighScoreProcessor';