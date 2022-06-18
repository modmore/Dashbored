<?php

use MODX\Revolution\modDashboardWidget;
use MODX\Revolution\modUserSetting;

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
        
        if ($score = filter_var($this->getProperty('score'), FILTER_SANITIZE_NUMBER_INT)) {
            if (!$displayScore = $this->getProperty('display_score')) {
                return $this->failure('Score not submitted!');
            }
            
            $props = $widget->get('properties');
            $highScores = $props['high_scores'] ?? [];

            $highScores[] = [
                'score' => $score,
                'display_score' => $displayScore,
                'username' => $this->modx->user->get('username'),
                'display_name' => $this->getDisplayName(),
                'character' => $this->getProperty('character') ?? ''
            ];
            
            $highScores = $this->processHighScores($highScores);
            $properties['high_scores'] = $highScores;

            $widget->set('properties', $properties);
            $widget->save();

            return $this->outputArray($highScores);
        }

        return $this->failure('Score not submitted!');
    }

    /**
     * Retrieves user's display name, if they've set one.
     * @return string
     */
    protected function getDisplayName(): string
    {
        /** @var modUserSetting $setting */
        $setting = $this->modx->getObject(modUserSetting::class, [
            'key' => 'dashbored.dinogame.display_name',
            'user' => $this->modx->user->get('id')
        ]);
        
        if (!$setting) {
            return $this->modx->user->get('username');
        }
        
        return $setting->get('value');
    }

    /**
     * Takes an array of high scores and ensures they're sorted in descending order and limited to the top 10.
     * @param array $highScores
     * @return array
     */
    protected function processHighScores(array $highScores): array
    {
        usort($highScores, function($a, $b) {
            return $b['score'] <=> $a['score'];
        });

        return array_slice($highScores, 0, 10);
    }
}
return 'DashboredDinoGameSubmitHighScoreProcessor';