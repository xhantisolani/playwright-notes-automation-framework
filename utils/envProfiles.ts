export type EnvironmentProfileName = 'local' | 'qa' | 'staging';

export interface EnvironmentProfile {
  name: EnvironmentProfileName;
  uiBaseUrl: string;
  apiBaseUrl: string;
}

export const environmentProfiles: Record<EnvironmentProfileName, EnvironmentProfile> = {
  local: {
    name: 'local',
    uiBaseUrl: 'https://practice.expandtesting.com/notes/app',
    apiBaseUrl: 'https://practice.expandtesting.com/notes/api',
  },
  qa: {
    name: 'qa',
    uiBaseUrl: 'https://practice.expandtesting.com/notes/app',
    apiBaseUrl: 'https://practice.expandtesting.com/notes/api',
  },
  staging: {
    name: 'staging',
    uiBaseUrl: 'https://practice.expandtesting.com/notes/app',
    apiBaseUrl: 'https://practice.expandtesting.com/notes/api',
  },
};

export function resolveEnvironmentProfile(value: string | undefined): EnvironmentProfile {
  const profileName = (value ?? 'local').toLowerCase() as EnvironmentProfileName;
  return environmentProfiles[profileName] ?? environmentProfiles.local;
}
