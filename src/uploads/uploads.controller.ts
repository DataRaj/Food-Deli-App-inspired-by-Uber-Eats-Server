import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/multer.config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { marshall } from '@aws-sdk/util-dynamodb';
import { Readable } from 'stream';
@Controller('uploads')
export class UploadsController {
	constructor(private readonly configService: ConfigService) {
		
	}

	@Post('aws')
	@UseInterceptors(FileInterceptor('file'))
	async uploadFileAws(@UploadedFile() file) {
		const BUCKET_NAME = this.configService.get('BUCKET_NAME');

		const s3 = new S3Client({
			region: 'your-region-here',
			credentials: {
				accessKeyId: this.configService.get('AWS_KEY'),
				secretAccessKey: this.configService.get('AWS_SECRET'),
			},
		});
		try {
			const objectName = `${Date.now()}-${file.originalname}`;
			const buffer = file.buffer;
    const stream = Readable.from(buffer);

   			 const command = new PutObjectCommand({
     		 Bucket: BUCKET_NAME,
			 Key: objectName,
			 Body: stream,
			 ContentType: file.mimetype,
     		 ACL: 'public-read',
    });
			await s3.send(command);
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


