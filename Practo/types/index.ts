export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  lastCompletedAt?: string;
}

export interface CoinTransaction {
  id: string;
  amount: number;
  reason: string;
  timestamp: string;
  taskId?: string;
}

export interface UserStats {
  totalCoins: number;
  currentStreak: number;
  longestStreak: number;
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  lastActiveDate: string;
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  category: 'clothing' | 'accessory' | 'background';
  imageUrl: string;
  owned: boolean;
}

export interface UserInventory {
  ownedItems: string[];
  equippedItems: {
    clothing?: string;
    accessory?: string;
    background?: string;
  };
}