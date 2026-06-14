import { prisma } from "@/lib/prisma";
import { NetworkAdapter, Offer } from "./types";
import { CpaLeadAdapter, AdGateAdapter, OffertoroAdapter, CpxResearchAdapter } from "./adapters";

export class NetworkManager {
  private adapters: Map<string, NetworkAdapter> = new Map();

  constructor() {
    this.registerAdapter(new CpaLeadAdapter());
    this.registerAdapter(new AdGateAdapter());
    this.registerAdapter(new OffertoroAdapter());
    this.registerAdapter(new CpxResearchAdapter());
  }

  registerAdapter(adapter: NetworkAdapter) {
    this.adapters.set(adapter.slug, adapter);
  }

  getAdapter(slug: string): NetworkAdapter | undefined {
    return this.adapters.get(slug);
  }

  async validatePostback(networkSlug: string, req: Request) {
    const adapter = this.getAdapter(networkSlug);
    if (!adapter) {
      throw new Error(`Network adapter not found for: ${networkSlug}`);
    }
    return adapter.validatePostback(req);
  }
}

export const networkManager = new NetworkManager();
