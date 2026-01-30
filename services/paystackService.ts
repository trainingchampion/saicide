import { TeamMember } from '../types';

const PAYSTACK_PUBLIC_KEY = 'pk_live_ed60e4f4795819681d9d81227a608c66a60c2a48';
const USD_TO_NGN = 1600;

export interface Plan {
  id: 'hobby' | 'pro' | 'enterprise';
  name: string;
  priceUSD: number;
  tokens: string;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: 'hobby',
    name: 'Hobby',
    priceUSD: 0,
    tokens: '100K',
    features: ['Standard IDE Access', 'Community Support', 'Basic AI Co-pilot']
  },
  {
    id: 'pro',
    name: 'Pro',
    priceUSD: 29,
    tokens: '1M',
    features: ['High-Intense Reasoning', 'Unlimited Deployments', 'Sentinel Security', 'Priority Support']
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceUSD: 299,
    tokens: '20M',
    features: ['Dedicated Neural Pipeline', 'Custom Security Policies', 'Audit Logs', '24/7 Human+AI Support']
  }
];

class PaystackService {
  private publicKey = PAYSTACK_PUBLIC_KEY;

  getAmount(usdAmount: number, currency: 'USD' | 'NGN'): number {
    const amount = currency === 'USD' ? usdAmount : usdAmount * USD_TO_NGN;
    // Paystack expects amounts in the smallest currency unit (cents/kobo)
    return Math.round(amount * 100);
  }

  initializePayment(params: {
    email: string;
    amountUSD: number;
    currency: 'USD' | 'NGN';
    metadata: any;
    onSuccess: (reference: string) => void;
    onCancel: () => void;
  }) {
    const amount = this.getAmount(params.amountUSD, params.currency);
    
    const handler = (window as any).PaystackPop.setup({
      key: this.publicKey,
      email: params.email,
      amount: amount,
      currency: params.currency,
      ref: `sai-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      metadata: params.metadata,
      callback: (response: { reference: string }) => {
        params.onSuccess(response.reference);
      },
      onClose: () => {
        params.onCancel();
      }
    });

    handler.openIframe();
  }

  async verifyTransaction(reference: string): Promise<boolean> {
    // In a production environment, this would call your backend which then calls Paystack
    console.log(`[Paystack] Verifying transaction: ${reference}`);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1500));
    return true; 
  }
}

export default new PaystackService();