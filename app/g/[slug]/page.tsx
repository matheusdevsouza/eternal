/**
 * @fileoverview Página Pública de Presente
 * @description Página server-side que renderiza presentes publicados com metadata dinâmica para SEO.
 * @module app/g/[slug]/page
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GiftView } from './GiftView';

/** Props da página */
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://eternalgift.com';
    const response = await fetch(`${baseUrl}/api/public/gifts/${slug}`, {
      next: { revalidate: 60 },
    });
    
    if (!response.ok) {
      return {
        title: 'Gift Not Found | Eternal Gift',
      };
    }
    
    const data = await response.json();
    const gift = data.gift;
    
    return {
      title: `${gift.title} | Eternal Gift`,
      description: gift.message?.substring(0, 160) || 'Um presente digital especial criado com amor.',
      openGraph: {
        title: gift.title,
        description: gift.message?.substring(0, 160),
        type: 'website',
        images: gift.photos?.[0]?.url ? [{ url: gift.photos[0].url }] : [],
      },
    };
  } catch {
    return {
      title: 'Presente | Eternal Gift',
    };
  }
}

/**
 * Página Pública de Presente
 * 
 * Renderiza o presente publicado com dados do servidor.
 * Inclui revalidação a cada 60 segundos.
 * 
 * @param {PageProps} props - Props da página
 * @returns {Promise<JSX.Element>} Elemento React
 */
export default async function PublicGiftPage({ params }: PageProps) {
  const { slug } = await params;
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://eternalgift.com';
  
  try {
    const response = await fetch(`${baseUrl}/api/public/gifts/${slug}`, {
      next: { revalidate: 60 },
    });
    
    if (!response.ok) {
      notFound();
    }
    
    const data = await response.json();
    
    return <GiftView gift={data.gift} />;
  } catch {
    notFound();
  }
}
