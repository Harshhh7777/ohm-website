const path = require('path');
const dotenvPath = path.resolve(__dirname, '.env');

require('dotenv').config({ path: dotenvPath });

console.log("Email:", process.env.EMAIL_USER);
console.log("Password set:", !!process.env.EMAIL_PASS);
console.log("Recipient:", process.env.RECIPIENT_EMAIL);
