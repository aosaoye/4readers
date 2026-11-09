import { StyleSheet, View } from 'react-native';
import { useAuthorAnalytics } from '@/api/hooks';
import { Card, colors, radius, Section, space, Text } from '@/ui';

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <View style={s.metric}>
      <Text variant="title" style={s.metricValue}>
        {value}
      </Text>
      <Text variant="caption">{label}</Text>
    </View>
  );
}

/** Panel de analíticas reales del creador: audiencia, reputación e ingresos por propinas y artículos premium. */
export function CreatorAnalyticsCard() {
  const { data: a } = useAuthorAnalytics();
  if (!a) return null;

  return (
    <Section title="Estadísticas de creador">
      <Card style={{ gap: space.md }}>
        <View style={s.grid}>
          <Metric value={String(a.followersCount)} label="seguidores" />
          <Metric value={String(a.publishedPosts)} label="publicados" />
          <Metric value={String(a.verifiedPosts)} label="verificados" />
          <Metric
            value={a.averageTrustScore == null ? '–' : `${a.averageTrustScore}/100`}
            label="confianza"
          />
        </View>

        <View style={s.revenueBox}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="caption">Ingresos acumulados como autor</Text>
            <Text variant="heading" style={{ fontSize: 20 }}>
              {a.totalTokensEarned} fichas
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 2 }}>
            <Text variant="caption">
              Propinas: {a.tipsTokensEarned} fichas ({a.tipsReceivedCount})
            </Text>
            <Text variant="caption">
              Premium: {a.premiumTokensEarned} fichas ({a.premiumUnlocksCount})
            </Text>
          </View>
        </View>
      </Card>
    </Section>
  );
}

const s = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  metric: {
    flex: 1,
    gap: 2,
  },
  metricValue: {
    fontSize: 22,
    lineHeight: 26,
  },
  revenueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.md,
  },
});
