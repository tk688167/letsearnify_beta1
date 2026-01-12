import { NetworkAdapter, Offer } from "./types";

export class AdGateAdapter implements NetworkAdapter {
  name = "AdGate Media";
  slug = "adgate";

  async fetchOffers(params?: any): Promise<Offer[]> {
    return [];
  }

  async validatePostback(req: any): Promise<{ isValid: boolean; data?: any; error?: string }> {
    return { isValid: true };
  }
}
