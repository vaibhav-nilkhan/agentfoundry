import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ValidationService {
  private validatorUrl: string;

  constructor(private configService: ConfigService) {
    this.validatorUrl =
      this.configService.get<string>('VALIDATOR_URL') || 'http://localhost:5000';
  }

  async validateSkill(validationData: { manifest: any; code: string }) {
    try {
      const response = await axios.post(
        `${this.validatorUrl}/api/v1/validate/skill`,
        validationData
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException('Validation service unavailable', 503);
    }
  }
}
