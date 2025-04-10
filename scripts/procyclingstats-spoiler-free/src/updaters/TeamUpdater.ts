import dayjs from 'dayjs';
import $ from 'jquery';

import { Settings, SpoilerMode } from '../models';
import { now } from '../utils/consts';
import { AbstractUpdater } from './AbstractUpdater';

export class TeamUpdater extends AbstractUpdater {
    constructor() {
        super({ name: 'GlobalUpdater', order: 10 });
    }

    public shouldRun(settings: Settings): boolean {
        return settings.spoilerMode === SpoilerMode.Hide && window.location.pathname.startsWith('/team/');
    }

    public run(_: Settings) {
        const headersToRemove = ['Top results', 'Last victories'];
        headersToRemove.forEach((header) => $(`h3:contains('${header}')`).next().text('Spoilers removed'));

        // const currentYear = $('li[data-season].cur').text();
        // console.log('currentYear', currentYear);

        const teamHomepageCurrentYearRegex = new RegExp(`\\/team\\/[\\w-]+${now.year()}`);
        console.log(teamHomepageCurrentYearRegex);
        console.log(window.location.pathname);
        console.log(teamHomepageCurrentYearRegex.test(window.location.pathname));
        if (teamHomepageCurrentYearRegex.test(window.location.pathname)) {
            $("li.title:has(a:contains('Victories'))").next().find('a').text('???');
            $("li.title:has(a:contains('Points'))").next().find('a').text('???');
        }

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
