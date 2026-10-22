export type ProductCategory =
  | 'ebook'
  | 'formation'
  | 'logiciel'
  | 'template'
  | 'coaching'
  | 'bundle'
  | 'audio'
  | 'video'
  | 'design'
  | 'autre';

export type MethodCategory =
  | 'paid'
  | 'organic'
  | 'email'
  | 'partnership'
  | 'webinar'
  | 'affiliate'
  | 'social';

export interface Product {
  id: string;
  title: string;
  creator: string;
  description: string;
  category: ProductCategory;
  price: number;
  currency: string;
  image_url: string;
  chariow_url: string;
  traffic_score: number;
  sales_estimate: number;
  rating: number;
  tags: string[];
  spotted_at: string;
  created_at: string;
  updated_at: string;
}

export interface SalesMethod {
  id: string;
  name: string;
  category: MethodCategory;
  icon: string;
  description: string;
  created_at: string;
}

export interface ProductMethod {
  id: string;
  product_id: string;
  method_id: string;
  traffic_contribution: number;
  notes: string;
  created_at: string;
  method?: SalesMethod;
}

export interface ProductWithMethods extends Product {
  product_methods?: ProductMethod[];
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  ebook: 'E-book',
  formation: 'Formation',
  logiciel: 'Logiciel',
  template: 'Template',
  coaching: 'Coaching',
  bundle: 'Pack',
  audio: 'Audio',
  video: 'Vidéo',
  design: 'Design',
  autre: 'Autre',
};

export const CATEGORY_COLORS: Record<ProductCategory, string> = {
  ebook: 'bg-amber-100 text-amber-700 border-amber-200',
  formation: 'bg-blue-100 text-blue-700 border-blue-200',
  logiciel: 'bg-violet-100 text-violet-700 border-violet-200',
  template: 'bg-pink-100 text-pink-700 border-pink-200',
  coaching: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  bundle: 'bg-orange-100 text-orange-700 border-orange-200',
  audio: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  video: 'bg-rose-100 text-rose-700 border-rose-200',
  design: 'bg-teal-100 text-teal-700 border-teal-200',
  autre: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const METHOD_CATEGORY_LABELS: Record<MethodCategory, string> = {
  paid: 'Payant',
  organic: 'Organique',
  email: 'Email',
  partnership: 'Partenariat',
  webinar: 'Webinaire',
  affiliate: 'Affiliation',
  social: 'Social',
};

export const METHOD_CATEGORY_COLORS: Record<MethodCategory, string> = {
  paid: 'bg-red-100 text-red-700 border-red-200',
  organic: 'bg-green-100 text-green-700 border-green-200',
  email: 'bg-blue-100 text-blue-700 border-blue-200',
  partnership: 'bg-purple-100 text-purple-700 border-purple-200',
  webinar: 'bg-orange-100 text-orange-700 border-orange-200',
  affiliate: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  social: 'bg-pink-100 text-pink-700 border-pink-200',
};
