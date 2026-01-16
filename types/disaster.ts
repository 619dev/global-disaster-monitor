export type DisasterType = 'earthquake' | 'tsunami' | 'weather' | 'other';

export interface DisasterEvent {
  id: string;
  type: DisasterType;
  title: string;
  location: string;
  latitude: number;
  longitude: number;
  time: string; // ISO string
  magnitude?: number;
  depth?: number;
  intensity?: string;
  source: string; // 'Wolfx', 'P2P', etc.
  description?: string;
  isTest?: boolean;
}
