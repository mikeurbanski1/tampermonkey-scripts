import dayjs from 'dayjs';

import { Settings, SpoilerMode } from '../models';

export const defaultSettings: Settings = {
    spoilerMode: SpoilerMode.Hide,
    name: 'name',
    goingWell: true,
};

export const now = dayjs();
