import dayjs from 'dayjs';
import $ from 'jquery';

import { makeSpoilerModeButton } from '../components';
import { Settings, SpoilerMode } from '../models';
import { AbstractUpdater } from './AbstractUpdater';

const riderYearRegex = /\/rider\/[\w-]+\/\d{4}/;

export class RiderUpdater extends AbstractUpdater {
    constructor() {
        super({ name: 'GlobalUpdater', order: 10 });
    }

    public shouldRun(settings: Settings): boolean {
        return settings.spoilerMode === SpoilerMode.Hide && window.location.pathname.startsWith('/rider/');
    }

    public run(settings: Settings) {
        const headersToRemove = ['Top results', 'Key statistics', 'PCS Ranking position per season'];
        headersToRemove.forEach((header) => $(`h3:contains('${header}')`).next().text('Spoilers removed'));

        // const currentYear = $('li[data-season].cur').text();
        // console.log('currentYear', currentYear);

        $('.left:has(.rdrSeasonNav)').text(
            'Spoilers removed (sorry if you are not looking at 2025 - this table is a little more work because it is dynamic and I want to get everything as quickly as possible)'
        );
        $('.rnk, .pnt, .delta-up, .delta-down').text('?');

        // remove spoilers only for the current year tab, and they will persist

        // let lastResultDate: string | undefined = undefined;
        // resultCont.find('tr').each((_, tr) => {
        //     const dateColumn = $(tr).find('td').eq(0);
        //     const now = dayjs();
        //     const resultDate = dayjs(dateColumn.text(), 'DD.MM');
        // }

        // headersToRemove.forEach((header) => $(`h3:contains('${header}')`).next().text('Spoilers removed'));

        // $('.rdrResults tr');
    }
}
