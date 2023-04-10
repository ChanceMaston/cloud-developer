import * as AWS from 'aws-sdk'
const AWSXRay = require('aws_xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

import { createLogger } from '../utils/logger'
const logger = createLogger('AttachmentUtils')
const s3 = new XAWS.S3({signatureVersion: 'v4'})

export async function getUploadUrl(todoId: string) {
    logger.info('Get Upload URL for ' + todoId)

    return s3.getSignedUrl('putObject', {
        Bucket: process.env.ATTACHMENT_S3_BUCKET,
        Key: todoId,
        Expires: process.env.SIGNED_URL_EXPIRATION
    })
}
