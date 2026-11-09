import { useState } from 'react';
import { View } from 'react-native';
import { useMe } from '@/api/hooks';
import {
  KycAndWithdrawalsTab,
  ModerationTab,
  StoreAndCategoriesTab,
  UsersAndBonusTab,
} from '@/components/admin';
import { roleLabel } from '@/lib/format';
import { ChipRow, FormScroll, NavHeader, Screen, ScreenHeader } from '@/ui';

type AdminTab = 'kyc' | 'mod' | 'store' | 'users';

const TABS: { key: AdminTab; label: string }[] = [
  { key: 'kyc', label: 'KYC y Retiros' },
  { key: 'mod', label: 'Moderación' },
  { key: 'store', label: 'Tienda y Temas' },
  { key: 'users', label: 'Usuarios y Bonos' },
];

/** Panel nativo de Administración y Moderación con el mismo sistema de diseño de la app. */
export default function AdminPanel() {
  const me = useMe().data;
  const isAdmin = me?.role === 'ADMIN';
  const [tab, setTab] = useState<AdminTab>(isAdmin ? 'kyc' : 'mod');

  return (
    <Screen>
      <NavHeader title="Administración" />
      <FormScroll>
        <ScreenHeader
          flush
          kicker={me ? roleLabel[me.role] : 'Gestión'}
          title="Panel de control"
        />
        <View style={{ marginHorizontal: -20 }}>
          <ChipRow options={TABS} value={tab} onChange={setTab} />
        </View>

        {tab === 'kyc' && <KycAndWithdrawalsTab />}
        {tab === 'mod' && <ModerationTab />}
        {tab === 'store' && <StoreAndCategoriesTab />}
        {tab === 'users' && <UsersAndBonusTab />}
      </FormScroll>
    </Screen>
  );
}
