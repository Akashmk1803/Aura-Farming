import { db } from '@/db';
import { products } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import ProductsTable from './ProductsTable';

export default async function AdminProductsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  const allProducts = await db.select().from(products).all();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <ProductsTable initialProducts={allProducts} />
    </div>
  );
}
