export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  logging: {
    level: 'debug',
    enableConsole: true
  },
  honeycomb: {
    apiKey: 'your-api-key-here',
    dataset: 'financial-dashboard-frontend',
    serviceName: 'financial-dashboard-frontend'
  }
}; 