import { DynamicModule, Global, Module } from '@nestjs/common';
import { IJwt } from './jwt.interface';
import { JwtService } from './jwt.service';

@Module({})
@Global()
export class JwtModule {
  static forRoot(params: IJwt): DynamicModule {
    return {
      module: JwtModule,
      providers: [
        {
          provide: 'JWT',
          useValue: params,
        },
        JwtService,
      ],
      exports: [JwtService],
    };
  }
}
