import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

import app from './app';
import mongoose from 'mongoose';
// console.log(process.env);

if (!process.env.DATABASE_URL || !process.env.DATABASE_PASSWORD) {
  throw new Error(
    'Database URL or Database password is not defined in environment variables!'
  );
}
const DB_URL = process.env.DATABASE_URL?.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

try {
  DB_URL &&
    mongoose.connect(DB_URL).then((con) => {
      console.log(con.connections);
      console.log('Database connected!');
    });
} catch (error) {
  console.error('Error connecting to database:', error);
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
