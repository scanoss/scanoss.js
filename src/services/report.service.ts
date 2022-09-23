import { BaseService } from './base.service';

class ReportService extends BaseService {
  public async getSummary(args: string | null = null): Promise<any> {
    return this.response({});
  }

  public async detected(args: string | null = null): Promise<any> {
    return this.response({  });
  }

  public async identified(): Promise<any> {
    const response = {}
    return this.response(response);
  }
}

export const reportService = new ReportService();
