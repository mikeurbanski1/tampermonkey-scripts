import { Settings } from './models';
import { defaultSettings } from './utils/consts';

export class SettingsManager {
    private static instance: SettingsManager;

    private constructor() {}

    public static getInstance(): SettingsManager {
        if (!SettingsManager.instance) {
            SettingsManager.instance = new SettingsManager();
        }
        return SettingsManager.instance;
    }

    private static keyToSettingName(key: string): string {
        return `sfc.settings.${key}`;
    }

    public getSettings(): Settings {
        const settings = (Object.entries(defaultSettings) as [keyof Settings, Settings[keyof Settings]][]).reduce(
            <T extends keyof Settings>(settings: Settings, [key, defaultValue]: [T, Settings[T]]) => {
                settings[key as T] = this.getSetting(key, true);
                return settings;
            },
            {} as Settings
        );
        console.log('Got all settings:', JSON.stringify(settings, null, 2));
        return settings;
    }

    public getSetting<T extends keyof Settings>(key: T, setDefaultIfNotSet = true): Settings[T] {
        const settingName = SettingsManager.keyToSettingName(key);
        const value = GM_getValue(settingName) as Settings[T] | undefined;
        if (value) {
            return value;
        }

        console.warn(`Setting ${key} not found, returning default value and ${setDefaultIfNotSet ? '' : 'NOT'} updating stored setting.`);
        if (setDefaultIfNotSet) {
            GM_setValue(settingName, defaultSettings[key]);
        }
        return defaultSettings[key];
    }

    public setSettings(settings: Settings): void {
        (Object.entries(defaultSettings) as [keyof Settings, Settings[keyof Settings]][]).forEach(<T extends keyof Settings>([key, value]: [T, Settings[T]]) => this.setSetting(key, settings[key]));
        console.log('Settings updated:', JSON.stringify(settings, null, 2));
    }

    public setSetting<T extends keyof Settings>(key: T, value: Settings[T]): void {
        const settingName = SettingsManager.keyToSettingName(key);
        GM_setValue(settingName, value);
    }

    public clearSettings(): void {
        (Object.keys(defaultSettings) as (keyof Settings)[]).forEach(<T extends keyof Settings>(key: T) => this.clearSetting(key));
    }

    public clearSetting<T extends keyof Settings>(key: T): void {
        const settingName = SettingsManager.keyToSettingName(key);
        GM_deleteValue(settingName);
    }
}
