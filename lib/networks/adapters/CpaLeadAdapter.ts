import { NetworkAdapter, Offer } from "../types";

export class CpaLeadAdapter implements NetworkAdapter {
  name = "CPA Lead";
  slug = "cpalead";

  async fetchOffers(params?: any): Promise<Offer[]> {
    // TODO: Implement actual API call
    return [];
  }

  async validatePostback(req: any): Promise<{ isValid: boolean; data?: any; error?: string }> {
    // TODO: Implement actual validation
    return { isValid: true };
  }
}
