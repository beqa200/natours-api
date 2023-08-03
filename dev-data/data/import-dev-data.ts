const fs = require('fs');
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });
import Tour from '../../models/tourModel';
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
      console.log('Database connected!');
    });
} catch (error) {
  console.error('Error connecting to database:', error);
}

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data created!!!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] == '--import') {
  importData();
} else if (process.argv[2] == '--delete') {
  deleteData();
}
