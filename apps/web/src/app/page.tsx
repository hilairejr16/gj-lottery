import { redirect } from 'next/navigation';

// Root path: redirect to default locale (ht) dashboard
export default function RootPage() {
  redirect('/dashboard');
}
