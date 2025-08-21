export const appConfig = {
  cache: {
    max: 1000,
    ttl: 600_000,
  },
  urls: {
    assets: ['dhm.cdn.application.com', 'ehz.cdn.application.com'],
    backend_entry_point: { jsonrpc_url: 'api.application.com/jsonrpc/v2' },
    definitions: ['eau.cdn.application.com', 'tbm.cdn.application.com'],
    notifications: { jsonrpc_url: 'notifications.application.com/jsonrpc/v1' },
  },
} as const;
