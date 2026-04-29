export interface AuditLog {
  id: number;
  timestamp: string;
  action: string;
  origin: string;
  userId: number | null;
  roomId: number | null;
  espDeviceId: number | null;
}
