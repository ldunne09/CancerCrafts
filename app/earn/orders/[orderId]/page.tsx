import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { db } from '@/lib/db';
import { validPostId } from '@/lib/post-validation';
import { money } from '@/lib/catalog-validation';
export default async function Page({params}:{params:Promise<{orderId:string}>}) {
  const {user}=await requireSession(); const {orderId}=await params; if(!validPostId(orderId))notFound();
  const order=(await db.query<{id:string;title:string;price_cents:number;seller_name:string}>('SELECT id,title,price_cents,seller_name FROM marketplace_orders WHERE id=$1 AND buyer_id=$2',[orderId,user.id])).rows[0];
  if(!order)notFound();
  return <main className="page"><div className="profile-panel"><h1>Simulated purchase confirmed</h1><p>No payment was taken. No fulfillment is requested.</p><h2>{order.title}</h2><p>{money(order.price_cents)} · Seller: {order.seller_name}</p><p>Order {order.id}</p><Link href="/earn/marketplace" className="primary-btn">Back to marketplace</Link></div></main>;
}
