import 'dotenv/config';

console.log('Redis Environment Variables:');
console.log('REDIS_DB_HOST:', process.env.REDIS_DB_HOST);
console.log('REDIS_DB_USERNAME:', process.env.REDIS_DB_USERNAME ? '[SET]' : '[NOT SET]');
console.log('REDIS_DB_PASSWORD:', process.env.REDIS_DB_PASSWORD ? '[SET]' : '[NOT SET]'); 