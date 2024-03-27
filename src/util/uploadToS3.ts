import s3 from './../aws'
import path from 'path'
import fs from 'fs'
var mime = require('mime-types')

export async function uploadFile(
  Bucket: string,
  Key: string,
  filepath: string
) {
  const buffer = fs.readFileSync(filepath)
  const ContentType = mime.lookup(filepath) || 'application/octet-stream'

  let uploadId
  try {
    const response = await s3.createMultipartUpload({
      Bucket: 'heihei-game-content',
      Key,
      ContentType,
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

  return upload.Location
}

export async function uploadFolder(
  Bucket: string,
  folderPath: string,
  s3FolderPath = ''
) {
  const files = await fs.promises.readdir(folderPath, { withFileTypes: true })
  const uploadPromises = []

  for (const file of files) {
    const localPath = path.join(folderPath, file.name)
    if (file.isDirectory()) {
      // If it's a directory, make a recursive call
      const uploadPromise = uploadFolder(
        Bucket,
        localPath,
        `${s3FolderPath}${file.name}/`
      )
      uploadPromises.push(uploadPromise)
    } else {
      // If it's a file, prepare to upload it
      const Key = `${s3FolderPath}${file.name}`
      const uploadPromise = uploadFile(Bucket, Key, localPath)
      uploadPromises.push(uploadPromise)
    }
  }

  // Use Promise.all to upload all files/directories in parallel
  // Note: To handle rejections and continue, consider using Promise.allSettled
  await Promise.all(uploadPromises)
}
