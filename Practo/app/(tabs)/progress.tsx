import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { commonStyles, colors } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import { UserStats } from '../../types';
import { StorageService } from '../../utils/storage';
import { GameLogic } from '../../utils/gameLogic';

export default function ProgressScreen() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<{ day: string; completed: number }[]>([]);

  const loadData = async () => {
    try {
      const userStats = await StorageService.getUserStats();
      const weekly = await GameLogic.getWeeklyStats();
      
      setStats(userStats);
      setWeeklyStats(weekly);
    } catch (error) {
      console.log('Error loading progress data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  if (!stats) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  const maxCompleted = Math.max(...weeklyStats.map(day => day.completed), 1);

  return (
    <View style={commonStyles.container}>
      <ScrollView style={[commonStyles.content, { paddingTop: 40 }]} showsVerticalScrollIndicator={false}>
        <Text style={[commonStyles.title, { marginBottom: 20 }]}>Progress</Text>

        {/* Streak Section */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <View style={[commonStyles.row, { marginBottom: 16 }]}>
            <Icon name="flame" size={24} style={{ color: colors.accent, marginRight: 8 }} />
            <Text style={commonStyles.subtitle}>Streak Tracking</Text>
          </View>
          
          <View style={[commonStyles.row, { marginBottom: 12 }]}>
            <Text style={commonStyles.text}>Current Streak</Text>
            <Text style={[commonStyles.text, { color: colors.accent, fontWeight: '600' }]}>
              {stats.currentStreak} days
            </Text>
          </View>
          
          <View style={commonStyles.row}>
            <Text style={commonStyles.text}>Longest Streak</Text>
            <Text style={[commonStyles.text, { color: colors.accent, fontWeight: '600' }]}>
              {stats.longestStreak} days
            </Text>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <View style={[commonStyles.row, { marginBottom: 16 }]}>
            <Icon name="bar-chart" size={24} style={{ color: colors.accent, marginRight: 8 }} />
            <Text style={commonStyles.subtitle}>Weekly Overview</Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'end', height: 120 }}>
            {weeklyStats.map((day, index) => {
              const height = maxCompleted > 0 ? (day.completed / maxCompleted) * 80 : 0;
              return (
                <View key={index} style={{ alignItems: 'center', flex: 1 }}>
                  <View style={{
                    backgroundColor: day.completed > 0 ? colors.accent : colors.background,
                    width: 20,
                    height: Math.max(height, 4),
                    borderRadius: 4,
                    marginBottom: 8,
                  }} />
                  <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                    {day.day}
                  </Text>
                  <Text style={[commonStyles.textSecondary, { fontSize: 10, marginTop: 2 }]}>
                    {day.completed}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Achievement Badges */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <View style={[commonStyles.row, { marginBottom: 16 }]}>
            <Icon name="trophy" size={24} style={{ color: colors.accent, marginRight: 8 }} />
            <Text style={commonStyles.subtitle}>Achievements</Text>
          </View>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {/* First Task Achievement */}
            <View style={{
              backgroundColor: stats.tasksCompletedToday > 0 ? colors.accent : colors.background,
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              minWidth: 80,
            }}>
              <Icon 
                name="checkmark-circle" 
                size={24} 
                style={{ 
                  color: stats.tasksCompletedToday > 0 ? colors.primary : colors.textSecondary,
                  marginBottom: 4,
                }} 
              />
              <Text style={[
                commonStyles.textSecondary,
                { 
                  fontSize: 10, 
                  textAlign: 'center',
                  color: stats.tasksCompletedToday > 0 ? colors.primary : colors.textSecondary,
                }
              ]}>
                First Task
              </Text>
            </View>

            {/* 3-Day Streak Achievement */}
            <View style={{
              backgroundColor: stats.currentStreak >= 3 ? colors.accent : colors.background,
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              minWidth: 80,
            }}>
              <Icon 
                name="flame" 
                size={24} 
                style={{ 
                  color: stats.currentStreak >= 3 ? colors.primary : colors.textSecondary,
                  marginBottom: 4,
                }} 
              />
              <Text style={[
                commonStyles.textSecondary,
                { 
                  fontSize: 10, 
                  textAlign: 'center',
                  color: stats.currentStreak >= 3 ? colors.primary : colors.textSecondary,
                }
              ]}>
                3-Day Streak
              </Text>
            </View>

            {/* 100 Coins Achievement */}
            <View style={{
              backgroundColor: stats.totalCoins >= 100 ? colors.accent : colors.background,
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              minWidth: 80,
            }}>
              <Icon 
                name="diamond" 
                size={24} 
                style={{ 
                  color: stats.totalCoins >= 100 ? colors.primary : colors.textSecondary,
                  marginBottom: 4,
                }} 
              />
              <Text style={[
                commonStyles.textSecondary,
                { 
                  fontSize: 10, 
                  textAlign: 'center',
                  color: stats.totalCoins >= 100 ? colors.primary : colors.textSecondary,
                }
              ]}>
                100 Coins
              </Text>
            </View>

            {/* 7-Day Streak Achievement */}
            <View style={{
              backgroundColor: stats.currentStreak >= 7 ? colors.accent : colors.background,
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              minWidth: 80,
            }}>
              <Icon 
                name="star" 
                size={24} 
                style={{ 
                  color: stats.currentStreak >= 7 ? colors.primary : colors.textSecondary,
                  marginBottom: 4,
                }} 
              />
              <Text style={[
                commonStyles.textSecondary,
                { 
                  fontSize: 10, 
                  textAlign: 'center',
                  color: stats.currentStreak >= 7 ? colors.primary : colors.textSecondary,
                }
              ]}>
                Week Warrior
              </Text>
            </View>
          </View>
        </View>

        {/* Statistics Summary */}
        <View style={[commonStyles.card, { marginBottom: 40 }]}>
          <View style={[commonStyles.row, { marginBottom: 16 }]}>
            <Icon name="analytics" size={24} style={{ color: colors.accent, marginRight: 8 }} />
            <Text style={commonStyles.subtitle}>Statistics</Text>
          </View>
          
          <View style={[commonStyles.row, { marginBottom: 8 }]}>
            <Text style={commonStyles.text}>Total Coins Earned</Text>
            <Text style={[commonStyles.text, { color: colors.accent }]}>
              {stats.totalCoins}
            </Text>
          </View>
          
          <View style={[commonStyles.row, { marginBottom: 8 }]}>
            <Text style={commonStyles.text}>Tasks Completed Today</Text>
            <Text style={[commonStyles.text, { color: colors.accent }]}>
              {stats.tasksCompletedToday}
            </Text>
          </View>
          
          <View style={commonStyles.row}>
            <Text style={commonStyles.text}>Last Active</Text>
            <Text style={[commonStyles.text, { color: colors.accent }]}>
              {new Date(stats.lastActiveDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}