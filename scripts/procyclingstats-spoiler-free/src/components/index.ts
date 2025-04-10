import { SpoilerMode } from '../models';
import { SettingsManager } from '../SettingsManager';

const modeToAttributes: Record<SpoilerMode, { title: string; text: string }> = {
    [SpoilerMode.Hide]: {
        title: 'Refresh and hide spoilers',
        text: 'Hide spoilers',
    },
    [SpoilerMode.ShowOnce]: {
        title: 'Refresh and show spoilers once, but hide them again on next page load',
        text: 'Show spoilers once',
    },
    [SpoilerMode.Show]: {
        title: 'Refresh and show spoilers on all pages until hidden again',
        text: 'Show spoilers',
    },
};

export const makeSpoilerModeButton = (mode: SpoilerMode) =>
    $('<button></button>')
        .prop('title', modeToAttributes[mode].title)
        .text(modeToAttributes[mode].text)
        .css({ margin: '5px' })
        .on('click', () => {
            console.log(`${modeToAttributes[mode].text} button clicked`);
            SettingsManager.getInstance().setSetting('spoilerMode', mode);
            window.location.reload();
        });
