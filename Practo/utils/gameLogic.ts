import { Task, CoinTransaction, UserStats } from '../types';
import { StorageService } from './storage';

export const GameLogic = {
  // Check if tasks need to be reset (every 24 hours)
  shouldResetTasks(lastActiveDate: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return lastActiveDate !== today;
  },

  // Reset all tasks to incomplete
  async resetDailyTasks(): Promise<Task[]> {
    const tasks = await StorageService.getTasks();
    const resetTasks = tasks.map(task => ({
      ...task,
      completed: false,
    }));
    await StorageService.saveTasks(resetTasks);
    return resetTasks;
  },

  // Add coins for completing a task
  async addCoins(amount: number, reason: string, taskId?: string): Promise<void> {
    const transactions = await StorageService.getCoinTransactions();
    const stats = await StorageService.getUserStats();

    const newTransaction: CoinTransaction = {
      id: Date.now().toString(),
      amount,
      reason,
      timestamp: new Date().toISOString(),
      taskId,
    };

    transactions.push(newTransaction);
    stats.totalCoins += amount;

    await StorageService.saveCoinTransactions(transactions);
    await StorageService.saveUserStats(stats);
    
    console.log(`Added ${amount} coins for: ${reason}`);
  },

  // Deduct coins for unchecking a task
  async deductCoins(amount: number, reason: string, taskId?: string): Promise<void> {
    const transactions = await StorageService.getCoinTransactions();
    const stats = await StorageService.getUserStats();

    const newTransaction: CoinTransaction = {
      id: Date.now().toString(),
      amount: -amount,
      reason,
      timestamp: new Date().toISOString(),
      taskId,
    };

    transactions.push(newTransaction);
    stats.totalCoins = Math.max(0, stats.totalCoins - amount);

    await StorageService.saveCoinTransactions(transactions);
    await StorageService.saveUserStats(stats);
    
    console.log(`Deducted ${amount} coins for: ${reason}`);
  },

  // Update task completion status
  async toggleTaskCompletion(taskId: string): Promise<{ task: Task; coinsChanged: number }> {
    const tasks = await StorageService.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const task = tasks[taskIndex];
    const wasCompleted = task.completed;
    
    // Toggle completion status
    task.completed = !task.completed;
    task.lastCompletedAt = task.completed ? new Date().toISOString() : undefined;

    // Update tasks
    await StorageService.saveTasks(tasks);

    // Handle coin logic
    let coinsChanged = 0;
    if (task.completed && !wasCompleted) {
      // Task was just completed - add coins
      await this.addCoins(5, `Completed task: ${task.title}`, taskId);
      coinsChanged = 5;
    } else if (!task.completed && wasCompleted) {
      // Task was unchecked - deduct coins
      await this.deductCoins(5, `Unchecked task: ${task.title}`, taskId);
      coinsChanged = -5;
    }

    // Update daily stats
    await this.updateDailyStats();

    return { task, coinsChanged };
  },

  // Update daily statistics
  async updateDailyStats(): Promise<void> {
    const tasks = await StorageService.getTasks();
    const stats = await StorageService.getUserStats();
    const today = new Date().toISOString().split('T')[0];

    // Count completed tasks today
    const completedToday = tasks.filter(task => task.completed).length;
    stats.tasksCompletedToday = completedToday;

    // Update streak logic
    if (completedToday > 0 && stats.lastActiveDate !== today) {
      // Check if yesterday had completed tasks to maintain streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (stats.lastActiveDate === yesterdayStr) {
        stats.currentStreak += 1;
      } else {
        stats.currentStreak = 1; // Reset streak
      }
      
      stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
    }

    stats.lastActiveDate = today;
    await StorageService.saveUserStats(stats);
  },

  // Get weekly completion stats
  async getWeeklyStats(): Promise<{ day: string; completed: number }[]> {
    const tasks = await StorageService.getTasks();
    const transactions = await StorageService.getCoinTransactions();
    
    // Get last 7 days
    const weekStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Count task completions for this day
      const dayTransactions = transactions.filter(t => 
        t.timestamp.startsWith(dateStr) && 
        t.amount > 0 && 
        t.taskId
      );
      
      weekStats.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: dayTransactions.length,
      });
    }
    
    return weekStats;
  },
};