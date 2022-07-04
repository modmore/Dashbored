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

Dashbored.renderTimestamp = function(timestamp) {
    let date = new Date(parseInt(timestamp) * 1000);
    if (isNaN(date)) {
        return '';
    }
    return Ext.util.Format.date(date, 'Y-m-d h:i')
}

/**
 * Takes background values and renders to the supplied Dashbored widget.
 * @param widget
 * @param data
 */
Dashbored.renderBackground = function(widget, data) {
    let bg = widget.widgetEl.querySelector('.dashbored-bg'),
        currentBg = bg.querySelector('.db-bg-element');
    if (currentBg) {
        bg.removeChild(currentBg);
    }

    // Image
    if (data.background_type === 'image' && data.bg_image) {
        let newImg = document.createElement('img');
        newImg.classList.add('db-bg-element');
        newImg.src = Ext.util.Format.htmlEncode(data.bg_image);
        bg.appendChild(newImg);
    }

    // Video
    if (data.background_type === 'video' && data.bg_video) {
        let newVideo = document.createElement('video');
        newVideo.classList.add('db-bg-element');
        newVideo.src = data.bg_video;
        newVideo.setAttribute('autoplay', 'true');
        newVideo.setAttribute('muted', 'true');
        newVideo.setAttribute('loop', 'true');
        bg.appendChild(newVideo);
    }

    // Render mask
    if (data.bg_mask) {
        let mask = bg.querySelector('.db-bg-mask');
        mask.style.backgroundColor = Dashbored.getBackgroundStyle(data.bg_mask);

        // Don't darken if no background
        if (data.background_type === 'none') {
            mask.style.backgroundColor = 'rgba(0,0,0,0)';
        }
    }
}

/**
 * @param bgOpacity
 * @returns {string}
 */
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

/**
 * Display message in widget
 * @param el
 * @param msg
 */
Dashbored.showMessage = function(el, msg) {
    el.innerHTML = msg;
    el.style.visibility = 'visible';
}

/**
 * Hide message in widget
 * @param el
 */
Dashbored.hideMessage = function(el) {
    el.style.visibility = 'hidden';
}