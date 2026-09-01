import { Module } from '@nestjs/common';
import { HomeModule } from './home/home.module.js';


@Module({
  imports: [HomeModule],
})
export class AppModule {}

