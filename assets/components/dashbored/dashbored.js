var Dashbored = function(config) {
    config = config || {};
    Dashbored.superclass.constructor.call(this,config);
};
Ext.extend(Dashbored, Ext.Component, {
    page: {}, window: {}, grid: {}, tree: {}, panel: {}, tabs: {}, combo: {},
    config: {
        connectorUrl: ''
    }
});
Ext.reg('dashbored', Dashbored);
Dashbored = new Dashbored();