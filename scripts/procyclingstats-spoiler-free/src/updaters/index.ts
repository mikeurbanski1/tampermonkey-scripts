import { GlobalUpdater } from './GlobalUpdater';
import { HomepageUpdater } from './HomepageUpdater';
import { RaceResultsUpdater } from './RaceResultsUpdater';
import { RiderUpdater } from './RiderUpdater';
import { StartlistUpdater } from './StartlistUpdater';
import { TeamUpdater } from './TeamUpdater';

export const updaters = [new GlobalUpdater(), new StartlistUpdater(), new RaceResultsUpdater(), new HomepageUpdater(), new RiderUpdater(), new TeamUpdater()].sort((a, b) => a.order - b.order);
