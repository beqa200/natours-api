import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });
import app from './app';
import mongoose from 'mongoose';

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
      // console.log(con.connections);
      console.log('Database connected!');
    });
} catch (error) {
  console.error('Error connecting to database:', error);
}

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on("unhandledRejection", (err: Error)=> {
  console.log(err.name, err.message)
  console.log("Unhandled Rejection!")
  server.close(() => {
    process.exit(1)
  })
}) 