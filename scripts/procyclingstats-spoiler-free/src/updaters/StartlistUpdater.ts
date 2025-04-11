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

        // some pages use a 'dropout' class on the li that contains the rider number, flag, and name
        // but this is not always there, so searching for extra text is more reliable

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
            $(rider)
                .removeClass('dropout')
                .contents()
                .each((_, node) => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        const nodeText = $(node).text();
                        if (nodeText.includes('DNF') || nodeText.includes('DNS')) {
                            (node as Text).data = ' ';
                        }
                    }
                });
        });
    }
}
