export interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  duration_unit: 'day' | 'month' | 'year';
  features: string[];
  is_active: boolean;
  package_type: 'all_access' | 'combo' | 'single';
  subjects: string[];
  yearly_discount_percentage: number;
  additional_child_discount_percentage: number;
}

export interface PricingCard {
  title: string;
  description: string;
  subjects: string[];
  monthlyPrice: number;
  yearlyPrice: number;
  type: 'all_access' | 'combo' | 'single';
  isSelected: boolean;
  yearlyDiscountPercentage: number;
  additionalChildDiscountPercentage: number;
}
