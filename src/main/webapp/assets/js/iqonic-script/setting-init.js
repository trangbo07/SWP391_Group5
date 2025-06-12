(function () {
    ("use strict");
    // Customizer Setting initialize
    let setting_options = document.querySelector('meta[name="setting_options"]');
    if (setting_options !== null && setting_options !== undefined) {
        setting_options = JSON.parse(setting_options.getAttribute("content"));

    } else {
        setting_options = JSON.parse("{}");
    }


    const theme = IQUtils.getQueryString('theme')
    if (theme !== '' && theme !== null) {
        setting_options = selectTheme(theme)
    }
    const setting = (window.IQSetting = new IQSetting(setting_options));

  

    document.addEventListener('click', function (e) {
        const liveCustomizerPannel = document.querySelector('#live-customizer')
        if (liveCustomizerPannel !== null) {
            if (liveCustomizerPannel.classList.contains('show')) {
                if (e.target.closest('.live-customizer') == null && e.target.closest('#settingbutton') == null) {
                    bootstrap.Offcanvas.getInstance(liveCustomizerPannel).hide()
                }
            }
        }
    })

    const liveCusomizer = IQUtils.getQueryString('live-customizer')
    if (liveCusomizer !== '' && liveCusomizer !== null && liveCusomizer === 'open') {
        const liveCustomizerPannel = document.querySelector('#live-customizer')
        const liveCustomizerInstance = new bootstrap.Offcanvas(liveCustomizerPannel)
        if (liveCustomizerInstance !== null) {
            liveCustomizerInstance.show()
        }
    }

    /*---------------------------------------------------------------------
                Reset Settings
    -----------------------------------------------------------------------*/
    const resetSettings = document.querySelector('[data-reset="settings"]');
    if (resetSettings !== null) {
        resetSettings.addEventListener('click', (e) => {
            e.preventDefault();
            const confirm = window.confirm('Are you sure you want to reset your settings?');
            if (confirm) {
                window.IQSetting.reInit()
            }
        })
    }


})();
