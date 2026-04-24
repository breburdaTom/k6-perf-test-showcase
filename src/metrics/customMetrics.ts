import { Rate, Trend } from 'k6/metrics';

export const journeyDuration = new Trend('journey_duration', true);
export const journeySuccessRate = new Rate('journey_success_rate');
