export interface IConfigResponse {
  backend_entry_point: { jsonrpc_url: string };
  assets: { version: string; hash: string; urls: readonly string[] };
  definitions: { version: string; hash: string; urls: readonly string[] };
  notifications: { jsonrpc_url: string };
}

export interface IAssetConfig {
  hash: string;
  version: string;
}

export type Platform = 'android' | 'ios';
