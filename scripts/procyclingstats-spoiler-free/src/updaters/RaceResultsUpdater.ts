import $ from 'jquery';

import { Settings, SpoilerMode } from '../models';
import { AbstractUpdater } from './AbstractUpdater';

const pathRegexes = {
    raceOverview: /\/race\/[\w-]+\/\d+/,
    raceResult: /\/race\/[\w-]+\/\d+\/\w+/,
    raceTopLevel: /\/race\/[\w-]+/,
};

export class RaceResultsUpdater extends AbstractUpdater {
    constructor() {
        super({ name: 'RaceResultsUpdater', order: 11 });
    }

    public shouldRun(settings: Settings): boolean {
        return settings.spoilerMode === SpoilerMode.Hide && !window.location.pathname.endsWith('/startlist') && Object.values(pathRegexes).some((regex) => regex.test(window.location.pathname));
    }

    public run(settings: Settings): void {
        Object.entries(pathRegexes).forEach(([key, regex]) => {
            if (regex.test(window.location.pathname)) {
                switch (key) {
                    case 'raceOverview':
                        this.raceOverview(settings);
                        break;
                    case 'raceResult':
                        this.raceResult(settings);
                        break;
                    case 'raceTopLevel':
                        this.raceTopLevel(settings);
                        break;
                    default:
                        console.warn(`No mapping for ${key} found`);
                        break;
                }
            }
        });
    }

    private raceTopLevel(_: Settings): void {
        $('h3').each((_, h3) => {
            const text = $(h3).text();
            if (text === 'Last winners' || text === 'Most wins') {
                $('ul', $(h3).next())
                    .find('li')
                    .each((_, li) => {
                        const children = $(li).children();
                        children.eq(1).text('Spoiler removed');
                        if (children.length > 3) {
                            // this is 'most wins' - remove the values as well
                            children.eq(2).text('');
                        }
                    });
            }
        });

        const a = $('h3')[2];
    }

    private raceResult(_: Settings, tag = 'table'): void {
        // could also check the page breadcrumbs header if this does not work
        const isOneDayRace = window.location.pathname.endsWith('result');

        $('table.results').text('Spoilers removed');

        // replace the sensitive race information only
        $('ul.infolist')
            .children('li')
            .each((_, li) => {
                const firstChild = $(li).children(':first');
                const text = firstChild.text().toLowerCase();
                if (text.includes('won') || text.includes('winner')) {
                    $(firstChild).next().text('Spoilers removed');
                }
            });
    }

    private raceOverview(_: Settings): void {
        $('h3').each((_, h3) => {
            const text = $(h3).text();
            if (text.startsWith('Result') || text === 'Stage winners') {
                this.replaceSpoilerBody(h3);
            }
        });
    }

    private replaceSpoilerBody(header: HTMLElement): void {
        $(header).next().text('Spoilers removed');
    }
}
