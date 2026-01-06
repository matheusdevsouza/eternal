/**
 * @fileoverview Editor de Blocos Visual
 * @description Editor visual para criação de conteúdo baseado em blocos com funcionalidade drag & drop.
 * Suporta texto, imagens, galerias, vídeos, botões, divisores e contadores.
 * @module components/builder/BlockEditor
 */

'use client';

import { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '@/components/ui/Icons';
import { Block, BlockType, BlockContent, BlockStyle } from '@/types/builder';

/** Props do componente BlockEditor */
interface BlockEditorProps {
  /** Lista de blocos atuais */
  blocks: Block[];
  /** Callback para atualizar lista de blocos */
  onChange: (blocks: Block[]) => void;
}

/** Configuração dos tipos de bloco disponíveis */
const blockTypes: { type: BlockType; label: string; icon: keyof typeof Icons; description: string }[] = [
  { type: 'text', label: 'Text', icon: 'FileText', description: 'Text paragraph' },
  { type: 'image', label: 'Image', icon: 'Camera', description: 'Single image' },
  { type: 'gallery', label: 'Gallery', icon: 'Image', description: 'Multiple images' },
  { type: 'video', label: 'Video', icon: 'Play', description: 'YouTube video' },
  { type: 'divider', label: 'Divider', icon: 'Minus', description: 'Separator line' },
  { type: 'button', label: 'Button', icon: 'MousePointer', description: 'Button with link' },
  { type: 'countdown', label: 'Countdown', icon: 'Clock', description: 'Countdown timer' },
];

/**
 * Editor de Blocos Visual
 * 
 * Editor drag & drop para criação de conteúdo baseado em blocos.
 * Suporta adicionar, remover, duplicar e reordenar blocos.
 * 
 * @param {BlockEditorProps} props - Propriedades do componente
 * @returns {JSX.Element} Elemento React
 */
export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);

  /** Gera ID único para novos blocos */
  const generateId = () => Math.random().toString(36).substring(2, 9);

  /** Adiciona novo bloco do tipo especificado */
  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: generateId(),
      type,
      content: getDefaultContent(type),
      style: {},
      order: blocks.length,
    };
    onChange([...blocks, newBlock]);
    setShowAddMenu(false);
    setEditingBlock(newBlock.id);
  };

  /** Retorna conteúdo padrão para cada tipo de bloco */
  const getDefaultContent = (type: BlockType): BlockContent => {
    switch (type) {
      case 'text':
        return { text: '' };
      case 'image':
        return { url: '', caption: '' };
      case 'gallery':
        return { images: [] };
      case 'video':
        return { url: '' };
      case 'button':
        return { buttonText: 'Click Here', link: '' };
      case 'countdown':
        return { targetDate: new Date(Date.now() + 86400000).toISOString().split('T')[0] };
      case 'divider':
      default:
        return {};
    }
  };

  /** Atualiza um bloco específico */
  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    onChange(blocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  }, [blocks, onChange]);

  /** Remove um bloco da lista */
  const deleteBlock = (id: string) => {
    onChange(blocks.filter(block => block.id !== id));
    if (editingBlock === id) setEditingBlock(null);
  };

  /** Duplica um bloco existente */
  const duplicateBlock = (id: string) => {
    const block = blocks.find(b => b.id === id);
    if (!block) return;
    
    const newBlock: Block = {
      ...block,
      id: generateId(),
      order: blocks.length,
    };
    onChange([...blocks, newBlock]);
  };

  /** Handler para reordenação de blocos via drag & drop */
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    onChange(reorderedItems);
  };

  return (
    <div className="space-y-4">
      {blocks.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-[var(--border)] rounded-xl">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-deep)] flex items-center justify-center mx-auto mb-4">
            <Icons.Plus className="w-8 h-8 text-[var(--text-secondary)]" />
          </div>
          <p className="text-[var(--text-secondary)] mb-4">
            No blocks added yet
          </p>
          <button
            onClick={() => setShowAddMenu(true)}
            className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all"
          >
            Add First Block
          </button>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="blocks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >
                {blocks.map((block, index) => (
                  <Draggable key={block.id} draggableId={block.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-[var(--bg-deep)] rounded-xl border transition-all ${
                          snapshot.isDragging
                            ? 'border-[var(--primary)] shadow-lg'
                            : editingBlock === block.id
                            ? 'border-[var(--primary)]'
                            : 'border-[var(--border)]'
                        }`}
                      >
                        <div className="flex items-center gap-3 p-3 border-b border-[var(--border)]">
                          <div
                            {...provided.dragHandleProps}
                            className="p-1 hover:bg-[var(--bg-card)] rounded cursor-grab active:cursor-grabbing"
                          >
                            <Icons.Menu className="w-4 h-4 text-[var(--text-secondary)]" />
                          </div>
                          
                          <span className="text-sm font-medium">
                            {blockTypes.find(t => t.type === block.type)?.label || block.type}
                          </span>

                          <div className="flex-1" />

                          <button
                            onClick={() => setEditingBlock(editingBlock === block.id ? null : block.id)}
                            className={`p-1.5 rounded transition-colors ${
                              editingBlock === block.id 
                                ? 'bg-[var(--primary)] text-white' 
                                : 'hover:bg-[var(--bg-card)]'
                            }`}
                            title="Edit block"
                          >
                            <Icons.Settings className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => duplicateBlock(block.id)}
                            className="p-1.5 hover:bg-[var(--bg-card)] rounded transition-colors"
                            title="Duplicate block"
                          >
                            <Icons.Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteBlock(block.id)}
                            className="p-1.5 hover:bg-red-500/10 text-red-400 rounded transition-colors"
                            title="Delete block"
                          >
                            <Icons.Trash className="w-4 h-4" />
                          </button>
                        </div>

                        <AnimatePresence>
                          {editingBlock === block.id && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 space-y-4">
                                <BlockContentEditor
                                  block={block}
                                  onUpdate={(updates) => updateBlock(block.id, updates)}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {editingBlock !== block.id && (
                          <div 
                            className="p-4 cursor-pointer hover:bg-[var(--bg-card)] transition-colors"
                            onClick={() => setEditingBlock(block.id)}
                          >
                            <BlockPreview block={block} />
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <div className="flex justify-center">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
            showAddMenu 
              ? 'bg-[var(--primary)] text-white' 
              : 'bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--primary)]'
          }`}
        >
          <Icons.Plus className={`w-4 h-4 transition-transform ${showAddMenu ? 'rotate-45' : ''}`} />
          <span>{showAddMenu ? 'Cancel' : 'Add Block'}</span>
        </button>
      </div>

      <AnimatePresence>
        {showAddMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-[var(--bg-deep)] rounded-xl border border-[var(--border)]"
          >
            {blockTypes.map((blockType) => {
              const IconComponent = Icons[blockType.icon];
              return (
                <button
                  key={blockType.type}
                  onClick={() => addBlock(blockType.type)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--bg-card)] transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-card)] group-hover:bg-[var(--primary)]/10 flex items-center justify-center transition-colors">
                    <IconComponent className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <span className="text-sm font-medium">{blockType.label}</span>
                  <span className="text-xs text-[var(--text-secondary)]">{blockType.description}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Block Content Editor
 */
function BlockContentEditor({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const updateContent = (content: Partial<BlockContent>) => {
    onUpdate({ content: { ...block.content, ...content } });
  };

  const updateStyle = (style: Partial<BlockStyle>) => {
    onUpdate({ style: { ...block.style, ...style } });
  };

  return (
    <div className="space-y-4">
      {block.type === 'text' && (
        <div>
          <label className="block text-sm font-medium mb-2">Text Content</label>
          <textarea
            value={block.content.text || ''}
            onChange={(e) => updateContent({ text: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all resize-none"
            placeholder="Enter your text here..."
          />
        </div>
      )}

      {block.type === 'image' && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">Image URL</label>
            <input
              type="url"
              value={block.content.url || ''}
              onChange={(e) => updateContent({ url: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Caption (optional)</label>
            <input
              type="text"
              value={block.content.caption || ''}
              onChange={(e) => updateContent({ caption: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all"
              placeholder="Describe the image"
            />
          </div>
        </>
      )}

      {block.type === 'video' && (
        <div>
          <label className="block text-sm font-medium mb-2">YouTube URL</label>
          <input
            type="url"
            value={block.content.url || ''}
            onChange={(e) => updateContent({ url: e.target.value })}
            className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
      )}

      {block.type === 'button' && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">Button Text</label>
            <input
              type="text"
              value={block.content.buttonText || ''}
              onChange={(e) => updateContent({ buttonText: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all"
              placeholder="Click Here"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Link URL</label>
            <input
              type="url"
              value={block.content.link || ''}
              onChange={(e) => updateContent({ link: e.target.value })}
              className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all"
              placeholder="https://..."
            />
          </div>
        </>
      )}

      {block.type === 'countdown' && (
        <div>
          <label className="block text-sm font-medium mb-2">Target Date</label>
          <input
            type="date"
            value={block.content.targetDate || ''}
            onChange={(e) => updateContent({ targetDate: e.target.value })}
            className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)] transition-all"
          />
        </div>
      )}

      <div className="pt-4 border-t border-[var(--border)]">
        <h4 className="text-sm font-medium mb-3">Style Options</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">Alignment</label>
            <select
              value={block.style.textAlign || 'left'}
              onChange={(e) => updateStyle({ textAlign: e.target.value as BlockStyle['textAlign'] })}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-sm outline-none focus:border-[var(--primary)]"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">Font Size</label>
            <select
              value={block.style.fontSize || ''}
              onChange={(e) => updateStyle({ fontSize: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-sm outline-none focus:border-[var(--primary)]"
            >
              <option value="">Default</option>
              <option value="0.875rem">Small</option>
              <option value="1rem">Normal</option>
              <option value="1.25rem">Large</option>
              <option value="1.5rem">Extra Large</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Block Preview
 */
function BlockPreview({ block }: { block: Block }) {
  switch (block.type) {
    case 'text':
      return (
        <p className="text-[var(--text-secondary)] line-clamp-2">
          {block.content.text || 'Click to edit...'}
        </p>
      );
    case 'image':
      return block.content.url ? (
        <img src={block.content.url} alt={block.content.caption || ''} className="max-h-32 rounded-lg" />
      ) : (
        <p className="text-[var(--text-secondary)]">No image set</p>
      );
    case 'video':
      return (
        <p className="text-[var(--text-secondary)]">
          {block.content.url ? `Video: ${block.content.url}` : 'No video set'}
        </p>
      );
    case 'button':
      return (
        <span className="inline-block px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm">
          {block.content.buttonText || 'Button'}
        </span>
      );
    case 'countdown':
      return (
        <p className="text-[var(--text-secondary)]">
          Countdown to: {block.content.targetDate || 'Not set'}
        </p>
      );
    case 'divider':
      return <hr className="border-[var(--border)]" />;
    default:
      return <p className="text-[var(--text-secondary)]">Unknown block</p>;
  }
}
