import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

import app from './app';
// console.log(process.env);

if (process.env.DATABASE_PASSWORD) {
  const DB = process.env.DATABASE_URL?.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
  );

  console.log(DB)
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
