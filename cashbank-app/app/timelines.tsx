import { Feather } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useCategories } from '@/api/hooks';
import {
  ALL_SYSTEM_TOPICS,
  TimelineItem,
  usePinnedTimelines,
} from '@/lib/timelines';
import {
  colors,
  Divider,
  fonts,
  isDark,
  NavHeader,
  radius,
  Screen,
  space,
  Text,
  toast,
} from '@/ui';

const ITEM_HEIGHT = 60;

// Asigna un icono dedicado y reconocible a cada categoría
function getCategoryIcon(name: string): keyof typeof Feather.glyphMap {
  const n = name.toLowerCase();
  if (n.includes('fútbol') || n.includes('futbol') || n.includes('soccer')) return 'dribbble';
  if (n.includes('ciencia') || n.includes('science')) return 'aperture';
  if (n.includes('bolsa') || n.includes('econom') || n.includes('finanz')) return 'trending-up';
  if (n.includes('política') || n.includes('politica')) return 'archive';
  if (n.includes('irán') || n.includes('iran') || n.includes('noticia') || n.includes('mundo')) return 'globe';
  if (n.includes('deporte') || n.includes('sport')) return 'disc';
  if (n.includes('negocio') || n.includes('business')) return 'briefcase';
  if (n.includes('tecnolog') || n.includes('tech')) return 'cpu';
  if (n.includes('película') || n.includes('pelicula') || n.includes('tv') || n.includes('cine')) return 'video';
  if (n.includes('arte') || n.includes('art') || n.includes('cultur')) return 'image';
  if (n.includes('inteligencia') || n.includes('ia') || n.includes('ai')) return 'cpu';
  if (n.includes('juego') || n.includes('game')) return 'play-circle';
  if (n.includes('cripto') || n.includes('crypto') || n.includes('moneda')) return 'dollar-sign';
  if (n.includes('video')) return 'video';
  if (n.includes('salud') || n.includes('health')) return 'heart';
  if (n.includes('música') || n.includes('musica')) return 'music';
  return 'bookmark';
}

/** Icono de 6 puntos (:::) idéntico al diseño de referencia para arrastrar y soltar */
function DragDots() {
  return (
    <View style={s.dragDotsRow}>
      <View style={s.dragDotsCol}>
        <View style={s.dot} />
        <View style={s.dot} />
        <View style={s.dot} />
      </View>
      <View style={s.dragDotsCol}>
        <View style={s.dot} />
        <View style={s.dot} />
        <View style={s.dot} />
      </View>
    </View>
  );
}

/** Fila individual con posición absoluta controlada por ranuras */
function DraggableItemRow({
  item,
  editing,
  isDragging,
  posY,
  onStartDrag,
  onMoveDrag,
  onEndDrag,
  onRemove,
}: {
  item: TimelineItem;
  editing: boolean;
  isDragging: boolean;
  posY: Animated.Value;
  onStartDrag: (id: string) => void;
  onMoveDrag: (id: string, dy: number) => void;
  onEndDrag: (id: string) => void;
  onRemove: (id: string, name: string) => void;
}) {
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 2,
        onPanResponderGrant: () => {
          onStartDrag(item.id);
        },
        onPanResponderMove: (_, gestureState) => {
          onMoveDrag(item.id, gestureState.dy);
        },
        onPanResponderRelease: () => {
          onEndDrag(item.id);
        },
        onPanResponderTerminate: () => {
          onEndDrag(item.id);
        },
      }),
    [item.id, onStartDrag, onMoveDrag, onEndDrag]
  );

  return (
    <Animated.View
      style={[
        s.draggableAbsoluteRow,
        {
          transform: [
            { translateY: posY },
            { scale: isDragging ? 1.03 : 1 },
          ],
          zIndex: isDragging ? 9999 : 1,
          elevation: isDragging ? 12 : 0,
        },
        isDragging && s.draggingRowActive,
      ]}
    >
      <View style={s.row}>
        {editing && (
          <Pressable
            onPress={() => onRemove(item.id, item.name)}
            hitSlop={8}
            style={s.removeBtn}
            accessibilityRole="button"
            accessibilityLabel={`Eliminar ${item.name}`}
          >
            <Feather name="minus" size={16} color="#FFFFFF" />
          </Pressable>
        )}

        <View style={s.iconSquare}>
          <Feather name={item.icon} size={18} color="#FFFFFF" />
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="label" style={s.rowTitle}>
            {item.name}
          </Text>
          <Text variant="caption" style={{ color: colors.muted }}>
            {item.subtitle ?? 'Tema'}
          </Text>
        </View>

        {/* Manija de arrastre ::: con PanResponder nativo */}
        <View
          {...panResponder.panHandlers}
          style={s.dragHandleTouch}
          accessibilityRole="button"
          accessibilityLabel={`Arrastrar para reordenar ${item.name}`}
        >
          <DragDots />
        </View>
      </View>
    </Animated.View>
  );
}

/**
 * Lista interactiva de temas fijados con posicionamiento por ranuras absolutas.
 * Al soltar el elemento, aterriza directamente en su ranura sin parpadeos ni glitches.
 */
function DraggablePinnedList({
  timelines,
  editing,
  onReorder,
  onRemove,
  onDragStateChange,
}: {
  timelines: TimelineItem[];
  editing: boolean;
  onReorder: (next: TimelineItem[]) => void;
  onRemove: (id: string, name: string) => void;
  onDragStateChange: (dragging: boolean) => void;
}) {
  const [items, setItems] = useState<TimelineItem[]>(timelines);
  const [activeId, setActiveId] = useState<string | null>(null);

  const itemsRef = useRef<TimelineItem[]>(timelines);
  const activeIdRef = useRef<string | null>(null);
  const startSlotRef = useRef<number>(0);
  const hoverSlotRef = useRef<number>(0);
  const isDraggingRef = useRef(false);

  // Diccionario persistente de Animated.Value para la coordenada Y de cada fila
  const positions = useRef<Record<string, Animated.Value>>({}).current;

  // Asegura que cada elemento tenga un Animated.Value asignado
  timelines.forEach((t, idx) => {
    if (!positions[t.id]) {
      positions[t.id] = new Animated.Value(idx * ITEM_HEIGHT);
    }
  });

  useEffect(() => {
    if (!isDraggingRef.current) {
      setItems(timelines);
      itemsRef.current = timelines;
      timelines.forEach((t, idx) => {
        if (!positions[t.id]) {
          positions[t.id] = new Animated.Value(idx * ITEM_HEIGHT);
        } else {
          Animated.spring(positions[t.id], {
            toValue: idx * ITEM_HEIGHT,
            tension: 140,
            friction: 12,
            useNativeDriver: true,
          }).start();
        }
      });
    }
  }, [timelines, positions]);

  const handleStartDrag = useCallback(
    (id: string) => {
      const idx = itemsRef.current.findIndex((t) => t.id === id);
      if (idx === -1) return;

      isDraggingRef.current = true;
      activeIdRef.current = id;
      startSlotRef.current = idx;
      hoverSlotRef.current = idx;
      setActiveId(id);
      onDragStateChange(true);
    },
    [onDragStateChange]
  );

  const handleMoveDrag = useCallback(
    (id: string, dy: number) => {
      const n = itemsRef.current.length;
      if (n <= 1) return;
      const startSlot = startSlotRef.current;
      const startY = startSlot * ITEM_HEIGHT;

      // Delimitación estricta para que nunca salga del contenedor
      const currentY = Math.max(0, Math.min((n - 1) * ITEM_HEIGHT, startY + dy));
      positions[id]?.setValue(currentY);

      const newHover = Math.max(0, Math.min(n - 1, Math.round(currentY / ITEM_HEIGHT)));

      if (newHover !== hoverSlotRef.current) {
        hoverSlotRef.current = newHover;

        // Desplaza suavemente el resto de elementos a sus nuevas ranuras visuales
        const currentList = itemsRef.current;
        const dragItem = currentList[startSlot];
        const tempOrder = currentList.filter((t) => t.id !== id);
        tempOrder.splice(newHover, 0, dragItem);

        tempOrder.forEach((item, slot) => {
          if (item.id !== id && positions[item.id]) {
            Animated.spring(positions[item.id], {
              toValue: slot * ITEM_HEIGHT,
              tension: 140,
              friction: 12,
              useNativeDriver: true,
            }).start();
          }
        });
      }
    },
    [positions]
  );

  const handleEndDrag = useCallback(
    (id: string) => {
      const startSlot = startSlotRef.current;
      const targetSlot = hoverSlotRef.current;
      const n = itemsRef.current.length;

      const finishAnimation = () => {
        isDraggingRef.current = false;
        activeIdRef.current = null;
        setActiveId(null);
        onDragStateChange(false);

        if (targetSlot !== startSlot && targetSlot >= 0 && targetSlot < n) {
          const next = [...itemsRef.current];
          const [moved] = next.splice(startSlot, 1);
          if (moved) {
            next.splice(targetSlot, 0, moved);
            itemsRef.current = next;
            setItems(next);
            onReorder(next);
            toast.success('Orden actualizado');
          }
        }
      };

      // Anima el elemento soltado directamente a su ranura final con spring natural
      if (positions[id]) {
        Animated.spring(positions[id], {
          toValue: targetSlot * ITEM_HEIGHT,
          tension: 160,
          friction: 14,
          useNativeDriver: true,
        }).start(() => {
          finishAnimation();
        });
      } else {
        finishAnimation();
      }
    },
    [positions, onReorder, onDragStateChange]
  );

  return (
    <View style={[s.pinnedContainer, { height: items.length * ITEM_HEIGHT }]}>
      {items.map((item) => {
        const isDragging = activeId === item.id;
        const posY = positions[item.id] ?? new Animated.Value(0);

        return (
          <DraggableItemRow
            key={item.id}
            item={item}
            editing={editing}
            isDragging={isDragging}
            posY={posY}
            onStartDrag={handleStartDrag}
            onMoveDrag={handleMoveDrag}
            onEndDrag={handleEndDrag}
            onRemove={onRemove}
          />
        );
      })}
    </View>
  );
}

export default function TimelinesScreen() {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(false);
  const [topicsExpanded, setTopicsExpanded] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const { timelines, pin, unpin, reorder } = usePinnedTimelines();
  const categoriesQuery = useCategories();

  // Lista consolidada de todos los temas del sistema y de la API, con icono garantizado
  const allAvailableTopics = useMemo(() => {
    const apiTopics: TimelineItem[] = (categoriesQuery.data ?? []).map((cat) => ({
      id: cat.id,
      name: cat.name,
      subtitle: 'Tema',
      icon: getCategoryIcon(cat.name),
      categoryId: cat.id,
    }));

    const map = new Map<string, TimelineItem>();
    ALL_SYSTEM_TOPICS.forEach((t) => map.set(t.name.toLowerCase(), t));
    apiTopics.forEach((t) => {
      const key = t.name.toLowerCase();
      if (!map.has(key)) {
        map.set(key, t);
      }
    });

    return Array.from(map.values());
  }, [categoriesQuery.data]);

  const pinnedMap = useMemo(() => {
    const set = new Set<string>();
    timelines.forEach((t) => set.add(t.name.toLowerCase()));
    return set;
  }, [timelines]);

  // Temas filtrados por búsqueda que YA están fijados (para mostrar con botón rojo de eliminar)
  const searchMatchingPinned = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.trim().toLowerCase();
    return timelines.filter((t) => t.name.toLowerCase().includes(q));
  }, [timelines, search]);

  // Temas filtrados por búsqueda que NO están fijados (para mostrar con botón verde +)
  const searchMatchingUnpinned = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allAvailableTopics.filter((t) => {
      const isAlreadyPinned = pinnedMap.has(t.name.toLowerCase());
      if (isAlreadyPinned) return false;
      if (!q) return true;
      return t.name.toLowerCase().includes(q);
    });
  }, [allAvailableTopics, pinnedMap, search]);

  const handleAddTopic = (item: TimelineItem) => {
    pin(item);
    toast.success(`"${item.name}" añadido a tus pestañas`);
  };

  const handleRemovePinned = (id: string, name: string) => {
    unpin(id);
    toast.info(`"${name}" eliminado de tus pestañas`);
  };

  const isSearching = search.trim().length > 0;

  return (
    <Screen>
      {/* Cabecera limpia: Solo flecha atrás y título "Cronologías" */}
      <NavHeader title="Cronologías" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!isDragging}
      >
        {/* Barra de búsqueda */}
        <View style={s.searchBar}>
          <Feather name="search" size={18} color={colors.muted} />
          <TextInput
            style={[s.searchInput, { color: colors.ink }]}
            placeholder="Buscar"
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Feather name="x-circle" size={16} color={colors.muted} />
            </Pressable>
          )}
        </View>

        {/* MODO BÚSQUEDA ACTIVA: los seleccionados aparecen con botón rojo (-) y los no seleccionados con verde (+) */}
        {isSearching ? (
          <View style={s.section}>
            {/* Si hay temas fijados que coinciden con la búsqueda, se muestran arriba con botón rojo (-) */}
            {searchMatchingPinned.length > 0 && (
              <View style={s.list}>
                {searchMatchingPinned.map((item) => (
                  <View key={item.id} style={s.row}>
                    <View style={s.iconSquare}>
                      <Feather name={item.icon} size={18} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text variant="label" style={s.rowTitle}>
                        {item.name}
                      </Text>
                      <Text variant="caption" style={{ color: colors.muted }}>
                        Tema
                      </Text>
                    </View>
                    {/* Botón rojo circular con símbolo de menos (-) para eliminar */}
                    <Pressable
                      onPress={() => handleRemovePinned(item.id, item.name)}
                      hitSlop={8}
                      style={s.removeBtn}
                      accessibilityRole="button"
                      accessibilityLabel={`Eliminar ${item.name}`}
                    >
                      <Feather name="minus" size={16} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* Separador de Temas dentro de los resultados de búsqueda */}
            <View style={s.sectionHeader}>
              <Text variant="heading" style={s.sectionTitle}>
                Temas
              </Text>
              <Feather name="chevron-down" size={18} color={colors.muted} />
            </View>

            {/* Temas no fijados que coinciden con la búsqueda, con botón verde (+) */}
            <View style={s.list}>
              {searchMatchingUnpinned.map((topic) => (
                <View key={topic.id} style={s.row}>
                  <View style={s.iconSquare}>
                    <Feather name={topic.icon} size={18} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="label" style={s.rowTitle}>
                      {topic.name}
                    </Text>
                  </View>
                  {/* Botón verde circular (+) para añadir */}
                  <Pressable
                    onPress={() => handleAddTopic(topic)}
                    hitSlop={8}
                    style={s.addBtn}
                    accessibilityRole="button"
                    accessibilityLabel={`Fijar ${topic.name}`}
                  >
                    <Feather name="plus" size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}

              {searchMatchingPinned.length === 0 && searchMatchingUnpinned.length === 0 && (
                <View style={s.emptyBox}>
                  <Text variant="caption">No se encontraron temas con &quot;{search}&quot;.</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          /* MODO NORMAL: Sección Fijado (con botón Editar al lado derecho) + Sección Temas */
          <>
            {/* Sección: Fijado */}
            <View style={s.section}>
              <View style={s.sectionHeaderRow}>
                <Text variant="heading" style={s.sectionTitle}>
                  Fijado
                </Text>
                {/* Botón Editar en la sección Fijado */}
                {timelines.length > 0 && (
                  <Pressable
                    onPress={() => setEditing((v) => !v)}
                    hitSlop={8}
                    style={s.editLink}
                  >
                    <Text
                      variant="label"
                      style={{
                        color: editing ? colors.accent : colors.muted,
                        fontSize: 15,
                        fontFamily: fonts.medium,
                      }}
                    >
                      {editing ? 'Listo' : 'Editar'}
                    </Text>
                  </Pressable>
                )}
              </View>

              {timelines.length === 0 ? (
                <View style={s.emptyBox}>
                  <Text variant="caption">No tienes temas fijados. Añade uno de la lista inferior.</Text>
                </View>
              ) : (
                /* Lista interactiva fluida con arrastrar y soltar sin saltos ni glitches */
                <View style={s.pinnedListWrapper}>
                  <DraggablePinnedList
                    timelines={timelines}
                    editing={editing}
                    onReorder={reorder}
                    onRemove={handleRemovePinned}
                    onDragStateChange={setIsDragging}
                  />
                </View>
              )}
            </View>

            <Divider />

            {/* Sección: Temas con botón desplegable */}
            <View style={s.section}>
              <Pressable
                onPress={() => setTopicsExpanded((v) => !v)}
                style={s.sectionHeaderRow}
              >
                <Text variant="heading" style={s.sectionTitle}>
                  Temas
                </Text>
                <Feather
                  name={topicsExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.muted}
                />
              </Pressable>

              {topicsExpanded && (
                <View style={s.list}>
                  {searchMatchingUnpinned.map((topic) => (
                    <View key={topic.id} style={s.row}>
                      <View style={s.iconSquare}>
                        <Feather name={topic.icon} size={18} color="#FFFFFF" />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text variant="label" style={s.rowTitle}>
                          {topic.name}
                        </Text>
                      </View>

                      {/* Botón verde circular (+) */}
                      <Pressable
                        onPress={() => handleAddTopic(topic)}
                        hitSlop={8}
                        style={s.addBtn}
                        accessibilityRole="button"
                        accessibilityLabel={`Fijar ${topic.name}`}
                      >
                        <Feather name="plus" size={16} color="#FFFFFF" />
                      </Pressable>
                    </View>
                  ))}

                  {searchMatchingUnpinned.length === 0 && (
                    <View style={s.emptyBox}>
                      <Text variant="caption">Todos los temas están fijados.</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  content: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxxl,
    gap: space.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: isDark ? '#16181C' : '#F4F4F5',
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    height: 44,
    borderWidth: 1,
    borderColor: isDark ? '#2F3336' : '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.regular,
    padding: 0,
  },
  section: {
    gap: space.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.xs,
    zIndex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: space.md,
    paddingBottom: space.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  editLink: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  pinnedListWrapper: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
  },
  pinnedContainer: {
    position: 'relative',
    width: '100%',
  },
  draggableAbsoluteRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    justifyContent: 'center',
  },
  draggingRowActive: {
    backgroundColor: isDark ? '#1C1F24' : '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: isDark ? '#2F3336' : '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 12,
    zIndex: 9999,
  },
  list: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: space.md,
  },
  iconSquare: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: '#1E232A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 16,
    fontFamily: fonts.semibold,
  },
  dragHandleTouch: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragDotsRow: {
    flexDirection: 'row',
    gap: 3.5,
  },
  dragDotsCol: {
    gap: 3.5,
  },
  dot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#71767B',
  },
  removeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E0245E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#00BA7C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    paddingVertical: space.lg,
    alignItems: 'center',
  },
});
