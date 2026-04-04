import bcrypt from 'bcryptjs';

const password = 'Admin@123'; //Admin@123 Admin@123
const hashedPassword = bcrypt.hashSync(password, 10);

console.log('Password:', password);
console.log('Hashed Password:', hashedPassword);
console.log('\nCopy this hash for your SQL query:');
console.log(hashedPassword);