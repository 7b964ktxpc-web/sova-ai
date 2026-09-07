import type { Metadata } from "next";
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: "Вход — SOVA AI",
};

export default function LoginPage() {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Вход в SOVA AI</h1>
        <p className="text-sm text-muted-foreground mt-1">Войдите в свой аккаунт</p>
      </div>
      <div className="bg-white dark:bg-black rounded-lg border p-6 shadow-sm">
        <LoginForm />
      </div>
    </div>
  );
}
