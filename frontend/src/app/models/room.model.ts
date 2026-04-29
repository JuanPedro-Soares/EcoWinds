export type RoomStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface Room {
  id: number;
  identification: string;
  block: string;
  status: RoomStatus;
}

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  ACTIVE: 'Ativa',
  INACTIVE: 'Inativa',
  MAINTENANCE: 'Manutenção',
};
