import { DynamicModule, Global, Module } from '@nestjs/common';
import { IMail } from './mail.interface';
import { MailService } from './mail.service';

@Module({})
@Global()
export class MailModule {
  static forRoot(params: IMail): DynamicModule {
    return {
      module: MailModule,
      providers: [
        {
          provide: 'MAIL',
          useValue: params,
        },
        MailService,
      ],
      exports: [MailService],
    };
  }
}
