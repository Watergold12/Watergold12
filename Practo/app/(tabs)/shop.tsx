import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { commonStyles, colors } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import { ShopItem, UserStats, UserInventory } from '../../types';
import { StorageService } from '../../utils/storage';
import { GameLogic } from '../../utils/gameLogic';

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'hat_1',
    name: 'Cool Cap',
    price: 50,
    category: 'clothing',
    imageUrl: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=200&h=200&fit=crop',
    owned: false,
  },
  {
    id: 'shirt_1',
    name: 'Casual Shirt',
    price: 75,
    category: 'clothing',
    imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=200&h=200&fit=crop',
    owned: false,
  },
  {
    id: 'glasses_1',
    name: 'Stylish Glasses',
    price: 40,
    category: 'accessory',
    imageUrl: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=200&h=200&fit=crop',
    owned: false,
  },
  {
    id: 'watch_1',
    name: 'Smart Watch',
    price: 120,
    category: 'accessory',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
    owned: false,
  },
  {
    id: 'bg_1',
    name: 'Forest Background',
    price: 100,
    category: 'background',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop',
    owned: false,
  },
  {
    id: 'bg_2',
    name: 'City Background',
    price: 100,
    category: 'background',
    imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200&h=200&fit=crop',
    owned: false,
  },
  {
    id: 'hat_2',
    name: 'Beanie',
    price: 35,
    category: 'clothing',
    imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=200&h=200&fit=crop',
    owned: false,
  },
  {
    id: 'accessory_1',
    name: 'Gold Chain',
    price: 80,
    category: 'accessory',
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop',
    owned: false,
  },
];

export default function ShopScreen() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [inventory, setInventory] = useState<UserInventory | null>(null);
  const [shopItems, setShopItems] = useState<ShopItem[]>(SHOP_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'clothing' | 'accessory' | 'background'>('all');

  const loadData = async () => {
    try {
      const userStats = await StorageService.getUserStats();
      const userInventory = await StorageService.getUserInventory();
      
      setStats(userStats);
      setInventory(userInventory);
      
      // Update shop items with ownership status
      const updatedItems = SHOP_ITEMS.map(item => ({
        ...item,
        owned: userInventory.ownedItems.includes(item.id),
      }));
      setShopItems(updatedItems);
    } catch (error) {
      console.log('Error loading shop data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const buyItem = async (item: ShopItem) => {
    if (!stats || !inventory) return;

    if (stats.totalCoins < item.price) {
      Alert.alert('Insufficient Coins', `You need ${item.price} coins to buy this item. You have ${stats.totalCoins} coins.`);
      return;
    }

    if (item.owned) {
      Alert.alert('Already Owned', 'You already own this item!');
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `Buy ${item.name} for ${item.price} coins?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy',
          onPress: async () => {
            try {
              // Deduct coins
              await GameLogic.deductCoins(item.price, `Purchased ${item.name}`);
              
              // Add item to inventory
              const updatedInventory = {
                ...inventory,
                ownedItems: [...inventory.ownedItems, item.id],
              };
              await StorageService.saveUserInventory(updatedInventory);
              
              // Refresh data
              await loadData();
              
              Alert.alert('Purchase Successful!', `You bought ${item.name}!`);
              console.log(`Purchased ${item.name} for ${item.price} coins`);
            } catch (error) {
              console.log('Error purchasing item:', error);
              Alert.alert('Error', 'Failed to purchase item');
            }
          },
        },
      ]
    );
  };

  const filteredItems = selectedCategory === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.category === selectedCategory);

  const categories = [
    { key: 'all', label: 'All', icon: 'grid-outline' },
    { key: 'clothing', label: 'Clothing', icon: 'shirt-outline' },
    { key: 'accessory', label: 'Accessories', icon: 'glasses-outline' },
    { key: 'background', label: 'Backgrounds', icon: 'image-outline' },
  ] as const;

  if (!stats || !inventory) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={[commonStyles.content, { paddingTop: 40 }]}>
        {/* Header */}
        <View style={[commonStyles.row, { marginBottom: 20 }]}>
          <Text style={commonStyles.title}>Shop</Text>
          <View style={commonStyles.coinBadge}>
            <Icon name="diamond" size={16} style={{ color: colors.primary }} />
            <Text style={commonStyles.coinText}>{stats.totalCoins}</Text>
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={{
                backgroundColor: selectedCategory === category.key ? colors.accent : colors.card,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 12,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Icon
                name={category.icon}
                size={16}
                style={{
                  color: selectedCategory === category.key ? colors.primary : colors.text,
                  marginRight: 6,
                }}
              />
              <Text style={{
                color: selectedCategory === category.key ? colors.primary : colors.text,
                fontWeight: '500',
                fontSize: 14,
              }}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Shop Items Grid */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            paddingBottom: 20,
          }}>
            {filteredItems.map((item) => (
              <View
                key={item.id}
                style={[
                  commonStyles.card,
                  {
                    width: '48%',
                    marginBottom: 16,
                    marginHorizontal: 0,
                  }
                ]}
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  style={{
                    width: '100%',
                    height: 100,
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                  resizeMode="cover"
                />
                
                <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
                  {item.name}
                </Text>
                
                <View style={[commonStyles.row, { marginBottom: 12 }]}>
                  <Icon name="diamond" size={14} style={{ color: colors.accent, marginRight: 4 }} />
                  <Text style={[commonStyles.textSecondary, { fontSize: 14 }]}>
                    {item.price}
                  </Text>
                </View>

                {item.owned ? (
                  <View style={{
                    backgroundColor: colors.background,
                    paddingVertical: 8,
                    borderRadius: 6,
                    alignItems: 'center',
                  }}>
                    <Text style={[commonStyles.textSecondary, { fontSize: 14 }]}>Owned</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={{
                      backgroundColor: stats.totalCoins >= item.price ? colors.accent : colors.background,
                      paddingVertical: 8,
                      borderRadius: 6,
                      alignItems: 'center',
                    }}
                    onPress={() => buyItem(item)}
                    disabled={stats.totalCoins < item.price}
                  >
                    <Text style={{
                      color: stats.totalCoins >= item.price ? colors.primary : colors.textSecondary,
                      fontWeight: '600',
                      fontSize: 14,
                    }}>
                      {stats.totalCoins >= item.price ? 'Buy' : 'Not enough coins'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}