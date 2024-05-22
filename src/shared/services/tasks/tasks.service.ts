import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AuthStorageService } from '../storage/auth-storage.service';

@Injectable()
export class TasksService {
  constructor(private authStorageService: AuthStorageService) {}

  private readonly logger = new Logger(TasksService.name);

  @Cron('*/45 * * * *')
  async handleCron() {
    this.logger.log(`Renew service token`);
    await this.authStorageService.getServiceJwt();
  }
}
