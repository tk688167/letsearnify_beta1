import { NetworkAdapter, Offer } from "./types";

export class OffertoroAdapter implements NetworkAdapter {
  name = "Offertoro";
  slug = "offertoro";

  async fetchOffers(params?: any): Promise<Offer[]> {
    return [];
  }

  async validatePostback(req: any): Promise<{ isValid: boolean; data?: any; error?: string }> {
    return { isValid: true };
  }
}
