import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type ScenarioSeed = {
  id: string;
  name: string;
  recordIds: string[];
};

type FoundationSeed = {
  featureId: string;
  name: string;
  appShell: {
    id: string;
    name: string;
    entryPoint: string;
    mountedComponent: string;
    runtime: string;
    accessibility: {
      skipLinkId: string;
      topbarId: string;
      mainLandmarkId: string;
    };
    shellAreaIds: string[];
    serviceBoundaryIds: string[];
  };
  rootRoute: {
    id: string;
    path: string;
    label: string;
  };
  viewports: Array<{
    id: string;
    name: string;
    width: number;
    height: number;
  }>;
  sourceAreas: Array<{
    id: string;
    name: string;
    path: string;
  }>;
  serviceBoundaries: Array<{
    id: string;
    name: string;
    status: string;
  }>;
  scenarios: Record<string, ScenarioSeed>;
};

const supportDir = path.dirname(fileURLToPath(import.meta.url));
export const e2eRoot = path.resolve(supportDir, '..');
export const workspaceRoot = path.resolve(e2eRoot, '..');

export function loadFoundationSeed(): FoundationSeed {
  const seedPath = path.join(
    e2eRoot,
    'fixtures',
    'feat-000-application-foundation.seed.json',
  );

  return JSON.parse(readFileSync(seedPath, 'utf-8')) as FoundationSeed;
}

export function scenarioSeed(facId: string): ScenarioSeed {
  const seed = loadFoundationSeed();
  const scenario = seed.scenarios[facId];

  if (!scenario) {
    throw new Error(`Missing seed scenario for ${facId}`);
  }

  return scenario;
}

export function workspacePath(relativePath: string): string {
  return path.join(workspaceRoot, relativePath);
}
