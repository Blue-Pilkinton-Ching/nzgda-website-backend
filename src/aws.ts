import * as AWS from 'aws-sdk'

// Updating AWS configuration globally
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-southeast-2', // Defaulting to 'ap-southeast-2'
})

export default AWS
