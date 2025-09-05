// app/auth/_layout.tsx
import { Slot } from 'expo-router';
import { AuthGuard } from '../../components/auth/AuthGuard';

export default function AuthLayout() {
  return (
    <AuthGuard requireAuth={false}>
      <Slot />
    </AuthGuard>
  );
}