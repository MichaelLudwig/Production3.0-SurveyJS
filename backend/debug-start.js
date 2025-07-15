// Debug startup script to identify issues
console.log('🔍 Debugging backend startup...');

try {
  console.log('1. Loading ts-node...');
  require('ts-node/register');
  
  console.log('2. Setting TypeScript compiler options...');
  process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
    "module": "commonjs",
    "target": "es2020"
  });
  
  console.log('3. Loading server.ts...');
  require('./src/server.ts');
  
  console.log('✅ Server startup initiated successfully!');
} catch (error) {
  console.error('❌ Error during startup:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}