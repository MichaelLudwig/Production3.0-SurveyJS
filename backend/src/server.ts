import app from './app';

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

// Start server
const server = app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 Production 3.0 Survey Backend API');
  console.log('='.repeat(60));
  console.log(`📍 Server running at: http://${HOST}:${PORT}`);
  console.log(`🏥 Health check: http://${HOST}:${PORT}/health`);
  console.log(`📝 API Documentation:`);
  console.log(`   📦 Orders: http://${HOST}:${PORT}/api/orders`);
  console.log(`   📋 Surveys: http://${HOST}:${PORT}/api/surveys`);
  console.log(`   📚 Master Data: http://${HOST}:${PORT}/api/master-data`);
  console.log('='.repeat(60));
  console.log(`🕐 Started at: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📴 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n📴 Received SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

export default server;