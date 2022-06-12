var Dashbored = function(config) {
    config = config || {};
    Dashbored.superclass.constructor.call(this,config);
};
Ext.extend(Dashbored, Ext.Component, {
    page: {}, window: {}, grid: {}, tree: {}, panel: {}, tabs: {}, combo: {},
    config: {
        connectorUrl: ''
    },
});
Ext.reg('dashbored', Dashbored);
Dashbored = new Dashbored();

Dashbored.getBackgroundStyle = function(bgOpacity) {
    bgOpacity = parseInt(bgOpacity);
    if (bgOpacity < 10 && bgOpacity > 0) {
        bgOpacity = '.0' + bgOpacity;
    }
    else if (bgOpacity !== 0 && bgOpacity !== 100) {
        bgOpacity = '.' + bgOpacity;
    }
    return 'rgba(0,0,0,' + bgOpacity + ')';
}
