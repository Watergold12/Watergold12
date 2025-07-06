import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { commonStyles, colors } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import { ShopItem, UserInventory } from '../../types';
import { StorageService } from '../../utils/storage';

// Same items as shop for reference
const ALL_ITEMS: ShopItem[] = [
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

export default function ClosetScreen() {
  const [inventory, setInventory] = useState<UserInventory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'clothing' | 'accessory' | 'background'>('clothing');

  const loadData = async () => {
    try {
      const userInventory = await StorageService.getUserInventory();
      setInventory(userInventory);
    } catch (error) {
      console.log('Error loading closet data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const equipItem = async (itemId: string, category: 'clothing' | 'accessory' | 'background') => {
    if (!inventory) return;

    const updatedInventory = {
      ...inventory,
      equippedItems: {
        ...inventory.equippedItems,
        [category]: inventory.equippedItems[category] === itemId ? undefined : itemId,
      },
    };

    await StorageService.saveUserInventory(updatedInventory);
    setInventory(updatedInventory);
    
    const item = ALL_ITEMS.find(i => i.id === itemId);
    console.log(`${inventory.equippedItems[category] === itemId ? 'Unequipped' : 'Equipped'} ${item?.name}`);
  };

  const getOwnedItems = () => {
    if (!inventory) return [];
    
    return ALL_ITEMS.filter(item => 
      inventory.ownedItems.includes(item.id) && item.category === selectedCategory
    );
  };

  const categories = [
    { key: 'clothing', label: 'Clothing', icon: 'shirt-outline' },
    { key: 'accessory', label: 'Accessories', icon: 'glasses-outline' },
    { key: 'background', label: 'Backgrounds', icon: 'image-outline' },
  ] as const;

  if (!inventory) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  const ownedItems = getOwnedItems();

  return (
    <View style={commonStyles.container}>
      <View style={[commonStyles.content, { paddingTop: 40 }]}>
        <Text style={[commonStyles.title, { marginBottom: 20 }]}>Closet</Text>

        {/* Character Preview */}
        <View style={[commonStyles.card, { marginBottom: 20, alignItems: 'center', padding: 30 }]}>
          <View style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Icon name="person" size={60} style={{ color: colors.accent }} />
          </View>
          
          <Text style={[commonStyles.subtitle, { marginBottom: 8 }]}>Your Character</Text>
          
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {Object.entries(inventory.equippedItems).map(([category, itemId]) => {
              if (!itemId) return null;
              const item = ALL_ITEMS.find(i => i.id === itemId);
              return (
                <View key={category} style={{
                  backgroundColor: colors.accent,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}>
                  <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '500' }}>
                    {item?.name}
                  </Text>
                </View>
              );
            })}
          </View>
          
          {Object.keys(inventory.equippedItems).length === 0 && (
            <Text style={commonStyles.textSecondary}>No items equipped</Text>
          )}
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

        {/* Owned Items */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {ownedItems.length === 0 ? (
            <View style={[commonStyles.card, { alignItems: 'center', padding: 40 }]}>
              <Icon name="shirt-outline" size={48} style={{ color: colors.textSecondary, marginBottom: 12 }} />
              <Text style={commonStyles.textSecondary}>No {selectedCategory} items yet</Text>
              <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 8 }]}>
                Visit the shop to buy some items!
              </Text>
            </View>
          ) : (
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              paddingBottom: 20,
            }}>
              {ownedItems.map((item) => {
                const isEquipped = inventory.equippedItems[item.category] === item.id;
                
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      commonStyles.card,
                      {
                        width: '48%',
                        marginBottom: 16,
                        marginHorizontal: 0,
                        borderWidth: isEquipped ? 2 : 0,
                        borderColor: isEquipped ? colors.accent : 'transparent',
                      }
                    ]}
                    onPress={() => equipItem(item.id, item.category)}
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
                    
                    <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
                      {item.name}
                    </Text>
                    
                    <View style={{
                      backgroundColor: isEquipped ? colors.accent : colors.background,
                      paddingVertical: 6,
                      borderRadius: 6,
                      alignItems: 'center',
                    }}>
                      <Text style={{
                        color: isEquipped ? colors.primary : colors.textSecondary,
                        fontWeight: '500',
                        fontSize: 12,
                      }}>
                        {isEquipped ? 'Equipped' : 'Tap to Equip'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}