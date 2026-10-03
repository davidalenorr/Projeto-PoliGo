export type SyncSession = {
  studentId: string;
  classId: string;
  className: string;
  deviceId: string;
};

export type SyncEventType =
  | 'mission_started'
  | 'mission_attempt'
  | 'mission_completed'
  | 'boss_defeated'
  | 'quiz_session';

export type NewSyncEvent = {
  clientEventId: string;
  type: SyncEventType;
  missionId?: string;
  phaseNumber?: number;
  correct?: boolean;
  durationMs?: number;
  occurredAt: string;
};

export type QueuedSyncEvent = NewSyncEvent & {
  attempts: number;
  nextAttemptAt?: number;
};
