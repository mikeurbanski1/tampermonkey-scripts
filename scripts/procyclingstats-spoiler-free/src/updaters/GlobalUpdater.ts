import $ from 'jquery';

import { makeSpoilerModeButton } from '../components';
import { Settings, SpoilerMode } from '../models';
import { AbstractUpdater } from './AbstractUpdater';

const Z_INDEX = 9999999999;

export class GlobalUpdater extends AbstractUpdater {
    constructor() {
        super({ name: 'GlobalUpdater', order: 10 });
    }

    public shouldRun(_: Settings): boolean {
        return true;
    }

    private makeSpoilerModeButtons(settings: Settings): JQuery<HTMLElement> {
        const hideButton = makeSpoilerModeButton(SpoilerMode.Hide);
        const showButton = makeSpoilerModeButton(SpoilerMode.Show);
        const showOnceButton = makeSpoilerModeButton(SpoilerMode.ShowOnce);

        const buttonsToShow =
            settings.spoilerMode === SpoilerMode.Hide ? [showOnceButton, showButton] : settings.spoilerMode === SpoilerMode.Show ? [hideButton, showOnceButton] : [hideButton, showButton];

        const buttonsDiv = $('<div></div>').css({ textAlign: 'center', marginTop: '10px' }).append(buttonsToShow);
        return buttonsDiv;
    }

    public run(settings: Settings) {
        const headerDiv = $('header div.cont');
        console.log('headerDiv', headerDiv);

        const enableButton = $('<button></button>')
            .text('Enable')
            .css({ margin: '5px' })
            .on('click', () => console.log('Button 2 clicked'));

        const optionsDiv = $('<div></div>')
            .css({
                display: 'none',
                position: 'absolute',
                backgroundColor: 'white',
                border: '1px solid black',
                right: '10px',
                top: '40px',
                zIndex: Z_INDEX, // the header is 99999999, lol
                color: 'black',
            })
            .append(
                $('<div></div>')
                    .css({
                        width: '90%',
                        textAlign: 'right',
                    })
                    .append(
                        $('<span></span>')
                            .css({
                                cursor: 'pointer',
                                fontWeight: 'bold',
                            })
                            .text('X')
                            .on('click', () => optionsDiv.css('display', 'none'))
                    )
            )
            .append(this.makeSpoilerModeButtons(settings));

        headerDiv.append(optionsDiv);

        const color = settings.spoilerMode === SpoilerMode.Hide ? 'lightgreen' : settings.spoilerMode === SpoilerMode.Show ? 'red' : 'orange';

        const text =
            settings.spoilerMode === SpoilerMode.Hide
                ? 'spoilers my flash briefly when pages load'
                : settings.spoilerMode === SpoilerMode.Show
                  ? 'DISABLED - spoilers below!'
                  : 'Spoilers will be hidden on next page';

        const pcssfDiv = $('<div></div>')
            .css({ color, position: 'absolute', right: '0px', top: '0px', width: '20%', zIndex: Z_INDEX })
            .html(`ProCyclingStats spoiler-free - ${text}.<br>Hover here for options.`);

        pcssfDiv.on('mouseover', () => optionsDiv.css('display', 'block'));

        headerDiv.append(pcssfDiv);
    }

    // public restoreSpoilers(): void {
    //     // No-op
    // }
}
