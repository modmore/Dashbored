<?php

//require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
use MODX\Revolution\Smarty\modSmarty;


/**
 * Service class for Dashbored.
 *
 * @package dashbored
 */
class Dashbored
{
    /**
     *  A reference to the modX object.
     *
     * @var modX
     */
    public $modx;

    /**
     * @var modSmarty
     */
    public $smarty;

    /**
     * Configuration options loaded from system settings
     *
     * @var array
     */
    public $config = [];

    /**
     * Custom cache options to make sure data is cached to a custom cache partition instead of default.
     *
     * @var array
     */
    public static $cacheOptions = [
        xPDO::OPT_CACHE_KEY => 'dashbored',
    ];

    /**
     * The version string, used for cache busting and should be increased with each release.
     *
     * @var string
     */
    public $version = '1.1.0-pl';

    /**
     * Constructor to load the config as needed.
     *
     * @param modX $modx The modX object
     * @param array $config Optionally additional config properties that override
     * behaviour.
     */
    public function __construct(modX $modx, array $config = [])
    {
        $this->modx = $modx;

        $core = $this->modx->getOption('dashbored.core_path', $config, $this->modx->getOption('core_path') . 'components/dashbored/');
        $assetsUrl = $this->modx->getOption('dashbored.assets_url', $config, $this->modx->getOption('assets_url') . 'components/dashbored/');

        $this->config = array_merge([
            'core_path' => $core,
            'model_path' => $core . 'model/',
            'processors_path' => $core . 'processors/',
            'controllers_path' => $core . 'controllers/',
            'templates_path' => $core . 'templates/',
            'chunks_path' => $core . 'elements/chunks/',
            'assets_url' => $assetsUrl,
            'connector_url' => $assetsUrl . 'connector.php',
        ], $config);


        $this->smarty = new modSmarty($modx, [
            'template_dir' => $this->config['templates_path']
        ]);
        
        if ($this->modx->lexicon) {
            $this->modx->lexicon->load('dashbored:default');
        }
    }
}
