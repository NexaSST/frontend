export interface PricingTier {
  id: string;
  code: string;
  name: string;
  monthlyPriceCents: number;
  quotaMetric: string | null;
  quotaLimit: number | null;
  includedDescription: string;
  status: "active" | "inactive";
  sortOrder: number;
}
export interface CommercialModule {
  code: string;
  name: string;
  description: string | null;
  commercialStatus: "available" | "inactive" | "future";
  sortOrder: number;
  pricingTiers: PricingTier[];
}
export interface ComboOffer {
  id: string;
  code: string;
  name: string;
  description: string;
  listPriceCents: number;
  monthlyPriceCents: number;
  status: "active" | "inactive";
  sortOrder: number;
  moduleCodes: string[];
}
export interface CommercialCatalog { modules: CommercialModule[]; combos: ComboOffer[] }
