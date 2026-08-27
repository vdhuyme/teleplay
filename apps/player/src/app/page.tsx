import { LoginForm } from '@/components/LoginForm';

export const metadata = {
  title: 'Login - Teleplay',
  description: 'Login to manage your Telegram bot players.',
};

export default function Home() {
  return <LoginForm />;
}
