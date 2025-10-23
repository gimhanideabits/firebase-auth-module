import { Injectable } from '@nestjs/common';

@Injectable()
export class DomainConfigService {
  private readonly allowedDomains = ['abc.com', 'bdc.com'];

  getAllowedDomains(): string[] {
    return [...this.allowedDomains];
  }

  isDomainAllowed(domain: string): boolean {
    return this.allowedDomains.includes(domain);
  }

  validateDomain(domain: string): string {
    if (!this.isDomainAllowed(domain)) {
      throw new Error(`Domain ${domain} is not allowed`);
    }
    return domain;
  }

  extractDomainFromOrigin(origin: string): string | null {
    if (!origin) return null;
    
    try {
      const url = new URL(origin.startsWith('http') ? origin : `https://${origin}`);
      const hostname = url.hostname;
      
      for (const domain of this.allowedDomains) {
        if (hostname === domain || hostname.endsWith(`.${domain}`)) {
          return domain;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
}
