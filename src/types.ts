export type CategoryType = 'All' | 'Stickers' | 'Badge Pins' | 'Flowers' | 'Other Crafts' | string;

export interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  status: 'Available' | 'Pre-Order' | 'Sold Out' | 'Limited';
  tag?: string; // e.g., 'Handmade 💕', 'Best Seller 🔥', 'New ✨', 'Cute Pick 🌸'
  featured?: boolean;
  createdAt: number;
}

export interface SocialLink {
  id: string;
  platform: 'Instagram' | 'Facebook' | 'TikTok' | 'Messenger' | 'Custom';
  url: string;
  iconName?: string;
}

export interface StoreSettings {
  storeName: string;
  ownerName: string; // e.g. "by Vcre8tives"
  tagline: string;
  logoUrl: string; // base64 or URL
  adminPin: string;
  currency: string;
  socialLinks: SocialLink[];
  categories: string[];
  contactMessenger: string;
  contactInstagram: string;
  contactFacebook: string;
  contactTikTok: string;
}
