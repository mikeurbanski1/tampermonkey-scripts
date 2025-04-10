import $ from 'jquery';

import { Settings, SpoilerMode } from '../models';
import { AbstractUpdater } from './AbstractUpdater';

export class StartlistUpdater extends AbstractUpdater {
    private riderToRemovedTextMap: Map<string, string> = new Map();

    constructor() {
        super({ name: 'StartlistUpdater', order: 11 });
    }

    public shouldRun(settings: Settings): boolean {
        return settings.spoilerMode === SpoilerMode.Hide && window.location.pathname.includes('/startlist');
    }

    public run(_: Settings): void {
        this.removeDnf();
    }

    private removeDnf(): void {
        const riders = $('.ridersCont ul li');

        const ridersWithText = $(riders).filter((_, rider) => {
            return (
                $(rider)
                    .contents()
                    .filter(function () {
                        return this.nodeType == 3;
                    }).length > 0
            );
        });

        ridersWithText.each((_, rider) => {
            const link = $(rider).find('a');
            $(rider)
                .contents()
                .each((_, node) => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        const nodeText = $(node).text();
                        if (nodeText.includes('DNF') || nodeText.includes('DNS')) {
                            this.riderToRemovedTextMap.set($(link).text(), nodeText);
                            console.debug('updated removed startlist map with ', $(link).text(), nodeText);
                            (node as Text).data = ' ';
                        }
                    }
                });
        });
    }

    // public restoreSpoilers(): void {
    //     // this.restoreDnf();
    // }
}
