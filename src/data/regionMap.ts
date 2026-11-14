import type { ComponentProps } from 'react';
import type { Body, Slug } from 'react-body-map';
import type { Region } from '../types';

/** Verified against installed react-body-map@1.1.0 dist/assets/bodyFront.js,
 * bodyBack.js, dist/Body.js and dist/Body.d.ts. README callback props are stale!
 * Actual props: data, onBodyPartPress; BodyPart requires color.
 * Both head-front and head-back have selectable paths.
 * Region groupings are ASTRA navigation choices, not a diagnostic anatomy map.
 */
export const regionMap = {
  'head-front': 'head', 'head-back': 'head',
  'chest-left': 'chest', 'chest-right': 'chest',
  'upper-back-left': 'upperBack', 'upper-back-right': 'upperBack',
  'trapezius-left-back': 'upperBack', 'trapezius-right-back': 'upperBack',
  'lower-back-left': 'lowerBack', 'lower-back-right': 'lowerBack',
  'biceps-left': 'arms', 'biceps-right': 'arms',
  'triceps-left-front': 'arms', 'triceps-right-front': 'arms',
  'triceps-left-back': 'arms', 'triceps-right-back': 'arms',
  'deltoids-left-front': 'arms', 'deltoids-right-front': 'arms',
  'deltoids-left-back': 'arms', 'deltoids-right-back': 'arms',
  'forearm-left-front': 'arms', 'forearm-right-front': 'arms',
  'forearm-left-back': 'arms', 'forearm-right-back': 'arms',
  'hands-left-front': 'arms', 'hands-right-front': 'arms',
  'hands-left-back': 'arms', 'hands-right-back': 'arms',
  'adductors-left-front': 'legs', 'adductors-right-front': 'legs',
  'adductors-left-back': 'legs', 'adductors-right-back': 'legs',
  'quadriceps-left': 'legs', 'quadriceps-right': 'legs',
  'hamstring-left': 'legs', 'hamstring-right': 'legs',
  'knees-left': 'legs', 'knees-right': 'legs',
  'tibialis-left': 'legs', 'tibialis-right': 'legs',
  'calves-left-front': 'legs', 'calves-right-front': 'legs',
  'calves-left-back': 'legs', 'calves-right-back': 'legs',
  'ankles-left-front': 'legs', 'ankles-right-front': 'legs',
  'ankles-left-back': 'legs', 'ankles-right-back': 'legs',
  'feet-left-front': 'legs', 'feet-right-front': 'legs',
  'feet-left-back': 'legs', 'feet-right-back': 'legs',
} as const satisfies Partial<Record<Slug, Region>>;

export const REGION_LABELS: Record<Region, string> = {
  head: 'Head', chest: 'Chest', upperBack: 'Upper back', lowerBack: 'Lower back', arms: 'Arms', legs: 'Legs',
};
/** Abdomen, neck, front trapezius, hips and glutes have no exact contract region.
 * Leave unassigned rather than silently calling them chest/back. Keep the six
 * labelled region buttons as the keyboard-accessible navigation alternative.
 */
export function regionForSlug(slug: Slug): Region | undefined {
  return (regionMap as Partial<Record<Slug, Region>>)[slug];
}
export type BodyMapClickHandler = ComponentProps<typeof Body>['onBodyPartPress'];
export function createBodyMapClickHandler(onRegion: (region: Region) => void): BodyMapClickHandler {
  return part => { const region = regionForSlug(part.slug); if (region) onRegion(region); };
}
