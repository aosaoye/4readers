import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { ApiError } from '@/api/client';
import { useUpdateProfile } from '@/api/hooks';
import type { UserProfile } from '@/api/types';
import { rules } from '@/lib/validation';
import { Avatar, Banner, Button, Card, Field, space, Text } from '@/ui';

/** Tarjeta desplegable para editar biografía y avatar público HTTPS del creador. */
export function EditProfileCard({ user }: { user: UserProfile }) {
  const update = useUpdateProfile();
  const [open, setOpen] = useState(false);
  const [bio, setBio] = useState(user.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? '');
  const [errors, setErrors] = useState<{ bio?: string; avatarUrl?: string }>({});

  useEffect(() => {
    setBio(user.bio ?? '');
    setAvatarUrl(user.avatarUrl ?? '');
  }, [user.bio, user.avatarUrl]);

  const apiError = update.error instanceof ApiError ? update.error : null;

  const save = () => {
    const nextErrors: { bio?: string; avatarUrl?: string } = {};
    const b = bio.trim();
    const a = avatarUrl.trim();
    if (b && (b.length < 5 || b.length > 300)) {
      nextErrors.bio = 'La biografía debe tener entre 5 y 300 caracteres.';
    }
    if (a) {
      nextErrors.avatarUrl = rules.sourceUrl(a);
    }
    setErrors(nextErrors);
    if (nextErrors.bio || nextErrors.avatarUrl) return;

    update.mutate(
      { bio: b || undefined, avatarUrl: a || undefined },
      { onSuccess: () => setOpen(false) },
    );
  };

  if (!open) {
    return (
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <Avatar name={user.username} avatarUrl={user.avatarUrl} size={52} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="heading">@{user.username}</Text>
          <Text variant="caption" numberOfLines={2}>
            {user.bio || 'Añade una biografía y un avatar público para tu perfil de autor.'}
          </Text>
        </View>
        <Button title="Editar" size="sm" variant="secondary" onPress={() => setOpen(true)} />
      </Card>
    );
  }

  return (
    <Card style={{ gap: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="heading">Editar perfil público</Text>
        <Button title="Cerrar" size="sm" variant="ghost" onPress={() => setOpen(false)} />
      </View>

      {apiError && <Banner message={apiError.message} details={apiError.details} />}

      <Field
        label="Biografía (5-300 caracteres)"
        value={bio}
        onChangeText={(v) => {
          setBio(v);
          if (errors.bio) setErrors((p) => ({ ...p, bio: undefined }));
        }}
        error={errors.bio}
        multiline
        maxLength={300}
        placeholder="Periodista de investigación, analista financiero..."
        style={{ minHeight: 72 }}
      />

      <Field
        label="URL de tu avatar (https://)"
        value={avatarUrl}
        onChangeText={(v) => {
          setAvatarUrl(v);
          if (errors.avatarUrl) setErrors((p) => ({ ...p, avatarUrl: undefined }));
        }}
        error={errors.avatarUrl}
        autoCapitalize="none"
        keyboardType="url"
        placeholder="https://"
      />

      <Button title="Guardar perfil" icon="check" loading={update.isPending} onPress={save} />
    </Card>
  );
}
