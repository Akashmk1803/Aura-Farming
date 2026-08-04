import ProductForm from '../ProductForm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function NewProductPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--disp)', fontSize: '2.5rem', textTransform: 'uppercase', color: 'var(--bone)', marginBottom: '24px' }}>Add New Product</h1>
      <ProductForm />
    </div>
  );
}
