import s3 from '../aws'
import path from 'path'
import fs from 'fs'
import { ListObjectsV2Command } from '@aws-sdk/client-s3'
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

export async function deleteFolder(bucketName: string, folderPath: string) {
  try {
    // Ensure the folder path ends with a '/'
    const folderPrefix = folderPath.endsWith('/')
      ? folderPath
      : `${folderPath}/`

    // List all objects within the folder
    const listResponse = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: folderPrefix,
      })
    )

    // Check if there are any contents to delete
    if (listResponse.Contents && listResponse.Contents.length > 0) {
      const objectsToDelete = listResponse.Contents.map((content) => ({
        Key: content.Key,
      }))

      // Delete the objects
      await s3.deleteObjects({
        Bucket: bucketName,
        Delete: {
          Objects: objectsToDelete,
          Quiet: false,
        },
      })
    }
  } catch (error) {
    console.error(`Error deleting folder: ${folderPath} `, error)
  }
}

export async function overriteFolder(
  bucketName: string,
  folderPath: string,
  key: string
) {
  try {
    await deleteFolder(bucketName, key)
  } catch (error) {
    console.error('Error deleting folder', error)
  }
  await uploadFolder(bucketName, folderPath, key)
}

export async function overriteFile(
  bucketName: string,
  filepath: string,
  key: string
) {
  try {
    await s3.deleteObject({
      Bucket: bucketName,
      Key: key,
    })
  } catch (error) {
    console.error('Error deleting object', error)
  }
  await uploadFile(bucketName, key, filepath)
}
