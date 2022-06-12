Dashbored.Settings = function(config) {
    config = config || {};
    this.bgOpacity = config.bgOpacity || 0;
    this.bgRendered = false;
    var win = this;
    Ext.applyIf(config,{
        url: Dashbored.config.connectorUrl,
        layout: 'form',
        autoHeight: true,
        allowDrop: false,
        fileUpload: true,
        width: 600,
        bwrapCssClass: 'x-window-with-tabs',
        fields: [{
            xtype: 'hidden',
            name: 'id'
        },{
            xtype: 'modx-tabs',
            itemId: 'settings-tabs',
            deferRender: false,
            defaults: {
                layout: 'form'
            },
            items: [
                this.getSettingsTab(win),
                this.getBackgroundTab(win),
                this.getAboutTab(win)
            ]
        }]
    });
    Dashbored.Settings.superclass.constructor.call(this, config);
};
Ext.extend(Dashbored.Settings, MODx.Window, {
    updateOpacity: function(win) {
        document.querySelectorAll('.db-settings-bg-mask').forEach(function(mask) {
            mask.style.backgroundColor = Dashbored.getBackgroundStyle(win.bgOpacity);
        })
    },
    
    getBackgroundTab: function(win) {
        return {
            title: 'Background',
            listeners: {
                'activate': {fn: function(tab) {
                        var group = tab.find('itemId', 'background_type')[0];
                        group.setValue(this.record.background_type);

                        var radios = group.items.items;
                        radios.forEach(function(radio) {
                            if (radio.checked) {
                                win.switchBackgroundTab(radio);
                            }
                        });

                        if (win.bgRendered === false) {
                            win.getBackgroundPanels().forEach(function (panel) {
                                // Render any saved images
                                if (panel.itemId === 'image' && panel.body) {
                                    let url = win.fp.find('name', 'bg_image')[0].getValue();
                                    if (url) {
                                        win.setImage(panel, url);
                                    }
                                }
                                // Render any saved videos
                                if (panel.itemId === 'video' && panel.body) {
                                    let url = win.fp.find('name', 'bg_video')[0].getValue();
                                    if (url) {
                                        win.setVideo(panel, url);
                                    }
                                }
                            });

                            // Set flag so backgrounds are only rendered once
                            win.bgRendered = true;
                        }
                    }, scope: this}
            },
            items: [{
                xtype: 'hidden',
                name: 'bg_image'
            },{
                xtype: 'hidden',
                name: 'bg_video'
            },{
                xtype: 'radiogroup',
                fieldLabel: 'Background Type',
                cls: 'db-bg-type',
                itemId: 'background_type',
                items: [{
                    boxLabel: 'None',
                    name: 'background_type',
                    inputValue: 'none',
                    itemId: 'none',
                    checked: true,
                    listeners: {
                        check: {fn: this.switchBackgroundTab, scope: this}
                    }
                },{
                    boxLabel: 'Image',
                    name: 'background_type',
                    inputValue: 'image',
                    listeners: {
                        check: {fn: this.switchBackgroundTab, scope: this}
                    }
                },{
                    boxLabel: 'Video',
                    name: 'background_type',
                    inputValue: 'video',
                    listeners: {
                        check: {fn: this.switchBackgroundTab, scope: this}
                    }
                }]
            },{
                html: this.renderBackgroundPanel('none'),
                itemId: 'none',
                type: 'bg-panel',
                hidden: true,
                anchor: '100%'
            },{
                html: this.renderBackgroundPanel('image'),
                itemId: 'image',
                type: 'bg-panel',
                hidden: true,
                anchor: '100%',
                editable: true,
                scope: this
            },{
                html: this.renderBackgroundPanel('video'),
                itemId: 'video',
                type: 'bg-panel',
                hidden: true,
                anchor: '100%',
                editable: true,
                scope: this
            },{
                xtype: 'sliderfield',
                fieldLabel: 'Darken Background',
                itemId: 'bg-mask-slider',
                minValue: 1,
                name: 'bg_mask',
                listeners: {
                    'valid': {fn: function(slider) {
                            win.bgOpacity = slider.getValue();
                            win.updateOpacity(win);
                        }, scope: this},
                }
            }]
        };
    },

    getAboutTab: function(win) {
        return {
            title: 'About',
            items: []
        };
    },
    
    switchBackgroundTab: function(radio) {
        if (!radio.checked) {
            return;
        }

        let that = this;
        this.getBackgroundPanels().forEach(function (panel) {
            if (radio.inputValue === panel.itemId) {
                panel.setVisible(true);
                if (panel.body && panel.editable) {
                    panel.body.on('click', function () {
                        that.selectFileFromBrowser(panel, radio.inputValue);
                    });
                }
            } else {
                panel.setVisible(false);
                if (panel.body) {
                    panel.body.removeAllListeners();
                }
            }
        });

    },

    getBackgroundPanels: function() {
        return this.find('itemId', 'settings-tabs')[0].getActiveTab().find('type', 'bg-panel');
    },

    renderBackgroundPanel: function(name) {
        if (name === 'none') {
            return `<div class="db-settings-bg db-settings-bg-${this.widgetType} none">
                    <div class="db-bg-content">
                        <span class="db-bg-label">No background</span>
                        <div class="db-settings-bg-mask" style="background: rgba(0, 0, 0, ${this.bgOpacity});"></div>
                    </div>
                </div>`;
        }

        return `<div class="db-settings-bg db-settings-bg-${this.widgetType} ${name}">
                    <div id="db-${name}-content-${this.getId()}" class="db-bg-content">
                        <div class="db-bg-label">${_('dashbored.' + name)}</div>
                        <div class="db-settings-bg-mask"></div>
                    </div>
                    <div class="db-overlay">
                        <span class="db-select-btn">${_('dashbored.select_' + name)}</span>
                    </div>
                </div>`;
    },

    selectFileFromBrowser: function(panel, type) {
        const videoTypes = ['webm', 'mp4', 'mkv'],
            imageTypes = ['png', 'gif', 'jpg', 'jpeg', 'svg', 'webp'];

        let browser = MODx.load({
            xtype: 'modx-browser',
            id: Ext.id(),
            multiple: true,
            listeners: {
                select: {fn: function(file) {
                        if (imageTypes.includes(file.ext) && type === 'image') {
                            this.setImage(panel, file.image);
                            this.fp.find('name', 'bg_image')[0].setValue(file.image);
                        }
                        else if (videoTypes.includes(file.ext) && type === 'video') {
                            this.setVideo(panel, '/' + file.relativeUrl);
                            this.fp.find('name', 'bg_video')[0].setValue('/' + file.relativeUrl);
                        }
                        else {
                            MODx.msg.alert('Invalid File Type', 'Invalid file type!');
                        }
                    }, scope: this}
            },
            allowedFileTypes: type === 'video' ? videoTypes.join(',') : imageTypes.join(','),
            hideFiles: true,
            source: MODx.config.default_media_source,
            openTo: '/',
            root: '/'
        });
        browser.show();
    },

    setImage: function(panel, url) {
        let el = panel.getEl().down('#db-image-content-' + this.getId()),
            img = document.createElement('img');
        img.classList.add('db-bg-img');
        img.src = Ext.util.Format.htmlEncode(url);
        el.appendChild(img);
    },

    setVideo: function(panel, url) {
        let el = panel.getEl().down('#db-video-content-' + this.getId()),
            video = document.createElement('video');
        video.classList.add('db-bg-video');
        video.src = url;
        video.setAttribute('autoplay', 'true');
        video.setAttribute('loop', 'true');
        el.appendChild(video);
    }
});
Ext.reg('dashbored-settings', Dashbored.Settings);