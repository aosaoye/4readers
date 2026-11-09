import { router } from 'expo-router';
import { type ComponentRef, useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { ApiError } from '@/api/client';
import { useLogin } from '@/api/hooks';
import { hasErrors, rules } from '@/lib/validation';
import { Banner, Button, Field, FormScroll, Screen, ScreenHeader } from '@/ui';

export default function Login() {
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const passRef = useRef<ComponentRef<typeof TextInput>>(null);

  const submit = () => {
    const e = { email: rules.email(email), password: rules.loginPassword(password) };
    setErrors(e);
    if (!hasErrors(e)) login.mutate({ email: email.trim(), password });
  };
  const apiError = login.error instanceof ApiError ? login.error : null;

  return (
    <Screen>
      <FormScroll>
        <ScreenHeader flush kicker="Bienvenido de vuelta" title="Entra a tu cuenta" />
        {apiError && <Banner message={apiError.message} details={apiError.details} />}
        <Field label="Correo electrónico" value={email} onChangeText={setEmail} error={errors.email}
          autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress"
          returnKeyType="next" onSubmitEditing={() => passRef.current?.focus()} />
        <Field ref={passRef} label="Contraseña" value={password} onChangeText={setPassword} error={errors.password}
          secure autoCapitalize="none" autoComplete="password" textContentType="password" returnKeyType="go" onSubmitEditing={submit} />
        <Button title="Iniciar sesión" onPress={submit} loading={login.isPending} />
        <Button title="Crear una cuenta" variant="ghost" onPress={() => router.push('/register')} />
      </FormScroll>
    </Screen>
  );
}
