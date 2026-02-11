import { NetworkAdapter, Offer } from "../types";
import crypto from "crypto";

export class CpxResearchAdapter implements NetworkAdapter {
  name = "CPX Research";
  slug = "cpx-research";

  private getCredentials() {
    const appId = process.env.CPX_APP_ID || "30895"; // Default fallback
    const secretKey = process.env.CPX_SECRET_KEY;
    
    if (!secretKey) {
      console.warn("CPX_SECRET_KEY is missing in environment variables.");
    }

    return { appId, secretKey };
  }

  async fetchOffers(params?: { userId: string, userIp?: string, userAgent?: string }): Promise<Offer[]> {
    const { appId } = this.getCredentials();
    
    if (!params?.userId) return [];

    try {
        // CPX API Endpoint (Corrected)
        // Documentation: https://cpx-research.github.io/api-documentation/
        const url = `https://live-api.cpx-research.com/api/get-surveys.php?app_id=${appId}&ext_user_id=${params.userId}&output_method=api&limit=20`;
        
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`CPX Fetch Warning: ${response.status} ${response.statusText} (Check Keys)`);
            return [];
        }

        const data = await response.json();
        
        // Map CPX surveys to our Offer interface
        if (Array.isArray(data)) {
            return data.map((survey: any) => ({
                id: survey.id,
                title: `Survey: ${survey.top_category_name || 'General'}`,
                description: `${survey.loi} min • ${survey.payout} points`,
                payout: parseFloat(survey.payout_usd || survey.payout) || 0,
                link: survey.link,
                network: this.slug,
                company: {
                    name: 'CPX Research',
                    logoUrl: 'https://cpx-research.com/assets/images/logo-cpx.png',
                    status: 'ACTIVE'
                }
            }));
        }
        
        // Handle "surveys" wrapper object logic if API returns { surveys: [...] }
        if (data && Array.isArray(data.surveys)) {
             return data.surveys.map((survey: any) => ({
                id: survey.id,
                title: `Survey: ${survey.top_category_name || 'General'}`,
                description: `${survey.loi} min • ${survey.payout} points`,
                payout: parseFloat(survey.payout_usd || survey.payout) || 0,
                link: survey.link,
                network: this.slug,
                company: {
                    name: 'CPX Research',
                    logoUrl: 'https://cpx-research.com/assets/images/logo-cpx.png',
                    status: 'ACTIVE'
                }
            }));
        }

        return [];
    } catch (error) {
        console.error("CPX Adapter Error:", error);
        return [];
    }
  }

  getWallUrl(userId: string, username?: string, email?: string): string {
      const { appId, secretKey } = this.getCredentials();
      
      // Hash Generation: md5(ext_user_id + "-" + secret_key)
      const secureHash = secretKey 
          ? crypto.createHash('md5').update(`${userId}-${secretKey}`).digest("hex")
          : "";

      const searchParams = new URLSearchParams({
          app_id: appId,
          ext_user_id: userId,
          secure_hash: secureHash,
          username: username || "User",
          email: email || "",
          subid_1: userId
      });

      return `https://offers.cpx-research.com/index.php?${searchParams.toString()}`;
  }

  async validatePostback(req: Request): Promise<{ isValid: boolean; data?: any; error?: string }> {
      // TODO: Implement Postback Validation Logic
      // Check signature/hash from CPX postback
      return { isValid: true };
  }
}
