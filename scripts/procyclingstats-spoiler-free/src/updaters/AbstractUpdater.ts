import { Settings } from '../models';

export abstract class AbstractUpdater {
    public readonly order: number;
    public readonly name: string;

    constructor({ name, order = 0 }: { name: string; order?: number }) {
        this.order = order;
        this.name = name;
    }

    // public abstract restoreSpoilers(): void;
    public abstract run(settings: Settings): void;
    public abstract shouldRun(settings: Settings): boolean;

    public firstRun(settings: Settings): void {
        console.log(`Running updater: ${this.name}`);
        try {
            this.run(settings);
        } catch (err) {
            console.error(`Error running updater: ${this.name}`);
            console.error(err);
        }
    }

    // public restore(): void {
    //     console.log(`Restoring spoilers for updater: ${this.name}`);
    //     this.restoreSpoilers();
    // }

    // public remove(): void {
    //     console.log(`Removing spoilers for updater: ${this.name}`);
    //     this.removeSpoilers(false);
    // }
}
