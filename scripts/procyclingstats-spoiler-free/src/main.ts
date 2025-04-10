import $ from 'jquery';

import { SpoilerMode } from './models';
import { SettingsManager } from './SettingsManager';
import { updaters } from './updaters';

const ready = () => {
    const settingsManager = SettingsManager.getInstance();
    const settings = settingsManager.getSettings();
    // if the spoiler mode is disable once, then reset it to enabled now before we do anything else
    if (settings.spoilerMode === SpoilerMode.ShowOnce) {
        settingsManager.setSetting('spoilerMode', SpoilerMode.Hide);
    }
    updaters.forEach((updater) => {
        if (updater.shouldRun(settings)) {
            updater.firstRun(settings);
        }
    });
};

(function () {
    'use strict';

    $(ready);
})();
