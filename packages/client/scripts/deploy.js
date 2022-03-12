import { exec } from 'child_process';

// Getting s3 bucket information.
exec('aws cloudformation describe-stacks --stack-name mirinae-comet', (err, stdout, stderr) => {
	if (err) {
		console.error(`Exception thrown: ${err.message}`);
		return;
	}
	if (stderr) {
		console.error(`Error occurred: ${stderr}`);
		return;
	}
	const stackObj = JSON.parse(stdout);
	const s3Name = stackObj?.['Stacks']?.[0]?.['Outputs']?.find(
		(elem) => elem['OutputKey'] === 'FrontS3BucketName'
	)?.['OutputValue'];
	if (!s3Name) {
		console.error('Cannot find s3 bucket. Please deploy lambda first.');
		return;
	}
	console.log(`Found s3 bucket: ${s3Name}`);
	// Upload local files to s3 bucket.
	exec(`aws s3 sync ./build "s3://${s3Name}/" --delete`, (err, stdout, stderr) => {
		if (err) {
			console.error(`Exception thrown: ${err.message}`);
			return;
		}
		if (stderr) {
			console.error(`Error occurred: ${stderr}`);
			return;
		}
		console.log(`${stdout}`);
		console.log('File uploaded, renaming html...');
		exec(`aws s3api list-objects --bucket ${s3Name}`, (err, stdout, stderr) => {
			if (err) {
				console.error(`Exception thrown: ${err.message}`);
				return;
			}
			if (stderr) {
				console.error(`Error occurred: ${stderr}`);
				return;
			}
			const files = JSON.parse(stdout);
			const contents = files['Contents'];
			contents.forEach((content) => {
				const key = content['Key'];
				if (key.endsWith('.html') && !key.endsWith('index.html')) {
					exec(
						`aws s3 mv s3://${s3Name}/${key} s3://${s3Name}/${key.substr(
							0,
							key.lastIndexOf('.html')
						)}`,
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
						}
					);
				}
			});
		});
	});
});
