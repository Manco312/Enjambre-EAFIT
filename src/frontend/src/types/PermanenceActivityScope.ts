import { PERMANENCE_ACTIVITY_SCOPES } from '@/constants/permanenceActivityScopes';

export type PermanenceActivityScope =
  (typeof PERMANENCE_ACTIVITY_SCOPES)[keyof typeof PERMANENCE_ACTIVITY_SCOPES];
