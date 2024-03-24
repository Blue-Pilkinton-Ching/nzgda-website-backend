import s3 from './../aws'

import fs from 'fs'

export default async function upload(
  Bucket: string,
  Key: string,
  filepath: string
) {
  const buffer = fs.readFileSync(filepath)

  let uploadId
  try {
    const response = await s3.createMultipartUpload({
      Bucket: 'heihei-game-content',
      Key,
    })
    uploadId = response.UploadId // S3 generates this UploadId
  } catch (error) {
    console.error('Error initiating multipart upload')
    throw error
  }

  let partUploadResponse
  try {
    partUploadResponse = await s3.uploadPart({
      Bucket: Bucket,
      Key,
      Body: buffer,
      PartNumber: 1,
      UploadId: uploadId, // Use the UploadId from the initiation step
    })
  } catch (error) {
    console.error('Error uploading part')
    throw error
  }

  let upload
  try {
    const parts = [{ ETag: partUploadResponse.ETag, PartNumber: 1 }]
    upload = await s3.completeMultipartUpload({
      Bucket: 'heihei-game-content',
      Key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts,
      },
    })
  } catch (error) {
    console.error('Error completing multipart upload', error)
    throw error
  }

  fs.unlink(filepath, (err) => {
    if (err) throw err
  })

  return upload.Location
}
