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
    features: [
      'Code Editor with Syntax Highlighting',
      'File Explorer & Terminal',
      'Git Integration',
      '5 AI Models (Gemini Flash, GPT-4o Mini)',
      '3 AI Personas',
      'Community Support',
      'Basic Kanban Board'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    priceUSD: 29,
    tokens: '1M',
    features: [
      'Everything in Hobby',
      '25+ AI Models (Claude, GPT-4, Gemini Pro)',
      '15+ AI Personas',
      '10 External Agents (Auto-Fixer, Test Writer)',
      'Run & Debug with Breakpoints',
      'Docker Management',
      'Terraform Generator',
      'API Client (API Forge)',
      'Database Manager',
      'Unlimited Deployments',
      'Security Scanning',
      'Priority Email Support'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceUSD: 299,
    tokens: '20M',
    features: [
      'Everything in Pro',
      '55+ AI Models (All Providers)',
      '25+ AI Personas (All Categories)',
      '30 External Agents (Full Suite)',
      '33 MCP Servers',
      'Ghost Agent (Autonomous Tasks)',
      'Team Collaboration & Video Calls',
      'Live Coding Sessions',
      'Custom Security Policies',
      'Compliance (SOC2, HIPAA, GDPR)',
      'Audit Logs & Activity Feed',
      'ML Studio & UX Lab',
      'Dedicated Support (24/7)',
      'Custom Integrations'
    ]
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