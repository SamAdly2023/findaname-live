
export enum DomainStatus {
  Available = 'Available',
  Taken = 'Taken',
  Unknown = 'Unknown',
}

export interface DomainInfo {
  name: string;
  status: DomainStatus;
  description?: string;
}

export interface WhoisData {
  registrar?: string;
  creationDate?: string;
  expirationDate?: string;
  nameServers?: string[];
  status?: string[];
  error?: string;
}
