import React from 'react';
import { Block, BlockContent, BlockStyle } from '@/types/builder';
import { motion } from 'framer-motion';

/**
 * Props do componente BlockRender
 */
interface BlockRenderProps {
  block: Block;
  preview?: boolean;
}

/**
 * Renderizador de Blocos
 * 
 * Componente responsável por renderizar diferentes tipos de blocos (texto, imagem, etc.)
 * com base na configuração fornecida.
 */
export const BlockRender: React.FC<BlockRenderProps> = ({ block, preview = false }) => {
  const { type, content, style } = block;

  const commonStyles: React.CSSProperties = {
    textAlign: style.textAlign,
    color: style.color,
    backgroundColor: style.backgroundColor,
    padding: style.padding || '1rem',
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    borderRadius: style.borderRadius,
    fontFamily: style.fontFamily,
  };

  switch (type) {
    case 'hero':
      return (
        <div style={commonStyles} className="text-center py-12 md:py-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{content.text || 'Título'}</h1>
          <p className="text-xl opacity-90">{content.caption || 'Subtítulo'}</p>
        </div>
      );

    case 'text':
      return (
        <div style={commonStyles} className="prose max-w-none">
            <p className="whitespace-pre-wrap">{content.text}</p>
        </div>
      );

    case 'image':
      return (
        <div style={commonStyles} className="flex justify-center">
          {content.url ? (
            <figure className="max-w-full">
                <img 
                    src={content.url} 
                    alt={content.caption || 'Image'} 
                    className="max-w-full h-auto rounded-lg shadow-md"
                    style={{ borderRadius: style.borderRadius }}
                />
                {content.caption && (
                    <figcaption className="text-center text-sm mt-2 opacity-75">
                        {content.caption}
                    </figcaption>
                )}
            </figure>
          ) : (
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 rounded-lg border-2 border-dashed border-gray-300">
                Selecionar Imagem
            </div>
          )}
        </div>
      );

    case 'gallery':
      return (
        <div style={commonStyles}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {content.images?.map((img, idx) => (
                    <div key={idx} className="relative aspect-square overflow-hidden rounded-lg hover:scale-[1.02] transition-transform">
                        <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                    </div>
                ))}
                {(!content.images || content.images.length === 0) && (
                     <div className="col-span-full h-32 bg-gray-100 flex items-center justify-center text-gray-400 rounded-lg border-2 border-dashed border-gray-300">
                        Galeria Vazia
                    </div>
                )}
            </div>
        </div>
      );

    case 'divider':
      return (
        <div style={{ padding: style.padding || '1rem 0' }}>
            <hr className="border-t-2 opacity-20" style={{ borderColor: style.color || 'currentColor' }} />
        </div>
      );

    case 'button':
        return (
            <div style={{ ...commonStyles, backgroundColor: 'transparent' }} className={`flex ${style.textAlign === 'center' ? 'justify-center' : style.textAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
                <a 
                    href={content.url || '#'}
                    className="px-6 py-3 rounded-full font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg"
                    style={{
                        backgroundColor: style.backgroundColor || '#000',
                        color: style.color || '#fff',
                        borderRadius: style.borderRadius || '9999px',
                    }}
                >
                    {content.buttonText || 'Clique Aqui'}
                </a>
            </div>
        );
        
    case 'countdown':
        // Placeholder para lógica de contagem regressiva
        return (
            <div style={commonStyles} className="text-center py-8">
                <div className="text-3xl font-bold font-mono">
                    00 : 00 : 00 : 00
                </div>
                <p className="text-sm opacity-75 mt-2">{content.caption || 'Contagem Regressiva'}</p>
            </div>
        );

    default:
      return (
        <div style={commonStyles} className="p-4 border border-red-300 bg-red-50 text-red-500 rounded">
            Bloco desconhecido: {type}
        </div>
      );
  }
};
