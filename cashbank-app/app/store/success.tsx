import { Redirect } from 'expo-router';
/** Destino del deep link cashbank://store/success (si Stripe vuelve a la app por fuera del navegador integrado). */
export default function StoreSuccess() {
  return <Redirect href="/store?tab=orders" />;
}
