import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Detective } from '@/src/data/detectives';
import { getSelectedDetectiveId } from '@/src/storage/detectiveSelection';
import { getDetectives } from '@/src/storage/detectives';
import { shopItems, ShopItem, ShopItemCategory } from '@/src/data/shopItems';
import { buyShopItem, equipShopItem, getEquippedItems, getUnlockedItemIds } from '@/src/storage/shop';

function getInitials(name?: string): string {
  if (!name) return 'D';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
  return (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase();
}

export default function ShopScreen() {
  const [detective, setDetective] = useState<Detective | undefined>(undefined);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [equipped, setEquipped] = useState<{ avatarId: string; borderId: string }>({
    avatarId: 'avatar-classic',
    borderId: 'border-default',
  });
  const [selectedTab, setSelectedTab] = useState<'all' | 'avatar' | 'border'>('all');

  useEffect(() => {
    let isMounted = true;

    async function loadShopData() {
      try {
        const selectedId = await getSelectedDetectiveId();
        if (selectedId) {
          const list = await getDetectives();
          const d = list.find((item) => item.id === selectedId);
          if (isMounted && d) setDetective(d);

          const unlocked = await getUnlockedItemIds(selectedId);
          const eq = await getEquippedItems(selectedId);
          if (isMounted) {
            setUnlockedIds(unlocked);
            setEquipped(eq);
          }
        }

      } catch (e) {
        console.log(e);
      }
    }

    loadShopData();

    return () => {
      isMounted = false;
    };
  }, []);

  const triggerFeedback = () => {
    Vibration.vibrate(50);
  };

  const handleBuy = async (item: ShopItem) => {
    if (!detective) return;

    if (detective.points < item.cost) {
      Alert.alert('Pontos Insuficientes', `Você precisa de mais ${item.cost - detective.points} Pts para desbloquear "${item.name}".`);
      return;
    }

    Alert.alert(
      'Confirmar Compra',
      `Deseja gastar ${item.cost} Pts para desbloquear "${item.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desbloquear',
          onPress: async () => {
            triggerFeedback();
            const res = await buyShopItem(detective.id, item.id);
            if (res.success) {
              setDetective((prev) => (prev ? { ...prev, points: res.newPoints ?? prev.points } : prev));
              const updatedUnlocked = await getUnlockedItemIds(detective.id);
              const updatedEquipped = await getEquippedItems(detective.id);
              setUnlockedIds(updatedUnlocked);
              setEquipped(updatedEquipped);
              Alert.alert('Sucesso! 🎉', res.message);
            } else {
              Alert.alert('Atenção', res.message);
            }
          },
        },
      ]
    );
  };

  const handleEquip = async (item: ShopItem) => {
    if (!detective) return;
    triggerFeedback();
    await equipShopItem(detective.id, item.id);
    const updatedEquipped = await getEquippedItems(detective.id);
    setEquipped(updatedEquipped);
    // Reload detective for updated avatarBg
    const list = await getDetectives();
    const updated = list.find((d) => d.id === detective.id);
    if (updated) setDetective(updated);
  };

  const filteredItems = shopItems.filter((item) => {
    if (selectedTab === 'all') return true;
    return item.category === selectedTab;
  });

  // Tema único "Blueprint" (claro).
  const getBgColor = () => '#D8D8DB';
  const getCardBg = () => '#FFFFFF';
  const getTextColor = () => '#1F3E66';
  const getSubTextColor = () => '#607287';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: getBgColor() }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <MaterialIcons name="arrow-back" size={24} color={getTextColor()} />
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: getTextColor() }]}>Loja de Recompensas</Text>
            <Text style={[styles.headerSub, { color: getSubTextColor() }]}>Personalize seu perfil com seus pontos</Text>
          </View>
        </View>

        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: getCardBg() }]}>
          <View style={styles.balanceLeft}>
            <Image
              source={require('../icons/screens/estrela.png')}
              style={{ width: 32, height: 32, resizeMode: 'contain' }}
            />
            <View>
              <Text style={[styles.balanceLabel, { color: getSubTextColor() }]}>Seus Pontos Disponíveis</Text>
              <Text style={[styles.balancePoints, { color: getTextColor() }]}>
                {detective?.points ?? 0} <Text style={{ fontSize: 16, color: '#D97706' }}>Pts</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {[
            { key: 'all', label: 'Todos' },
            { key: 'avatar', label: 'Avatares' },
            { key: 'border', label: 'Molduras' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => {
                triggerFeedback();
                setSelectedTab(tab.key as any);
              }}
              style={[
                styles.filterTab,
                selectedTab === tab.key && styles.filterTabActive,
              ]}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedTab === tab.key && styles.filterTabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Items Grid */}
        <View style={styles.itemsGrid}>
          {filteredItems.map((item) => {
            const isUnlocked = unlockedIds.includes(item.id);
            const isEquipped =
              (item.category === 'avatar' && equipped.avatarId === item.id) ||
              (item.category === 'border' && equipped.borderId === item.id);
            const canAfford = (detective?.points ?? 0) >= item.cost;

            return (
              <View key={item.id} style={[styles.itemCard, { backgroundColor: getCardBg() }]}>
                <View style={styles.previewWrap}>
                  {item.category === 'avatar' ? (
                    <View
                      style={[
                        styles.avatarPreview,
                        { backgroundColor: item.avatarBg || '#2F84B0' },
                      ]}
                    >
                      <MaterialIcons name={item.iconName as any} size={28} color={item.avatarColor || '#FFFFFF'} />
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.borderPreview,
                        {
                          borderColor: item.borderStyle?.borderColor || '#CBD5E1',
                          borderWidth: item.borderStyle?.borderWidth || 2,
                        },
                      ]}
                    >
                      <MaterialIcons name={item.iconName as any} size={26} color={item.borderStyle?.borderColor || '#0B5F8F'} />
                    </View>
                  )}
                  {isEquipped ? (
                    <View style={styles.equippedBadge}>
                      <Text style={styles.equippedBadgeText}>Equipado</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={[styles.itemName, { color: getTextColor() }]}>{item.name}</Text>
                <Text style={[styles.itemDesc, { color: getSubTextColor() }]}>{item.description}</Text>

                {/* Price / Action Button */}
                <View style={styles.cardFooter}>
                  {isEquipped ? (
                    <View style={styles.activeBtn}>
                      <MaterialIcons name="check-circle" size={16} color="#059669" />
                      <Text style={styles.activeBtnText}>Em uso</Text>
                    </View>
                  ) : isUnlocked ? (
                    <TouchableOpacity
                      onPress={() => handleEquip(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`Equipar ${item.name}`}
                      style={styles.equipBtn}
                    >
                      <Text style={styles.equipBtnText}>Equipar</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleBuy(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`Comprar ${item.name} por ${item.cost} pontos`}
                      accessibilityState={{ disabled: !canAfford }}
                      style={[
                        styles.buyBtn,
                        !canAfford && styles.buyBtnDisabled,
                      ]}
                      disabled={!canAfford}
                    >
                      <MaterialIcons name="star" size={16} color="#FFFFFF" />
                      <Text style={styles.buyBtnText}>{item.cost} Pts</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20, gap: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  headerSub: { fontSize: 13, marginTop: 2 },

  balanceCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  balanceLabel: { fontSize: 13, fontWeight: '600' },
  balancePoints: { fontSize: 24, fontWeight: '900' },

  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  filterTabActive: {
    backgroundColor: '#0B5F8F',
  },
  filterTabText: {
    color: '#607287',
    fontSize: 13,
    fontWeight: '700',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },

  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  itemCard: {
    width: '48%',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'space-between',
  },
  previewWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    height: 64,
  },
  avatarPreview: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borderPreview: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  equippedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  equippedBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },

  itemName: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  itemDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 4,
    marginBottom: 10,
  },
  cardFooter: {
    marginTop: 'auto',
  },
  activeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
  },
  activeBtnText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '800',
  },
  equipBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#0B5F8F',
    borderRadius: 10,
  },
  equipBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: '#D97706',
    borderRadius: 10,
  },
  buyBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  buyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
