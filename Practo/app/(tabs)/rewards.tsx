import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { commonStyles, colors } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import { CoinTransaction, UserStats } from '../../types';
import { StorageService } from '../../utils/storage';

export default function RewardsScreen() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);

  const loadData = async () => {
    try {
      const userStats = await StorageService.getUserStats();
      const coinTransactions = await StorageService.getCoinTransactions();
      
      setStats(userStats);
      // Show most recent transactions first
      setTransactions(coinTransactions.reverse());
    } catch (error) {
      console.log('Error loading rewards data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTransaction = ({ item }: { item: CoinTransaction }) => (
    <View style={[commonStyles.card, { marginHorizontal: 0, marginVertical: 4 }]}>
      <View style={commonStyles.row}>
        <View style={{ flex: 1 }}>
          <Text style={commonStyles.text}>{item.reason}</Text>
          <Text style={commonStyles.textSecondary}>{formatDate(item.timestamp)}</Text>
        </View>
        <View style={[commonStyles.row, { alignItems: 'center' }]}>
          <Icon
            name={item.amount > 0 ? "add-circle" : "remove-circle"}
            size={20}
            style={{
              color: item.amount > 0 ? colors.accent : '#FF6B6B',
              marginRight: 8,
            }}
          />
          <Text style={[
            commonStyles.text,
            {
              color: item.amount > 0 ? colors.accent : '#FF6B6B',
              fontWeight: '600',
            }
          ]}>
            {item.amount > 0 ? '+' : ''}{item.amount}
          </Text>
        </View>
      </View>
    </View>
  );

  if (!stats) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={[commonStyles.content, { paddingTop: 40 }]}>
        <Text style={[commonStyles.title, { marginBottom: 20 }]}>Rewards</Text>

        {/* Coin Balance */}
        <View style={[commonStyles.card, { marginBottom: 20, alignItems: 'center' }]}>
          <Icon name="diamond" size={48} style={{ color: colors.accent, marginBottom: 12 }} />
          <Text style={[commonStyles.title, { color: colors.accent, marginBottom: 4 }]}>
            {stats.totalCoins}
          </Text>
          <Text style={commonStyles.textSecondary}>Total Coins</Text>
        </View>

        {/* Stats Grid */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <View style={[commonStyles.card, { flex: 1, alignItems: 'center' }]}>
            <Text style={[commonStyles.subtitle, { color: colors.accent }]}>
              {stats.currentStreak}
            </Text>
            <Text style={commonStyles.textSecondary}>Current Streak</Text>
          </View>
          <View style={[commonStyles.card, { flex: 1, alignItems: 'center' }]}>
            <Text style={[commonStyles.subtitle, { color: colors.accent }]}>
              {stats.longestStreak}
            </Text>
            <Text style={commonStyles.textSecondary}>Best Streak</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <View style={[commonStyles.card, { flex: 1, alignItems: 'center' }]}>
            <Text style={[commonStyles.subtitle, { color: colors.accent }]}>
              {stats.tasksCompletedToday}
            </Text>
            <Text style={commonStyles.textSecondary}>Today</Text>
          </View>
          <View style={[commonStyles.card, { flex: 1, alignItems: 'center' }]}>
            <Text style={[commonStyles.subtitle, { color: colors.accent }]}>
              {stats.tasksCompletedThisWeek}
            </Text>
            <Text style={commonStyles.textSecondary}>This Week</Text>
          </View>
        </View>

        {/* Transaction History */}
        <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>Recent Activity</Text>
        
        <FlatList
          data={transactions.slice(0, 20)} // Show last 20 transactions
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={[commonStyles.card, { alignItems: 'center', padding: 40 }]}>
              <Icon name="receipt-outline" size={48} style={{ color: colors.textSecondary, marginBottom: 12 }} />
              <Text style={commonStyles.textSecondary}>No transactions yet</Text>
              <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 8 }]}>
                Complete tasks to start earning coins!
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}