export interface Offer {
  id: string;
  title: string;
  description: string;
  payout: number;
  link: string;
  network: string;
  category?: string;
  platform?: string; // mobile, desktop, etc.
  country?: string[];
}

export interface NetworkAdapter {
  name: string;
  slug: string;
  fetchOffers(params?: any): Promise<Offer[]>;
  validatePostback(req: Request): Promise<{ isValid: boolean; data?: any; error?: string }>;
}
