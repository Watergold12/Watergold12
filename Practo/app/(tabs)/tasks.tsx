import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { commonStyles, colors } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import { Task } from '../../types';
import { StorageService } from '../../utils/storage';
import { GameLogic } from '../../utils/gameLogic';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [totalCoins, setTotalCoins] = useState(0);
  const [showAddTask, setShowAddTask] = useState(false);

  const loadData = async () => {
    try {
      // Check if tasks need to be reset
      const stats = await StorageService.getUserStats();
      if (GameLogic.shouldResetTasks(stats.lastActiveDate)) {
        console.log('Resetting daily tasks...');
        const resetTasks = await GameLogic.resetDailyTasks();
        setTasks(resetTasks);
      } else {
        const loadedTasks = await StorageService.getTasks();
        setTasks(loadedTasks);
      }

      // Load current coin balance
      const currentStats = await StorageService.getUserStats();
      setTotalCoins(currentStats.totalCoins);
    } catch (error) {
      console.log('Error loading tasks data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const addTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    await StorageService.saveTasks(updatedTasks);
    
    setNewTaskTitle('');
    setShowAddTask(false);
    console.log('Added new task:', newTask.title);
  };

  const toggleTask = async (taskId: string) => {
    try {
      const result = await GameLogic.toggleTaskCompletion(taskId);
      
      // Update local state
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? result.task : task
      );
      setTasks(updatedTasks);
      
      // Update coin display
      setTotalCoins(prev => prev + result.coinsChanged);
      
      // Show feedback
      if (result.coinsChanged > 0) {
        console.log(`Task completed! +${result.coinsChanged} coins`);
      } else if (result.coinsChanged < 0) {
        console.log(`Task unchecked! ${result.coinsChanged} coins`);
      }
    } catch (error) {
      console.log('Error toggling task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const deleteTask = async (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            setTasks(updatedTasks);
            await StorageService.saveTasks(updatedTasks);
            console.log('Deleted task:', taskId);
          },
        },
      ]
    );
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <View style={[commonStyles.content, { paddingTop: 40 }]}>
        <View style={[commonStyles.row, { marginBottom: 20 }]}>
          <Text style={commonStyles.title}>Daily Tasks</Text>
          <View style={commonStyles.coinBadge}>
            <Icon name="diamond" size={16} style={{ color: colors.primary }} />
            <Text style={commonStyles.coinText}>{totalCoins}</Text>
          </View>
        </View>

        {/* Progress Summary */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <View style={commonStyles.row}>
            <Text style={commonStyles.text}>Today&apos;s Progress</Text>
            <Text style={[commonStyles.text, { color: colors.accent }]}>
              {completedTasks}/{totalTasks}
            </Text>
          </View>
          <View style={{
            backgroundColor: colors.background,
            height: 8,
            borderRadius: 4,
            marginTop: 8,
            overflow: 'hidden',
          }}>
            <View style={{
              backgroundColor: colors.accent,
              height: '100%',
              width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%',
              borderRadius: 4,
            }} />
          </View>
        </View>

        {/* Tasks List */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {tasks.map((task) => (
            <View key={task.id} style={commonStyles.card}>
              <View style={commonStyles.row}>
                <TouchableOpacity
                  style={[commonStyles.row, { flex: 1 }]}
                  onPress={() => toggleTask(task.id)}
                >
                  <Icon
                    name={task.completed ? "checkmark-circle" : "ellipse-outline"}
                    size={24}
                    style={{
                      color: task.completed ? colors.accent : colors.textSecondary,
                      marginRight: 12,
                    }}
                  />
                  <Text style={[
                    commonStyles.text,
                    {
                      flex: 1,
                      textDecorationLine: task.completed ? 'line-through' : 'none',
                      opacity: task.completed ? 0.7 : 1,
                    }
                  ]}>
                    {task.title}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteTask(task.id)}
                  style={{ padding: 8 }}
                >
                  <Icon name="trash-outline" size={20} style={{ color: '#FF6B6B' }} />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Add Task Section */}
          {showAddTask ? (
            <View style={[commonStyles.card, { marginTop: 10 }]}>
              <TextInput
                style={{
                  backgroundColor: colors.background,
                  color: colors.text,
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 12,
                  fontSize: 16,
                }}
                placeholder="Enter task title..."
                placeholderTextColor={colors.textSecondary}
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                autoFocus
              />
              <View style={[commonStyles.row, { gap: 10 }]}>
                <Button
                  text="Cancel"
                  onPress={() => {
                    setShowAddTask(false);
                    setNewTaskTitle('');
                  }}
                  style={[{ flex: 1, backgroundColor: colors.background }]}
                />
                <Button
                  text="Add Task"
                  onPress={addTask}
                  style={[{ flex: 1 }]}
                />
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                commonStyles.card,
                {
                  marginTop: 10,
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  borderColor: colors.accent,
                  backgroundColor: 'transparent',
                }
              ]}
              onPress={() => setShowAddTask(true)}
            >
              <View style={[commonStyles.row, commonStyles.center]}>
                <Icon name="add-circle-outline" size={24} style={{ color: colors.accent, marginRight: 8 }} />
                <Text style={[commonStyles.text, { color: colors.accent }]}>Add New Task</Text>
              </View>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </View>
  );
}