import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMe } from '@/api/hooks';
import { colors, fonts, Screen, space, Text, toast } from '@/ui';

type FollowingTab = 'following' | 'subscribers' | 'subscriptions';
type FollowersTab = 'verified' | 'known' | 'all';

interface AccountItem {
  id: string;
  name: string;
  handle: string;
  bio: string;
  avatarUrl?: string;
  avatarBg?: string;
  avatarText?: string;
  verified?: boolean;
  isFollowing?: boolean;
}

const INITIAL_FOLLOWING_LIST: AccountItem[] = [
  {
    id: 'jase',
    name: 'jase',
    handle: '@jase__og',
    bio: 'cuando no rapeo escribo tonterias aquí',
    avatarBg: '#1C2938',
    avatarText: 'J',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    isFollowing: true,
  },
  {
    id: 'hacking_articles',
    name: 'Hacking Articles',
    handle: '@hackinarticles',
    bio: 'House of Pentesters\n...',
    verified: true,
    avatarBg: '#0F1419',
    avatarText: 'HA',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    isFollowing: true,
  },
];

const INITIAL_FOLLOWERS_LIST: AccountItem[] = [
  {
    id: 'hexsec',
    name: 'Hexsec Team',
    handle: '@Hexsecteam',
    bio: 'Cybersecurity research & educational demonstrations.',
    verified: true,
    avatarBg: '#0F1419',
    avatarText: 'HT',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    isFollowing: false,
  },
];

export default function ConnectionsScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { data: user } = useMe();
  const params = useLocalSearchParams<{ type?: string; tab?: string }>();

  // Modo: 'following' (Siguiendo - Imagen 2 y 3) o 'followers' (Seguidores - Imagen 4 y 5)
  const isFollowersMode = params.type === 'followers';

  const [followingTab, setFollowingTab] = useState<FollowingTab>(
    (params.tab as FollowingTab) || 'following'
  );
  const [followersTab, setFollowersTab] = useState<FollowersTab>(
    (params.tab as FollowersTab) || 'verified'
  );

  const [followingAccounts, setFollowingAccounts] = useState<AccountItem[]>(INITIAL_FOLLOWING_LIST);
  const [followerAccounts, setFollowerAccounts] = useState<AccountItem[]>(INITIAL_FOLLOWERS_LIST);

  const displayName = user?.username || 'John Ripper';

  const toggleFollowAccount = (id: string, isFollowerList: boolean) => {
    if (isFollowerList) {
      setFollowerAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === id) {
            const next = !acc.isFollowing;
            toast.success(next ? `Siguiendo a ${acc.name}` : `Has dejado de seguir a ${acc.name}`);
            return { ...acc, isFollowing: next };
          }
          return acc;
        })
      );
    } else {
      setFollowingAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === id) {
            const next = !acc.isFollowing;
            toast.success(next ? `Siguiendo a ${acc.name}` : `Has dejado de seguir a ${acc.name}`);
            return { ...acc, isFollowing: next };
          }
          return acc;
        })
      );
    }
  };

  return (
    <Screen edges={['bottom']} style={styles.screen}>
      {/* 1. Header con botón atrás, nombre de usuario y botón (+) a la derecha (Imagen 2, 3, 4, 5) */}
      <View style={[styles.header, { paddingTop: Math.max(top, space.sm) + 4 }]}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            accessibilityRole="button"
            accessibilityLabel="Volver atrás"
          >
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </Pressable>
          <Text variant="heading" style={styles.headerTitle} numberOfLines={1}>
            {displayName}
          </Text>
        </View>

        <Pressable
          onPress={() => router.push('/follow')}
          hitSlop={10}
          style={({ pressed }) => [styles.userPlusBtn, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel="Encontrar personas a seguir"
        >
          <Feather name="user-plus" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* 2. Pestañas de Navegación según el modo */}
      {isFollowersMode ? (
        /* Modo Seguidores (Imágenes 4 y 5): Seguidores verificados | Seguidores que conoces | Seguidores */
        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScrollContent}
          >
            {/* Pestaña 1: Seguidores verificados (Imagen 4) */}
            <Pressable
              onPress={() => setFollowersTab('verified')}
              style={styles.tabBtn}
              accessibilityRole="tab"
              accessibilityState={{ selected: followersTab === 'verified' }}
            >
              <View style={styles.tabContentRow}>
                <Feather
                  name="check-circle"
                  size={15}
                  color={followersTab === 'verified' ? '#FFFFFF' : '#71767B'}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    followersTab === 'verified' && styles.tabLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  Seguidores verificados
                </Text>
              </View>
              {followersTab === 'verified' && <View style={styles.tabIndicator} />}
            </Pressable>

            {/* Pestaña 2: Seguidores que conoces (Imagen 5) */}
            <Pressable
              onPress={() => setFollowersTab('known')}
              style={styles.tabBtn}
              accessibilityRole="tab"
              accessibilityState={{ selected: followersTab === 'known' }}
            >
              <View style={styles.tabContentRow}>
                <Text
                  style={[
                    styles.tabLabel,
                    followersTab === 'known' && styles.tabLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  Seguidores que conoces
                </Text>
              </View>
              {followersTab === 'known' && <View style={styles.tabIndicator} />}
            </Pressable>

            {/* Pestaña 3: Seguidores */}
            <Pressable
              onPress={() => setFollowersTab('all')}
              style={styles.tabBtn}
              accessibilityRole="tab"
              accessibilityState={{ selected: followersTab === 'all' }}
            >
              <View style={styles.tabContentRow}>
                <Text
                  style={[
                    styles.tabLabel,
                    followersTab === 'all' && styles.tabLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  Seguidores
                </Text>
              </View>
              {followersTab === 'all' && <View style={styles.tabIndicator} />}
            </Pressable>
          </ScrollView>
        </View>
      ) : (
        /* Modo Siguiendo (Imágenes 2 y 3): Siguiendo | Suscriptores | Suscripciones */
        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScrollContent}
          >
            {/* Pestaña 1: Siguiendo (Imagen 2) */}
            <Pressable
              onPress={() => setFollowingTab('following')}
              style={styles.tabBtn}
              accessibilityRole="tab"
              accessibilityState={{ selected: followingTab === 'following' }}
            >
              <View style={styles.tabContentRow}>
                <Feather
                  name="user"
                  size={15}
                  color={followingTab === 'following' ? '#FFFFFF' : '#71767B'}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    followingTab === 'following' && styles.tabLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  Siguiendo
                </Text>
              </View>
              {followingTab === 'following' && <View style={styles.tabIndicator} />}
            </Pressable>

            {/* Pestaña 2: Suscriptores (Imagen 3) */}
            <Pressable
              onPress={() => setFollowingTab('subscribers')}
              style={styles.tabBtn}
              accessibilityRole="tab"
              accessibilityState={{ selected: followingTab === 'subscribers' }}
            >
              <View style={styles.tabContentRow}>
                <Text
                  style={[
                    styles.tabLabel,
                    followingTab === 'subscribers' && styles.tabLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  Suscriptores
                </Text>
              </View>
              {followingTab === 'subscribers' && <View style={styles.tabIndicator} />}
            </Pressable>

            {/* Pestaña 3: Suscripciones */}
            <Pressable
              onPress={() => setFollowingTab('subscriptions')}
              style={styles.tabBtn}
              accessibilityRole="tab"
              accessibilityState={{ selected: followingTab === 'subscriptions' }}
            >
              <View style={styles.tabContentRow}>
                <Text
                  style={[
                    styles.tabLabel,
                    followingTab === 'subscriptions' && styles.tabLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  Suscripciones
                </Text>
              </View>
              {followingTab === 'subscriptions' && <View style={styles.tabIndicator} />}
            </Pressable>
          </ScrollView>
        </View>
      )}

      {/* 3. Contenido Principal según Pestaña Activa */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(bottom, space.xl) + 20 }}
      >
        {isFollowersMode ? (
          /* VISTAS DE MODO SEGUIDORES */
          followersTab === 'verified' ? (
            /* Imagen 4: ¿Estás buscando seguidores? */
            <View style={styles.emptyContainer}>
              <Text variant="title" style={styles.emptyTitle}>
                ¿Estás buscando seguidores?
              </Text>
              <Text style={styles.emptySubtitle}>
                Cuando una cuenta verificada siga a esta cuenta, aparecerá aquí. Postear e interactuar con otros ayuda a conseguir más seguidores.
              </Text>
            </View>
          ) : followersTab === 'known' ? (
            /* Imagen 5: No hay nada que ver aquí... por ahora. */
            <View style={styles.emptyContainer}>
              <Text variant="title" style={styles.emptyTitle}>
                No hay nada que ver aquí... por ahora.
              </Text>
            </View>
          ) : (
            /* Pestaña Todos los Seguidores */
            <View style={styles.accountsList}>
              {followerAccounts.map((acc) => (
                <View key={acc.id} style={styles.accountRow}>
                  <View style={styles.accountAvatarWrap}>
                    {acc.avatarUrl ? (
                      <Image source={{ uri: acc.avatarUrl }} style={styles.avatarImg} />
                    ) : (
                      <View style={[styles.avatarPlaceholder, { backgroundColor: acc.avatarBg || '#1C2938' }]}>
                        <Text style={styles.avatarText}>{acc.avatarText || 'U'}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.accountInfoCol}>
                    <View style={styles.accountNameLine}>
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text variant="heading" style={styles.accountName} numberOfLines={1}>
                          {acc.name}
                        </Text>
                        {acc.verified && (
                          <Feather name="check-circle" size={15} color="#1D9BF0" />
                        )}
                      </View>

                      {/* Botón Seguir / Siguiendo */}
                      <Pressable
                        onPress={() => toggleFollowAccount(acc.id, true)}
                        style={({ pressed }) => [
                          styles.actionPillBtn,
                          acc.isFollowing ? styles.pillFollowing : styles.pillFollow,
                          pressed && { opacity: 0.8 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.actionPillText,
                            acc.isFollowing ? styles.pillFollowingText : styles.pillFollowText,
                          ]}
                        >
                          {acc.isFollowing ? 'Siguiendo' : 'Seguir'}
                        </Text>
                      </Pressable>
                    </View>

                    <Text style={styles.accountHandle}>{acc.handle}</Text>
                    {acc.bio ? <Text style={styles.accountBio}>{acc.bio}</Text> : null}
                  </View>
                </View>
              ))}
            </View>
          )
        ) : (
          /* VISTAS DE MODO SIGUIENDO */
          followingTab === 'following' ? (
            /* Imagen 2: Lista de cuentas que sigues (jase, Hacking Articles) */
            <View style={styles.accountsList}>
              {followingAccounts.map((acc) => (
                <View key={acc.id} style={styles.accountRow}>
                  <View style={styles.accountAvatarWrap}>
                    {acc.avatarUrl ? (
                      <Image source={{ uri: acc.avatarUrl }} style={styles.avatarImg} />
                    ) : (
                      <View style={[styles.avatarPlaceholder, { backgroundColor: acc.avatarBg || '#1C2938' }]}>
                        <Text style={styles.avatarText}>{acc.avatarText || 'U'}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.accountInfoCol}>
                    <View style={styles.accountNameLine}>
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text variant="heading" style={styles.accountName} numberOfLines={1}>
                          {acc.name}
                        </Text>
                        {acc.verified && (
                          <Feather name="check-circle" size={15} color="#1D9BF0" />
                        )}
                      </View>

                      {/* Botón Siguiendo (Imagen 2) */}
                      <Pressable
                        onPress={() => toggleFollowAccount(acc.id, false)}
                        style={({ pressed }) => [
                          styles.actionPillBtn,
                          acc.isFollowing ? styles.pillFollowing : styles.pillFollow,
                          pressed && { opacity: 0.8 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.actionPillText,
                            acc.isFollowing ? styles.pillFollowingText : styles.pillFollowText,
                          ]}
                        >
                          {acc.isFollowing ? 'Siguiendo' : 'Seguir'}
                        </Text>
                      </Pressable>
                    </View>

                    <Text style={styles.accountHandle}>{acc.handle}</Text>
                    {acc.bio ? <Text style={styles.accountBio}>{acc.bio}</Text> : null}
                  </View>
                </View>
              ))}
            </View>
          ) : followingTab === 'subscribers' ? (
            /* Imagen 3: Aún no tienes ningún Suscriptor */
            <View style={styles.emptyContainer}>
              <Text variant="title" style={styles.emptyTitle}>
                Aún no tienes ningún Suscriptor
              </Text>
              <Text style={styles.emptySubtitle}>
                Aquí encontrarás una lista de todas las personas que están Suscritas a tu cuenta.
              </Text>
            </View>
          ) : (
            /* Pestaña Suscripciones */
            <View style={styles.emptyContainer}>
              <Text variant="title" style={styles.emptyTitle}>
                Aún no tienes suscripciones
              </Text>
              <Text style={styles.emptySubtitle}>
                Cuando te suscribas a creadores en X, aparecerán aquí.
              </Text>
            </View>
          )
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#000000',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    flex: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 19,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  userPlusBtn: {
    padding: 6,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#2F3336',
    backgroundColor: '#000000',
  },
  tabsScrollContent: {
    paddingHorizontal: 16,
    gap: 24,
  },
  tabBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabLabel: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: '#71767B',
  },
  tabLabelActive: {
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 1.5,
  },
  emptyContainer: {
    paddingHorizontal: 28,
    paddingTop: 44,
    alignItems: 'flex-start',
  },
  emptyTitle: {
    fontSize: 32,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: '#71767B',
    lineHeight: 22,
    marginTop: 12,
  },
  accountsList: {
    paddingTop: 4,
  },
  accountRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#16181C',
  },
  accountAvatarWrap: {
    marginRight: 12,
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#16181C',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  accountInfoCol: {
    flex: 1,
  },
  accountNameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountName: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  accountHandle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#71767B',
    marginTop: 1,
  },
  accountBio: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: '#FFFFFF',
    marginTop: 6,
    lineHeight: 18,
  },
  actionPillBtn: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    // Cero margin según Regla 1
    margin: 0,
  },
  pillFollowing: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#536471',
  },
  pillFollowingText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  pillFollow: {
    backgroundColor: '#EFF3F4',
  },
  pillFollowText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: '#0F1419',
  },
  actionPillText: {
    fontSize: 14,
    fontFamily: fonts.bold,
  },
});
