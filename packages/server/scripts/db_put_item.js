import { exec } from 'child_process';
import { readdirSync } from 'fs';

readdirSync('./local_db/data').forEach((file) => {
  console.log(`Writing ${file} to database...`);
  exec(
    `aws dynamodb batch-write-item --region ap-southeast-2 --endpoint http://localhost:8000 --cli-input-json file://local_db/data/${file}`,
    (err, stdout, stderr) => {
      if (err) {
        console.error(`Exception thrown: ${err.message}`);
        return;
      }
      if (stderr) {
        console.error(`Error occurred: ${stderr}`);
        return;
      }
      console.log(`${stdout}`);
    },
  );
});
