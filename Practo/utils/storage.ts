import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, CoinTransaction, UserStats, UserInventory } from '../types';

const STORAGE_KEYS = {
  TASKS: 'daily_tasks',
  COINS: 'coin_transactions',
  STATS: 'user_stats',
  INVENTORY: 'user_inventory',
};

export const StorageService = {
  // Tasks
  async getTasks(): Promise<Task[]> {
    try {
      const tasks = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      console.log('Error getting tasks:', error);
      return [];
    }
  },

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.log('Error saving tasks:', error);
    }
  },

  // Coin Transactions
  async getCoinTransactions(): Promise<CoinTransaction[]> {
    try {
      const transactions = await AsyncStorage.getItem(STORAGE_KEYS.COINS);
      return transactions ? JSON.parse(transactions) : [];
    } catch (error) {
      console.log('Error getting coin transactions:', error);
      return [];
    }
  },

  async saveCoinTransactions(transactions: CoinTransaction[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.COINS, JSON.stringify(transactions));
    } catch (error) {
      console.log('Error saving coin transactions:', error);
    }
  },

  // User Stats
  async getUserStats(): Promise<UserStats> {
    try {
      const stats = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
      return stats ? JSON.parse(stats) : {
        totalCoins: 0,
        currentStreak: 0,
        longestStreak: 0,
        tasksCompletedToday: 0,
        tasksCompletedThisWeek: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
      };
    } catch (error) {
      console.log('Error getting user stats:', error);
      return {
        totalCoins: 0,
        currentStreak: 0,
        longestStreak: 0,
        tasksCompletedToday: 0,
        tasksCompletedThisWeek: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
      };
    }
  },

  async saveUserStats(stats: UserStats): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (error) {
      console.log('Error saving user stats:', error);
    }
  },

  // User Inventory
  async getUserInventory(): Promise<UserInventory> {
    try {
      const inventory = await AsyncStorage.getItem(STORAGE_KEYS.INVENTORY);
      return inventory ? JSON.parse(inventory) : {
        ownedItems: [],
        equippedItems: {},
      };
    } catch (error) {
      console.log('Error getting user inventory:', error);
      return {
        ownedItems: [],
        equippedItems: {},
      };
    }
  },

  async saveUserInventory(inventory: UserInventory): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
    } catch (error) {
      console.log('Error saving user inventory:', error);
    }
  },
};