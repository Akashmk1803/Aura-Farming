import ProductForm from '../ProductForm';
import { db } from '@/db';
import { products } from '@/db/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  const { id } = await params;
  const productData = await db.select().from(products).where(eq(products.id, id));
  
  if (productData.length === 0) {
    redirect('/admin/products');
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--disp)', fontSize: '2.5rem', textTransform: 'uppercase', color: 'var(--bone)', marginBottom: '24px' }}>Edit Product: {productData[0].name}</h1>
      <ProductForm initialData={productData[0]} />
    </div>
  );
}
