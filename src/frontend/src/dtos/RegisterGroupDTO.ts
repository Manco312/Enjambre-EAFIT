export interface RegisterGroupStatusDTO {
  name: string;
  percentage: number;
}

export interface RegisterGroupDTO {
  name: string;
  committeeNames: string[];
  statuses: RegisterGroupStatusDTO[];
  boardUsername: string;
  boardPassword: string;
}
