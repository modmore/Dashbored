<?php

require_once dirname(__DIR__) . '/dashbored/refresh.class.php';
require_once dirname(__DIR__, 3) . '/elements/widgets/newsfeed.class.php';

class DashboredNewsFeedRefreshProcessor extends DashboredRefreshProcessor {

    protected function loadSettingFields()
    {
        foreach (DashboredNewsFeedDashboardWidget::ACCEPTED_FIELDS as $field => $default) {
            $this->fields[$field] = DashboredNewsFeedDashboardWidget::getUserSetting($this->modx,
                    'dashbored.newsfeed.' . $field, $this->modx->user->get('id')) ?? $default;
        }
    }
    
    /**
     * @return array
     */
    protected function getData(): array
    {
        $data = $this->modx->cacheManager->get('newsfeed_data', Dashbored::$cacheOptions);

        if ($this->refresh || !$data) {
            
            $data = [];
            
            // Get feed data
            $feed = new SimplePie();
            $feed->set_feed_url($this->fields['feed_url']);
            // Use Dashbored MODX cache rather than SimplePie's.
            $feed->enable_cache(false);
            $feed->init();
            $feed->handle_content_type();

            foreach ($feed->get_items() as $item) {
                $name = $item->get_author() ? $item->get_author()->get_name() : '';
                $data[] = [
                    'title' => $item->get_title(),
                    'date' => $item->get_date(),
                    'author' => $name,
                    'url' => $item->get_link(),
                    'description' => $item->get_description(),
                    'content' => $item->get_content(),
                ];
            }
            
            $data = filter_var_array($data, FILTER_SANITIZE_STRING) ?? [];
            $data = array_merge($data, $this->fields);

            $this->modx->cacheManager->set('newsfeed_data', $data, 7200, Dashbored::$cacheOptions);
        }

        return $data ?? [];
    }
}
return 'DashboredNewsFeedRefreshProcessor';