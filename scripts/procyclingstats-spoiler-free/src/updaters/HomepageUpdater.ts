import $ from 'jquery';

import { makeSpoilerModeButton } from '../components';
import { Settings, SpoilerMode } from '../models';
import { AbstractUpdater } from './AbstractUpdater';

export class HomepageUpdater extends AbstractUpdater {
    constructor() {
        super({ name: 'GlobalUpdater', order: 10 });
    }

    public shouldRun(settings: Settings): boolean {
        return settings.spoilerMode === SpoilerMode.Hide && window.location.pathname.endsWith('/index.php');
    }

    public run(settings: Settings) {
        const headersToRemove = ['Results today', 'Results yesterday', 'PCS Ranking', 'PCS Ranking WE', 'Latest articles', 'Popular today', 'Popular teams today', 'Recent top riders program updates'];
        $('h3.black-info-title, h3.info-title').each((_, header) => {
            const headerText = $(header).text();
            if (headersToRemove.includes(headerText)) {
                $(header).next().text('Spoilers removed');
            }
        });

        $('.homepageDailyQuiz').text('Spoilers removed (DAILY QUIZ)');

        $('.winner.fs11').replaceWith('Spoiler removed');
        console.log($('.hp3-livestats .togo').next('div'));

        $('.hp3-livestats .togo').next('div').text('Spoiler removed').next('div').remove();

        $('.hp3-livestats .togo').remove();

        $('.top-articles').text('Spoilers removed (TOP ARTICLES)');
    }
}
