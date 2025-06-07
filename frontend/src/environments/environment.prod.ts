export const environment = {
  production: true,
  apiUrl: '/api',
  logging: {
    level: 'warning',
    enableConsole: false
  },
  honeycomb: {
    apiKey: '${HONEYCOMB_API_KEY}',
    dataset: 'financial-dashboard-frontend',
    serviceName: 'financial-dashboard-frontend'
  }
}; 