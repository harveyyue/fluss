export interface DatabaseInfo {
  name: string;
  comment?: string;
}

export interface TableInfo {
  name: string;
  type: string;
  comment?: string;
}

export interface ColumnInfo {
  name: string;
  type: string;
  comment?: string;
  nullable?: boolean;
}

export interface TableSchema {
  name: string;
  columns: ColumnInfo[];
  primaryKey?: string[];
  comment?: string;
}

export interface QueryResult {
  columns: string[];
  results: Record<string, any>[];
  error?: string;
}
