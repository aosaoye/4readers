import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, Screen, space, Text, toast } from '@/ui';

export default function CreatorStudioScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <Screen edges={['bottom']} style={{ backgroundColor: '#000000' }}>
      {/* Cabecera estilo X: Botón atrás y Título centrado «Estudio del creador» (Imagen 1) */}
      <View style={[s.headerRow, { paddingTop: Math.max(top, space.sm) + 4 }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel="Atrás"
        >
          <Feather name="arrow-left" size={22} color="#FFFFFF" />
        </Pressable>

        <Text variant="heading" style={s.headerTitle}>
          Estudio del creador
        </Text>

        <View style={s.headerPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.contentContainer, { paddingBottom: Math.max(bottom, space.xl) + 20 }]}
      >
        {/* SECCIÓN 1: Programas (Imagen 1) */}
        <Text variant="heading" style={s.sectionHeader}>
          Programas
        </Text>

        {/* 1. Recompensas por contenido */}
        <Pressable
          onPress={() => setActiveModal('rewards')}
          style={({ pressed }) => [s.itemRow, pressed && s.itemPressed]}
          accessibilityRole="button"
          accessibilityLabel="Recompensas por contenido"
        >
          <View style={s.iconWrap}>
            <Feather name="gift" size={22} color="#FFFFFF" />
          </View>

          <View style={s.itemTextCol}>
            <Text variant="heading" style={s.itemTitle} numberOfLines={1}>
              Recompensas por conte...
            </Text>
            <Text style={s.itemSubtitle} numberOfLines={1}>
              Gana con tus publicaciones
            </Text>
          </View>

          <View style={s.badgeWrap}>
            <Text style={s.badgeText}>No elegible</Text>
          </View>

          <Feather name="chevron-right" size={20} color="#71767B" />
        </Pressable>

        {/* 2. Suscripciones */}
        <Pressable
          onPress={() => setActiveModal('subscriptions')}
          style={({ pressed }) => [s.itemRow, pressed && s.itemPressed]}
          accessibilityRole="button"
          accessibilityLabel="Suscripciones"
        >
          <View style={s.iconWrap}>
            <MaterialCommunityIcons name="account-star-outline" size={24} color="#FFFFFF" />
          </View>

          <View style={s.itemTextCol}>
            <Text variant="heading" style={s.itemTitle} numberOfLines={1}>
              Suscripciones
            </Text>
          </View>

          <View style={s.badgeWrap}>
            <Text style={s.badgeText}>Inelegible</Text>
          </View>

          <Feather name="chevron-right" size={20} color="#71767B" />
        </Pressable>

        {/* SECCIÓN 2: Herramientas (Imagen 1) */}
        <Text variant="heading" style={s.sectionHeader}>
          Herramientas
        </Text>

        {/* 3. Estadísticas */}
        <Pressable
          onPress={() => setActiveModal('analytics')}
          style={({ pressed }) => [s.itemRow, pressed && s.itemPressed]}
          accessibilityRole="button"
          accessibilityLabel="Estadísticas"
        >
          <View style={s.iconWrap}>
            <Feather name="bar-chart-2" size={22} color="#FFFFFF" />
          </View>

          <View style={s.itemTextCol}>
            <Text variant="heading" style={s.itemTitle} numberOfLines={1}>
              Estadísticas
            </Text>
          </View>

          <Feather name="chevron-right" size={20} color="#71767B" />
        </Pressable>

        {/* 4. Inspiración */}
        <Pressable
          onPress={() => setActiveModal('inspiration')}
          style={({ pressed }) => [s.itemRow, pressed && s.itemPressed]}
          accessibilityRole="button"
          accessibilityLabel="Inspiración"
        >
          <View style={s.iconWrap}>
            <Ionicons name="sparkles-outline" size={22} color="#FFFFFF" />
          </View>

          <View style={s.itemTextCol}>
            <Text variant="heading" style={s.itemTitle} numberOfLines={1}>
              Inspiración
            </Text>
            <Text style={s.itemSubtitle} numberOfLines={1}>
              Principales publicaciones por interacción
            </Text>
          </View>

          <Feather name="chevron-right" size={20} color="#71767B" />
        </Pressable>

        {/* 5. Academia de Creadores */}
        <Pressable
          onPress={() => setActiveModal('academy')}
          style={({ pressed }) => [s.itemRow, pressed && s.itemPressed]}
          accessibilityRole="button"
          accessibilityLabel="Academia de Creadores"
        >
          <View style={s.iconWrap}>
            <Feather name="book-open" size={22} color="#FFFFFF" />
          </View>

          <View style={s.itemTextCol}>
            <Text variant="heading" style={s.itemTitle} numberOfLines={1}>
              Academia de Creadores
            </Text>
            <Text style={s.itemSubtitle} numberOfLines={1}>
              Consejos y guías para creadores
            </Text>
          </View>

          <View style={s.newBadgeWrap}>
            <Text style={s.newBadgeText}>Nuevo</Text>
          </View>

          <Feather name="chevron-right" size={20} color="#71767B" />
        </Pressable>

        {/* SECCIÓN 3: Soporte (Imagen 1) */}
        <Text variant="heading" style={s.sectionHeader}>
          Soporte
        </Text>

        {/* 6. Contactar con soporte */}
        <Pressable
          onPress={() => toast.info('Abriendo soporte prioritario para creadores...')}
          style={({ pressed }) => [s.itemRow, pressed && s.itemPressed]}
          accessibilityRole="button"
          accessibilityLabel="Contactar con soporte"
        >
          <View style={s.iconWrap}>
            <Feather name="message-circle" size={22} color="#FFFFFF" />
          </View>

          <View style={s.itemTextCol}>
            <Text variant="heading" style={s.itemTitle} numberOfLines={1}>
              Contactar con soporte
            </Text>
          </View>

          <Feather name="chevron-right" size={20} color="#71767B" />
        </Pressable>

        {/* 7. Más información */}
        <Pressable
          onPress={() => setActiveModal('info')}
          style={({ pressed }) => [s.itemRow, pressed && s.itemPressed]}
          accessibilityRole="button"
          accessibilityLabel="Más información"
        >
          <View style={s.iconWrap}>
            <Feather name="help-circle" size={22} color="#FFFFFF" />
          </View>

          <View style={s.itemTextCol}>
            <Text variant="heading" style={s.itemTitle} numberOfLines={1}>
              Más información
            </Text>
          </View>

          <Feather name="chevron-right" size={20} color="#71767B" />
        </Pressable>
      </ScrollView>

      {/* MODALES INFORMATIVOS DE DETALLE */}
      {/* 1. Modal Recompensas por contenido */}
      <Modal
        visible={activeModal === 'rewards'}
        animationType="fade"
        transparent
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={s.modalOverlay}>
          <Pressable style={s.modalBackdrop} onPress={() => setActiveModal(null)} />
          <View style={[s.modalSheet, { paddingBottom: Math.max(bottom, space.lg) + space.sm }]}>
            <View style={s.modalHandle} />
            <Text variant="title" style={s.modalTitle}>
              Recompensas por contenido
            </Text>
            <Text style={s.modalDescription}>
              Monetiza tu contenido a través de ingresos compartidos de publicidad en las respuestas a tus publicaciones.
            </Text>

            <View style={s.reqBox}>
              <Text style={s.reqTitle}>Requisitos mínimos de elegibilidad:</Text>
              <Text style={s.reqItem}>• Estar suscrito a Premium o tener cuenta Verificada</Text>
              <Text style={s.reqItem}>• Al menos 500 seguidores activos en tu perfil</Text>
              <Text style={s.reqItem}>• Mínimo 5M de impresiones en publicaciones los últimos 3 meses</Text>
            </View>

            <Pressable
              onPress={() => setActiveModal(null)}
              style={s.modalCloseBtn}
            >
              <Text style={s.modalCloseBtnText}>Entendido</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* 2. Modal Suscripciones */}
      <Modal
        visible={activeModal === 'subscriptions'}
        animationType="fade"
        transparent
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={s.modalOverlay}>
          <Pressable style={s.modalBackdrop} onPress={() => setActiveModal(null)} />
          <View style={[s.modalSheet, { paddingBottom: Math.max(bottom, space.lg) + space.sm }]}>
            <View style={s.modalHandle} />
            <Text variant="title" style={s.modalTitle}>
              Suscripciones de Creadores
            </Text>
            <Text style={s.modalDescription}>
              Ofrece contenido exclusivo para tus mayores seguidores y genera ingresos mensuales recurrentes.
            </Text>

            <View style={s.reqBox}>
              <Text style={s.reqTitle}>Criterios del programa:</Text>
              <Text style={s.reqItem}>• Ser mayor de 18 años</Text>
              <Text style={s.reqItem}>• 500 suscriptores o seguidores activos</Text>
              <Text style={s.reqItem}>• Cuenta sin infracciones recientes de normas de la comunidad</Text>
            </View>

            <Pressable
              onPress={() => setActiveModal(null)}
              style={s.modalCloseBtn}
            >
              <Text style={s.modalCloseBtnText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* 3. Modal Estadísticas */}
      <Modal
        visible={activeModal === 'analytics'}
        animationType="fade"
        transparent
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={s.modalOverlay}>
          <Pressable style={s.modalBackdrop} onPress={() => setActiveModal(null)} />
          <View style={[s.modalSheet, { paddingBottom: Math.max(bottom, space.lg) + space.sm }]}>
            <View style={s.modalHandle} />
            <Text variant="title" style={s.modalTitle}>
              Rendimiento del creador
            </Text>
            <Text style={s.modalDescription}>
              Resumen de interacción y alcance de tus publicaciones en los últimos 28 días.
            </Text>

            <View style={s.statsGrid}>
              <View style={s.statBox}>
                <Text style={s.statVal}>14.8K</Text>
                <Text style={s.statLbl}>Impresiones</Text>
              </View>
              <View style={s.statBox}>
                <Text style={s.statVal}>1.2K</Text>
                <Text style={s.statLbl}>Visitas al perfil</Text>
              </View>
              <View style={s.statBox}>
                <Text style={s.statVal}>4.2%</Text>
                <Text style={s.statLbl}>Tasa de interacción</Text>
              </View>
              <View style={s.statBox}>
                <Text style={s.statVal}>+28</Text>
                <Text style={s.statLbl}>Nuevos seguidores</Text>
              </View>
            </View>

            <Pressable
              onPress={() => setActiveModal(null)}
              style={s.modalCloseBtn}
            >
              <Text style={s.modalCloseBtnText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* 4. Modal Inspiración */}
      <Modal
        visible={activeModal === 'inspiration'}
        animationType="fade"
        transparent
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={s.modalOverlay}>
          <Pressable style={s.modalBackdrop} onPress={() => setActiveModal(null)} />
          <View style={[s.modalSheet, { paddingBottom: Math.max(bottom, space.lg) + space.sm }]}>
            <View style={s.modalHandle} />
            <Text variant="title" style={s.modalTitle}>
              Inspiración para creadores
            </Text>
            <Text style={s.modalDescription}>
              Descubre qué temas y formatos generan mayor conversación y engagement en este momento:
            </Text>

            <View style={s.reqBox}>
              <Text style={s.reqItem}>🔥 Artículos y análisis en profundidad con capturas reales</Text>
              <Text style={s.reqItem}>💬 Preguntas abiertas que invitan a debate en los comentarios</Text>
              <Text style={s.reqItem}>⚡ Hilos rápidos con tips accionables de ciberseguridad</Text>
            </View>

            <Pressable
              onPress={() => setActiveModal(null)}
              style={s.modalCloseBtn}
            >
              <Text style={s.modalCloseBtnText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* 5. Modal Academia de Creadores */}
      <Modal
        visible={activeModal === 'academy'}
        animationType="fade"
        transparent
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={s.modalOverlay}>
          <Pressable style={s.modalBackdrop} onPress={() => setActiveModal(null)} />
          <View style={[s.modalSheet, { paddingBottom: Math.max(bottom, space.lg) + space.sm }]}>
            <View style={s.modalHandle} />
            <Text variant="title" style={s.modalTitle}>
              Academia de Creadores
            </Text>
            <Text style={s.modalDescription}>
              Guías especializadas, buenas prácticas de redacción y estrategias de monetización para creadores verificados.
            </Text>

            <View style={s.reqBox}>
              <Text style={s.reqItem}>📚 Módulo 1: Creación de audiencias leales</Text>
              <Text style={s.reqItem}>🎯 Módulo 2: Cómo redactar ganchos efectivos</Text>
              <Text style={s.reqItem}>💎 Módulo 3: Optimización de ingresos y Premium</Text>
            </View>

            <Pressable
              onPress={() => setActiveModal(null)}
              style={s.modalCloseBtn}
            >
              <Text style={s.modalCloseBtnText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* 6. Modal Más información */}
      <Modal
        visible={activeModal === 'info'}
        animationType="fade"
        transparent
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={s.modalOverlay}>
          <Pressable style={s.modalBackdrop} onPress={() => setActiveModal(null)} />
          <View style={[s.modalSheet, { paddingBottom: Math.max(bottom, space.lg) + space.sm }]}>
            <View style={s.modalHandle} />
            <Text variant="title" style={s.modalTitle}>
              Términos del Estudio del Creador
            </Text>
            <Text style={s.modalDescription}>
              El Estudio del Creador reúne todas las herramientas analíticas y de monetización de CashBank diseñadas para empoderar a los autores independientes.
            </Text>

            <Pressable
              onPress={() => setActiveModal(null)}
              style={s.modalCloseBtn}
            >
              <Text style={s.modalCloseBtnText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const s = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#000000',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 19,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    paddingTop: 24,
    paddingBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 16,
  },
  itemPressed: {
    opacity: 0.7,
  },
  iconWrap: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTextCol: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
  itemSubtitle: {
    fontSize: 13.5,
    fontFamily: fonts.regular,
    color: '#71767B',
  },
  badgeWrap: {
    backgroundColor: '#202327',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
  },
  badgeText: {
    color: '#71767B',
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  newBadgeWrap: {
    backgroundColor: '#1E2A38',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 4,
  },
  newBadgeText: {
    color: '#1D9BF0',
    fontSize: 12.5,
    fontFamily: fonts.bold,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalSheet: {
    backgroundColor: '#16181C',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3E444E',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: '#71767B',
    lineHeight: 22,
    marginBottom: 16,
  },
  reqBox: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2F3336',
  },
  reqTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  reqItem: {
    fontSize: 13.5,
    fontFamily: fonts.regular,
    color: '#E7E9EA',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2F3336',
  },
  statVal: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLbl: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: '#71767B',
  },
  modalCloseBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    color: '#000000',
    fontSize: 15,
    fontFamily: fonts.bold,
  },
});
