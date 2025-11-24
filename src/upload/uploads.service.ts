import { BadRequestException, Injectable } from '@nestjs/common';

import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PinoLogger } from 'nestjs-pino';

import { errorMessages } from '@src/common/error-messages';
import { logServiceError } from '@src/common/utils/logging';

const PRESIGNED_EXPIRE = 60 * 5; // 5 minutes
const DOWNLOAD_URL_EXPIRES_IN = 60 * 15; // 15 minutes

@Injectable()
export class UploadsService {
  public readonly s3Client: S3Client;
  public readonly publicBucketName: string;
  public readonly privateBucketName: string;
  public readonly region: string;

  constructor(private readonly logger: PinoLogger) {
    this.publicBucketName = process.env.S3_UPLOADS_BUCKET_NAME as string;
    this.privateBucketName = process.env.S3_PRIVATE_ASSETS_BUCKET_NAME as string;
    this.region = process.env.AWS_REGION as string;
    this.logger.setContext(UploadsService.name);

    this.s3Client = new S3Client({
      region: this.region,
    });
  }

  async getPresignedUrl(params: { s3Key: string; fileType: string; bucket: string }) {
    const { s3Key, fileType, bucket } = params;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      ContentType: fileType,
    });

    const presignedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: PRESIGNED_EXPIRE,
    });

    return { presignedUrl };
  }

  async getPresignedUrlForDownload(params: { bucket: string; s3Key: string }) {
    const { bucket, s3Key } = params;

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: s3Key,
    });

    const presignedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: DOWNLOAD_URL_EXPIRES_IN,
    });

    return { presignedUrl };
  }

  async verifyFileExists(bucket: string, key: string): Promise<void> {
    try {
      const checkCommand = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      await this.s3Client.send(checkCommand);
    } catch (error) {
      logServiceError(this.logger, error, 'Failed to find S3 file.', { bucket, key });
      throw new BadRequestException(errorMessages.NotFoundException.FILE_STORAGE_NOT_FOUND());
    }
  }

  async deleteFile(bucket: string, key: string): Promise<void> {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      await this.s3Client.send(deleteCommand);
    } catch (error) {
      logServiceError(this.logger, error, 'Failed to delete object from S3.', { bucket, key });
    }
  }
}
