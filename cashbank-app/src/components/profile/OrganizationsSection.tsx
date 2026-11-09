import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ApiError } from '@/api/client';
import {
  flat,
  useAddOrganizationMember,
  useCreateOrganization,
  useMyOrganizations,
} from '@/api/hooks';
import type { Organization, OrganizationRole } from '@/api/types';
import { rules } from '@/lib/validation';
import {
  Avatar,
  Badge,
  Banner,
  Button,
  Card,
  Chip,
  Field,
  Section,
  space,
  Text,
} from '@/ui';

const ROLES: OrganizationRole[] = ['EDITOR', 'ANALYST', 'OWNER'];

function OrganizationItemCard({ org, isOwner }: { org: Organization; isOwner: boolean }) {
  const addMember = useAddOrganizationMember(org.id);
  const [adding, setAdding] = useState(false);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<OrganizationRole>('EDITOR');
  const err = addMember.error instanceof ApiError ? addMember.error : null;

  const submitMember = () => {
    if (!username.trim()) return;
    addMember.mutate(
      { username: username.trim().replace(/^@/, ''), role },
      {
        onSuccess: () => {
          setUsername('');
          setAdding(false);
        },
      },
    );
  };

  return (
    <Card style={{ gap: space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <Pressable
          onPress={() => router.navigate(`/organization/${org.slug}`)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, flex: 1 }}
        >
          <Avatar name={org.name} avatarUrl={org.logoUrl} size={42} />
          <View style={{ flex: 1, gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, flexWrap: 'wrap' }}>
              <Text variant="heading">{org.name}</Text>
              {org.isVerifiedBrand && <Badge label="Marca verificada" tone="success" />}
            </View>
            <Text variant="caption">@{org.slug}</Text>
          </View>
        </Pressable>
        {isOwner && (
          <Button
            title={adding ? 'Cerrar' : '+ Miembro'}
            size="sm"
            variant="secondary"
            onPress={() => setAdding((v) => !v)}
          />
        )}
      </View>

      {org.bio ? <Text variant="body">{org.bio}</Text> : null}

      {org.members && org.members.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {org.members.map((m) => (
            <Badge
              key={m.id}
              label={`${m.username ? `@${m.username}` : 'Miembro'} · ${m.role}`}
            />
          ))}
        </View>
      )}

      {adding && (
        <View style={{ gap: space.sm, paddingTop: space.xs }}>
          {err && <Banner message={err.message} />}
          <Field
            label="Usuario (@username)"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholder="nombre_usuario"
          />
          <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}>
            {ROLES.map((r) => (
              <Chip key={r} label={r} active={role === r} onPress={() => setRole(r)} />
            ))}
          </View>
          <Button
            title="Añadir al equipo"
            size="sm"
            icon="user-plus"
            loading={addMember.isPending}
            onPress={submitMember}
          />
        </View>
      )}
    </Card>
  );
}

/** Sección de Organizaciones, Medios, Universidades y Empresas en el perfil del creador. */
export function OrganizationsSection({ userId }: { userId?: string }) {
  const orgsQuery = useMyOrganizations();
  const createOrg = useCreateOrganization();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [errors, setErrors] = useState<{ name?: string; bio?: string; websiteUrl?: string }>({});

  const orgs = flat(orgsQuery.data);
  const apiError = createOrg.error instanceof ApiError ? createOrg.error : null;

  const submitOrg = () => {
    const next: { name?: string; bio?: string; websiteUrl?: string } = {};
    if (name.trim().length < 3) next.name = 'El nombre debe tener al menos 3 caracteres.';
    if (bio.trim() && bio.trim().length < 10) next.bio = 'La descripción debe tener al menos 10 caracteres.';
    if (websiteUrl.trim()) next.websiteUrl = rules.sourceUrl(websiteUrl.trim());
    setErrors(next);
    if (next.name || next.bio || next.websiteUrl) return;

    createOrg.mutate(
      {
        name: name.trim(),
        bio: bio.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
      },
      {
        onSuccess: () => {
          setName('');
          setBio('');
          setWebsiteUrl('');
          setCreating(false);
        },
      },
    );
  };

  return (
    <Section
      title="Medios y organizaciones"
      action={
        <Button
          title={creating ? 'Cancelar' : 'Crear medio'}
          size="sm"
          variant="secondary"
          icon={creating ? undefined : 'plus'}
          onPress={() => setCreating((v) => !v)}
        />
      }
    >
      {creating && (
        <Card style={{ gap: space.md }}>
          <Text variant="label">Registrar medio, universidad, ONG o empresa</Text>
          {apiError && <Banner message={apiError.message} details={apiError.details} />}
          <Field
            label="Nombre oficial"
            value={name}
            onChangeText={(v) => {
              setName(v);
              if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
            }}
            error={errors.name}
            maxLength={120}
          />
          <Field
            label="Descripción (opcional)"
            value={bio}
            onChangeText={(v) => {
              setBio(v);
              if (errors.bio) setErrors((p) => ({ ...p, bio: undefined }));
            }}
            error={errors.bio}
            multiline
            maxLength={400}
          />
          <Field
            label="Sitio web oficial https:// (opcional)"
            value={websiteUrl}
            onChangeText={(v) => {
              setWebsiteUrl(v);
              if (errors.websiteUrl) setErrors((p) => ({ ...p, websiteUrl: undefined }));
            }}
            error={errors.websiteUrl}
            autoCapitalize="none"
            keyboardType="url"
            placeholder="https://"
          />
          <Button
            title="Crear organización"
            icon="check"
            loading={createOrg.isPending}
            onPress={submitOrg}
          />
        </Card>
      )}

      {orgs.length === 0 && !creating ? (
        <Card>
          <Text variant="caption">
            ¿Publicas en nombre de un medio, universidad o empresa? Crea una organización para firmar en equipo.
          </Text>
        </Card>
      ) : (
        <View style={{ gap: space.md }}>
          {orgs.map((org) => (
            <OrganizationItemCard key={org.id} org={org} isOwner={org.ownerId === userId} />
          ))}
        </View>
      )}
    </Section>
  );
}
