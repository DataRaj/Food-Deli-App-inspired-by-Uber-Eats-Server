import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/multer.config';
import * as AWS from 'aws-sdk';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
@Controller('uploads')
export class UploadsController {
	constructor(private readonly configService: ConfigService) {}

	@Post('aws')
	@UseInterceptors(FileInterceptor('file'))
	async uploadFileAws(@UploadedFile() file) {
		const BUCKET_NAME = this.configService.get('BUCKET_NAME');

		const s3 = new S3Client({
			credentials: {
				accessKeyId: this.configService.get('AWS_KEY'),
				secretAccessKey: this.configService.get('AWS_SECRET'),
			},
		});
		try {
			const objectName = `${Date.now()}-${file.originalname}`;
			await s3.send(new PutObjectCommand({
				Bucket: BUCKET_NAME,
				Key: objectName,
				Body: file.buffer,
				ACL: 'public-read',
			}));
			const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${objectName}`;
			return { url };
		} catch (e) {
			return null;
		}
	}

	@Post('')
	@UseInterceptors(FileInterceptor('file', multerOptions))
	async uploadFile(@UploadedFile() file) {
		return { url: `${this.configService.get('APP_URL')}/${file.filename}` };
	}
}


