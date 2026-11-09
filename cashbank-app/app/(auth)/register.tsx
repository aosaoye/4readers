import { router } from 'expo-router';
import { type ComponentRef, useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { ApiError } from '@/api/client';
import { useRegister } from '@/api/hooks';
import { hasErrors, rules } from '@/lib/validation';
import { Banner, Button, Field, FormScroll, NavHeader, Screen, ScreenHeader } from '@/ui';

export default function Register() {
  const register = useRegister();
  const [f, setF] = useState({ email: '', username: '', password: '' });
  const [errors, setErrors] = useState<Partial<typeof f>>({});
  const userRef = useRef<ComponentRef<typeof TextInput>>(null);
  const passRef = useRef<ComponentRef<typeof TextInput>>(null);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  const submit = () => {
    const e = { email: rules.email(f.email), username: rules.username(f.username), password: rules.strongPassword(f.password) };
    setErrors(e);
    if (!hasErrors(e)) register.mutate({ email: f.email.trim(), username: f.username.trim(), password: f.password });
  };
  const apiError = register.error instanceof ApiError ? register.error : null;

  return (
    <Screen>
      <NavHeader title="Crear cuenta" />
      <FormScroll>
        <ScreenHeader flush kicker="Empieza ahora" title="Publica con respaldo" />
        {apiError && <Banner message={apiError.message} details={apiError.details} />}
        <Field label="Correo electrónico" value={f.email} onChangeText={set('email')} error={errors.email}
          autoCapitalize="none" autoComplete="email" keyboardType="email-address" returnKeyType="next" onSubmitEditing={() => userRef.current?.focus()} />
        <Field ref={userRef} label="Nombre de usuario" value={f.username} onChangeText={set('username')} error={errors.username}
          hint="Letras, números y guion bajo." autoCapitalize="none" returnKeyType="next" onSubmitEditing={() => passRef.current?.focus()} />
        <Field ref={passRef} label="Contraseña" value={f.password} onChangeText={set('password')} error={errors.password}
          hint="8 o más caracteres con mayúscula, minúscula, número y símbolo." secure autoCapitalize="none" returnKeyType="go" onSubmitEditing={submit} />
        <Button title="Crear cuenta" onPress={submit} loading={register.isPending} />
        <Button title="Ya tengo una cuenta" variant="ghost" onPress={() => router.back()} />
      </FormScroll>
    </Screen>
  );
}
