import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthStorageService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.getServiceJwt();
  }

  private readonly logger = new Logger(AuthStorageService.name);

  public serviceJwt = '';

  public async getServiceJwt() {
    this.logger.log(`Get service token`);
    try {
      const { data } = await this.httpService.axiosRef.get(
        '/token/' + this.configService.get('SERVICE_NAME'),
      );
      this.logger.log(`Set service token`);
      this.serviceJwt = data.token;
      this.logger.debug(`Service token: ${data.token}`);
    } catch (err) {
      this.logger.debug(`Get service token err: ${err.message}`);
      setTimeout(() => this.getServiceJwt(), 5000);
    }
  }
}
