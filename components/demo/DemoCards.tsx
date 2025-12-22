/**
 * DemoCards Component
 * 
 * Sistema de demonstração interativa para a landing page do Eternal.
 * Apresenta 6 demos progressivas que desbloqueiam sequencialmente,
 * mostrando as funcionalidades principais da plataforma de forma interativa.
 * 
 * Fluxo de Desbloqueio:
 * 1. Adicionar Fotos → 2. Sugestões de Músicas → 3. Carta de Amor → 
 * 4. Escolher Tema → 5. Gerar QR Code → 6. Contador de Tempo
 * 
 * @module components/demo/DemoCards
 * @requires react
 * @requires ./DemoCardAnimator
 * @requires ./DemoContext
 * @requires ../Icons
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCardAnimation } from './DemoCardAnimator';
import { useDemo } from './DemoContext';
import { Icons } from '../Icons';

/**
 * Interface de propriedades compartilhada por todos os componentes de demo
 * 
 * @interface DemoProps
 * @property {boolean} [isPreview=false] - Indica se o card está em modo preview (expandido)
 * @property {boolean} [cardReady=false] - Indica se o card está pronto para animação
 * @property {Function} [onClose] - Callback para fechar o preview
 */

interface DemoProps {
  isPreview?: boolean;
  cardReady?: boolean;
  onClose?: () => void;
}

/**
 * Componente Typewriter
 * 
 * Simula efeito de digitação de texto caractere por caractere.
 * Utilizado para mensagens da IA para criar uma experiência mais humanizada.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.text - Texto completo a ser digitado
 * @param {number} [props.speed=30] - Velocidade de digitação em milissegundos por caractere
 * @param {Function} [props.onComplete] - Callback executado quando a digitação termina
 * @param {string} [props.className=''] - Classes CSS adicionais
 * 
 * @example
 * <Typewriter 
 *   text="Olá, mundo!" 
 *   speed={50} 
 *   onComplete={() => console.log('Concluído')} 
 * />
 */

const Typewriter = ({ text, speed = 30, onComplete, className = '' }: { 
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length && !isComplete) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (currentIndex >= text.length && !isComplete) {
      setIsComplete(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentIndex, text, speed, onComplete, isComplete]);

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </span>
  );
};

/**
 * Ícone de Fechar (X)
 * Componente SVG para botão de fechar modals
 */

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/**
 * Ícone de Loading (Spinner)
 * Componente SVG para indicadores de carregamento
 */

const Loader2Icon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

/**
 * Ícone de Cadeado
 * Componente SVG para demos bloqueadas
 */

const LockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

/**
 * ActiveDemoCard Component
 * 
 * Card base para demos ativos (desbloqueados).
 * Renderiza um card interativo com animações e suporte para modo preview expandido.
 * Gerencia automaticamente transições entre visualização pequena e preview completo.
 * 
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Conteúdo do card
 * @param {string} props.number - Número identificador do demo (1-6)
 * @param {React.ReactElement} props.icon - Ícone representativo do demo
 * @param {string} props.title - Título do demo
 * @param {string} props.description - Descrição breve do demo
 * @param {boolean} props.isPreview - Estado de preview (expandido/compacto)
 * @param {boolean} props.cardReady - Indica se animações devem iniciar
 * @param {Function} [props.onClose] - Callback para fechar preview
 * @param {string} props.cardId - ID único do card para animações
 * @param {React.RefObject} props.cardRef - Ref para animações DOM
 */

const ActiveDemoCard = ({ 
  children, 
  number, 
  icon, 
  title, 
  description,
  isPreview,
  cardReady,
  onClose,
  cardId,
  cardRef
}: {
  children: React.ReactNode;
  number: string;
  icon: React.ReactElement;
  title: string;
  description: string;
  isPreview: boolean;
  cardReady: boolean;
  onClose?: () => void;
  cardId: string;
  cardRef: React.RefObject<HTMLDivElement | null>;
}) => (
  <div 
    ref={cardRef}
    className={`rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col hover:shadow-xl ${
      isPreview ? 'p-10 w-full h-full min-h-[600px] absolute inset-0' : 'p-6'
    } ${isPreview ? 'demo-card-preview' : ''}`}
    style={{
      background: 'var(--demo-card-bg)',
      borderColor: 'var(--demo-card-border)',
    }}
    data-card-id={cardId}
  >
    {isPreview && onClose && (
      <button
        onClick={onClose}
        className={`absolute top-4 right-4 z-30 rounded-full p-2 shadow-lg transition-all hover:scale-110 ${
          cardReady ? 'animate-expandIn' : 'opacity-0 pointer-events-none'
        }`}
        style={{ 
          background: 'var(--bg-card)',
          border: '1px solid var(--border)'
        }}
      >
        <div style={{ color: 'var(--text)' }}>
          <XIcon className="w-5 h-5" />
        </div>
      </button>
    )}
    <div 
      className={`absolute ${isPreview ? 'bottom-4' : 'top-4'} right-4 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-10 ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`}
      style={{ background: 'var(--demo-badge-bg)', color: 'white' }}
    >
      {number}
    </div>
    <div 
      className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`}
      style={{ background: 'var(--demo-badge-bg)', color: 'white' }}
    >
      <div className="w-6 h-6 flex items-center justify-center text-white">
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" }) : icon}
      </div>
    </div>
    <h3 
      className={`font-bold text-xl mb-4 ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`}
      style={{ color: 'var(--text)' }}
    >
      {title}
    </h3>
    
    <div 
      className={`flex-grow min-h-0 ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0 pointer-events-none' : ''
      }`}
    >
      {children}
    </div>
    
    <p 
      className={`text-xs mt-4 pt-4 border-t ${
        isPreview && cardReady ? 'animate-expandIn' : isPreview ? 'opacity-0' : ''
      }`}
      style={{ 
        color: 'var(--text-secondary)',
        borderColor: 'var(--border)'
      }}
    >
      {description}
    </p>
  </div>
);

/**
 * LockedDemoCard Component
 * 
 * Card para demos bloqueadas (ainda não acessíveis).
 * Exibe um cadeado e mensagem informando que o demo anterior precisa ser completado.
 * Visualmente desabilitado com blur e opacidade reduzida.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.number - Número do demo
 * @param {React.ReactElement} props.icon - Ícone do demo
 * @param {string} props.title - Título do demo
 * @param {string} props.description - Mensagem de bloqueio
 */

const LockedDemoCard = ({ 
  number, 
  icon, 
  title, 
  description 
}: {
  number: string;
  icon: React.ReactElement;
  title: string;
  description: string;
}) => (
  <div 
    className="rounded-2xl p-6 border relative overflow-hidden flex flex-col"
    style={{
      background: 'var(--demo-card-locked-bg)',
      borderColor: 'var(--demo-card-locked-border)',
    }}
  >
    <div className="absolute inset-0 backdrop-blur-[1px] z-[1] pointer-events-none"></div>
    <div 
      className="absolute top-4 right-4 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-20"
      style={{ background: 'var(--demo-card-locked-icon)', color: 'var(--text-muted)' }}
    >
      {number}
    </div>
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div 
        className="backdrop-blur-sm rounded-full p-4 shadow-lg"
        style={{ background: 'var(--bg-card)' }}
      >
        <div style={{ color: 'var(--demo-card-locked-icon)' }}>
          <LockIcon className="w-8 h-8" />
        </div>
      </div>
    </div>
    <div 
      className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
      style={{ background: 'var(--demo-card-locked-icon)', color: 'var(--text-muted)' }}
    >
      <div className="w-6 h-6 flex items-center justify-center text-white">
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" }) : icon}
      </div>
    </div>
    <h3 
      className="font-bold text-xl mb-4"
      style={{ color: 'var(--demo-card-locked-text)' }}
    >
      {title}
    </h3>
    <div className="space-y-3 flex-grow min-h-0">
      <button
        disabled
        className="w-full text-sm py-3 px-4 rounded-lg cursor-not-allowed font-semibold opacity-75"
        style={{ 
          background: 'var(--demo-card-locked-icon)', 
          color: 'var(--demo-card-locked-text)'
        }}
      >
        <Icons.Sparkles className="w-4 h-4 inline mr-2" />
        {title}
      </button>
    </div>
    <p 
      className="text-xs mt-4 pt-4 border-t"
      style={{ 
        color: 'var(--demo-card-locked-text)',
        borderColor: 'var(--demo-card-locked-border)'
      }}
    >
      {description}
    </p>
  </div>
);

/**
 * ═══════════════════════════════════════════════════════════════
 * DEMO 1: ADICIONAR FOTOS
 * ═══════════════════════════════════════════════════════════════
 * 
 * Primeira demo do fluxo. Simula upload de 5 fotos para o álbum.
 * Sempre desbloqueado. Ao completar, desbloqueia o Demo 2 (Música).
 * 
 * Estados:
 * - idle: Aguardando início
 * - uploading: Simulando upload progressivo
 * - complete: Upload concluído, exibe mensagem da IA
 * 
 * @component
 * @param {DemoProps} props - Propriedades do demo
 */

export const PhotosDemo = ({ isPreview = false, cardReady = false, onClose }: DemoProps = {}) => {
  const { unlockFeature, setPreviewCard, previewCard, isAnimating } = useDemo();
  const [step, setStep] = useState<'idle' | 'uploading' | 'complete'>('idle');
  const [photos, setPhotos] = useState<string[]>([]);
  const cardRef = useCardAnimation('photos', isPreview);
  const isInPreview = previewCard === 'photos';

  const demoPhotos = ['Foto 1.jpg', 'Foto 2.jpg', 'Foto 3.jpg', 'Foto 4.jpg', 'Foto 5.jpg'];

  const handleStart = () => {
    if (isPreview) {
      if (cardReady) {
        setStep('uploading');
      }
    } else {
      setPreviewCard('photos');
    }
  };

  useEffect(() => {
    if (isPreview && cardReady && step === 'idle') {
      setStep('uploading');
    }
  }, [isPreview, cardReady, step]);

  useEffect(() => {
    if (step === 'uploading') {
      let index = 0;
      const interval = setInterval(() => {
        if (index < demoPhotos.length) {
          setPhotos(prev => [...prev, demoPhotos[index]]);
          index++;
        } else {
          clearInterval(interval);
          setStep('complete');
          unlockFeature('music');
        }
      }, 600);
      return () => clearInterval(interval);
    }
  }, [step, unlockFeature]);

  if (!isPreview && isInPreview && !isAnimating) {
    return <div className="opacity-0 pointer-events-none" aria-hidden="true" />;
  }

  return (
    <ActiveDemoCard
      cardRef={cardRef}
      cardId="photos"
      number="1"
      icon={<Icons.Camera />}
      title="Adicionar Fotos"
      description="Armazenamento ilimitado de fotos"
      isPreview={isPreview}
      cardReady={cardReady}
      onClose={onClose}
    >
      <div className="space-y-3">
        {step === 'idle' && (
          <button
            onClick={handleStart}
            className="w-full text-sm py-3 px-4 rounded-lg transition-colors font-semibold text-white"
            style={{ background: 'var(--primary)', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
          >
            <Icons.Sparkles className="w-4 h-4 inline mr-2" />
            Iniciar Demo
          </button>
        )}

        {(step === 'uploading' || step === 'complete') && (
          <>
            <div 
              className="rounded-lg p-4 border flex-grow"
              style={{ 
                background: 'var(--bg-card)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="space-y-2">
                {photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 rounded animate-fadeIn"
                    style={{ background: 'var(--demo-icon-bg)' }}
                  >
                    <div style={{ color: 'var(--primary)' }}>
                    <Icons.Camera className="w-5 h-5" />
                  </div>
                    <span className="text-sm flex-1" style={{ color: 'var(--text)' }}>{photo}</span>
                    <Icons.Check className="w-4 h-4 text-green-600" />
                  </div>
                ))}
              </div>
              {step === 'uploading' && (
                <div className="flex items-center gap-2 text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
                  <Loader2Icon className="w-3 h-3 animate-spin" />
                  <span>Fazendo upload...</span>
                </div>
              )}
            </div>
            
            {step === 'complete' && (
              <div 
                className="rounded-lg p-4 border mt-3"
                style={{ 
                  background: 'var(--primary-light)',
                  borderColor: 'var(--primary)'
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 animate-pulse flex-shrink-0" style={{ background: 'var(--primary)' }}></div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold mb-1" style={{ color: 'var(--primary)' }}>IA:</div>
                    <div className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                      <Typewriter 
                        text="Fotos adicionadas ao álbum! Que momentos especiais vocês compartilham! Sinta-se à vontade para remover, substituir ou adicionar mais fotos quando quiser. ✨"
                        speed={30}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ActiveDemoCard>
  );
};

/**
 * ═══════════════════════════════════════════════════════════════
 * DEMO 2: SUGESTÕES DE MÚSICAS
 * ═══════════════════════════════════════════════════════════════
 * 
 * Segunda demo. IA analisa as fotos e sugere músicas românticas.
 * Desbloqueado após completar Demo 1. Desbloqueia Demo 3 ao finalizar.
 * 
 * Estados:
 * - locked: Aguardando desbloqueio do Demo 1
 * - idle: Desbloqueado, aguardando início
 * - adding: Adicionando músicas progressivamente
 * - complete: Músicas adicionadas, exibe mensagem da IA
 * 
 * @component
 * @param {DemoProps} props - Propriedades do demo
 */

export const MusicDemo = ({ isPreview = false, cardReady = false, onClose }: DemoProps = {}) => {
  const { unlockedFeatures, unlockFeature, setPreviewCard, previewCard, isAnimating } = useDemo();
  const [step, setStep] = useState<'locked' | 'idle' | 'adding' | 'complete'>('locked');
  const [songs, setSongs] = useState<Array<{ name: string; artist: string }>>([]);
  const cardRef = useCardAnimation('music', isPreview);
  const isInPreview = previewCard === 'music';

  const demoSongs = [
    { name: 'Perfect', artist: 'Ed Sheeran' },
    { name: 'All of Me', artist: 'John Legend' },
    { name: 'Thinking Out Loud', artist: 'Ed Sheeran' },
  ];

  useEffect(() => {
    if (unlockedFeatures.has('music')) {
      if (step === 'locked') {
        setStep('idle');
      }
    }
  }, [unlockedFeatures, step]);

  useEffect(() => {
    if (isPreview && cardReady && step === 'idle') {
      setStep('adding');
    }
  }, [isPreview, cardReady, step]);

  useEffect(() => {
    if (step === 'adding') {
      let index = 0;
      const interval = setInterval(() => {
        if (index < demoSongs.length) {
          setSongs(prev => [...prev, demoSongs[index]]);
          index++;
        } else {
          clearInterval(interval);
          setStep('complete');
          unlockFeature('letter');
        }
      }, 800);
      return () => clearInterval(interval);
    }
  }, [step, unlockFeature]);

  const handleStart = () => {
    if (isPreview) {
      if (cardReady) {
        setSongs([]);
        setStep('adding');
      }
    } else {
      setPreviewCard('music');
    }
  };

  if (step === 'locked') {
    return (
      <LockedDemoCard
        number="2"
        icon={<Icons.Music />}
        title="Sugestões de Músicas"
        description="Complete a demo anterior para desbloquear"
      />
    );
  }

  if (!isPreview && isInPreview && !isAnimating) {
    return <div className="opacity-0 pointer-events-none" aria-hidden="true" />;
  }

  return (
    <ActiveDemoCard
      cardRef={cardRef}
      cardId="music"
      number="2"
      icon={<Icons.Music />}
      title="Sugestões de Músicas"
      description="Crie a trilha sonora perfeita"
      isPreview={isPreview}
      cardReady={cardReady}
      onClose={onClose}
    >
      <div className="flex flex-col">
        {step === 'idle' && (
          <button
            onClick={handleStart}
            className="w-full text-sm py-3 px-4 rounded-lg transition-colors font-semibold text-white"
            style={{ background: 'var(--primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
          >
            <Icons.Sparkles className="w-4 h-4 inline mr-2" />
            Adicionar Trilha Sonora
          </button>
        )}

        {(step === 'adding' || step === 'complete') && (
          <>
            <div 
              className="rounded-lg p-4 border flex-grow"
              style={{ 
                background: 'var(--bg-card)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="space-y-2">
                {songs.map((song, idx) => {
                  if (!song || !song.name) return null;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded animate-fadeIn"
                      style={{ background: 'var(--demo-icon-bg)' }}
                    >
                      <div style={{ color: 'var(--primary)' }}>
                        <Icons.Music className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{song.name}</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{song.artist || ''}</div>
                      </div>
                      <Icons.Check className="w-4 h-4 text-green-600" />
                    </div>
                  );
                })}
              </div>
              {step === 'adding' && (
                <div className="flex items-center gap-2 text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
                  <Loader2Icon className="w-3 h-3 animate-spin" />
                  <span>Analisando suas fotos...</span>
                </div>
              )}
            </div>

            {step === 'complete' && (
              <div 
                className="rounded-lg p-4 border mt-3"
                style={{ 
                  background: 'var(--primary-light)',
                  borderColor: 'var(--primary)'
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 animate-pulse flex-shrink-0" style={{ background: 'var(--primary)' }}></div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold mb-1" style={{ color: 'var(--primary)' }}>IA:</div>
                    <div className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                      <Typewriter 
                        text="Perfeito! Baseado nas fotos do seu álbum, sugeri músicas românticas que combinam com a energia do casal. Vocês podem adicionar, remover ou trocar qualquer uma! 🎵"
                        speed={30}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ActiveDemoCard>
  );
};

/**
 * ═══════════════════════════════════════════════════════════════
 * DEMO 3: CARTA DE AMOR
 * ═══════════════════════════════════════════════════════════════
 * 
 * Terceira demo. Usuário pede para IA escrever uma carta de amor
 * personalizada baseada nas fotos do álbum. Simula interação de chat.
 * 
 * Estados:
 * - locked: Aguardando desbloqueio do Demo 2
 * - idle: Desbloqueado, aguardando início
 * - user_requesting: Usuário digitando pedido (efeito typewriter)
 * - writing: IA escrevendo carta (efeito typewriter)
 * - complete: Carta finalizada
 * 
 * @component
 * @param {DemoProps} props - Propriedades do demo
 */

export const LetterDemo = ({ isPreview = false, cardReady = false, onClose }: DemoProps = {}) => {
  const { unlockedFeatures, unlockFeature, setPreviewCard, previewCard, isAnimating } = useDemo();
  const [step, setStep] = useState<'locked' | 'idle' | 'user_requesting' | 'writing' | 'complete'>('locked');
  const cardRef = useCardAnimation('letter', isPreview);
  const isInPreview = previewCard === 'letter';

  const userRequest = 'IA, escreva uma carta de amor especial falando sobre as fotos do nosso álbum 💕';
  const letterText = 'Meu amor, cada foto do nosso álbum conta uma história única e especial. Desde o primeiro encontro até os momentos mais recentes, você trouxe cores e alegria para minha vida. Nossas músicas favoritas ecoam os batimentos do nosso coração, e cada lembrança é um tesouro que guardarei eternamente. Este presente é uma pequena forma de expressar o amor infinito que sinto por você. Te amo hoje, amanhã e sempre. ❤️';

  useEffect(() => {
    if (unlockedFeatures.has('letter')) {
      if (step === 'locked') {
        setStep('idle');
      }
    }
  }, [unlockedFeatures, step]);

  useEffect(() => {
    if (isPreview && cardReady && step === 'idle') {
      setStep('user_requesting');
    }
  }, [isPreview, cardReady, step]);

  useEffect(() => {
    if (step === 'user_requesting') {
      const timer = setTimeout(() => {
        setStep('writing');
      }, userRequest.length * 30 + 500);
      return () => clearTimeout(timer);
    }
  }, [step, userRequest.length]);

  useEffect(() => {
    if (step === 'writing') {
      const timer = setTimeout(() => {
        setStep('complete');
        unlockFeature('theme');
      }, letterText.length * 30 + 1000);
      return () => clearTimeout(timer);
    }
  }, [step, unlockFeature, letterText.length]);

  const handleStart = () => {
    if (isPreview && cardReady) {
      setStep('user_requesting');
    } else {
      setPreviewCard('letter');
    }
  };

  if (step === 'locked') {
    return (
      <LockedDemoCard
        number="3"
        icon={<Icons.Heart />}
        title="Carta de Amor"
        description="Complete a demo anterior para desbloquear"
      />
    );
  }

  if (!isPreview && isInPreview && !isAnimating) {
    return <div className="opacity-0 pointer-events-none" aria-hidden="true" />;
  }

  return (
    <ActiveDemoCard
      cardRef={cardRef}
      cardId="letter"
      number="3"
      icon={<Icons.Heart />}
      title="Carta de Amor"
      description="IA escreve por você"
      isPreview={isPreview}
      cardReady={cardReady}
      onClose={onClose}
    >
      <div className="flex flex-col space-y-3">
        {step === 'idle' && (
          <button
            onClick={handleStart}
            className="w-full text-sm py-3 px-4 rounded-lg transition-colors font-semibold text-white"
            style={{ background: 'var(--primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
          >
            <Icons.Sparkles className="w-4 h-4 inline mr-2" />
            Pedir à IA
          </button>
        )}

        {(step === 'user_requesting' || step === 'writing' || step === 'complete') && (
          <>
            <div 
              className="rounded-lg p-3 border self-end max-w-[85%]"
              style={{ 
                background: 'var(--demo-icon-bg)',
                borderColor: 'var(--border)',
                height: '80px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start'
              }}
            >
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Você:</div>
              <div className="text-sm flex-1 overflow-hidden" style={{ color: 'var(--text)' }}>
                {step === 'user_requesting' ? <Typewriter text={userRequest} speed={30} /> : userRequest}
              </div>
            </div>

            {(step === 'writing' || step === 'complete') && (
              <div 
                className="rounded-lg p-4 border"
                style={{ 
                  background: 'var(--primary-light)',
                  borderColor: 'var(--primary)'
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 animate-pulse flex-shrink-0" style={{ background: 'var(--primary)' }}></div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold mb-2" style={{ color: 'var(--primary)' }}>IA:</div>
                    <div className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                      {step === 'writing' ? <Typewriter text={letterText} speed={30} /> : letterText}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ActiveDemoCard>
  );
};

/**
 * ═══════════════════════════════════════════════════════════════
 * DEMO 4: ESCOLHER TEMA
 * ═══════════════════════════════════════════════════════════════
 * 
 * Quarta demo. IA apresenta 4 temas visuais com paletas de cores
 * para personalização da página. Simula seleção automática progressiva.
 * 
 * Temas disponíveis:
 * - Romântico: Rosa e tons quentes
 * - Elegante: Tons escuros e dourados
 * - Moderno: Roxo e azul vibrante
 * - Clássico: Marrom e dourado clássico
 * 
 * Estados:
 * - locked: Aguardando desbloqueio do Demo 3
 * - idle: Desbloqueado, aguardando início
 * - ai_suggesting: IA explicando temas (typewriter)
 * - selecting: Selecionando temas progressivamente
 * - complete: Tema selecionado
 * 
 * @component
 * @param {DemoProps} props - Propriedades do demo
 */

export const ThemeDemo = ({ isPreview = false, cardReady = false, onClose }: DemoProps = {}) => {
  const { unlockedFeatures, unlockFeature, setPreviewCard, previewCard, isAnimating } = useDemo();
  const [step, setStep] = useState<'locked' | 'idle' | 'ai_suggesting' | 'selecting' | 'complete'>('locked');
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [aiMessageComplete, setAiMessageComplete] = useState(false);
  const cardRef = useCardAnimation('theme', isPreview);
  const isInPreview = previewCard === 'theme';

  const themes = [
    { name: 'Romântico', colors: ['#FF3366', '#FDA4AF', '#FFB6C1'] },
    { name: 'Elegante', colors: ['#1A1A2E', '#C5A880', '#F4E4C1'] },
    { name: 'Moderno', colors: ['#6C63FF', '#00D4FF', '#F0F0F0'] },
    { name: 'Clássico', colors: ['#8B4513', '#D4AF37', '#F5F5DC'] }
  ];

  const aiMessage = "Perfeito! Agora escolha um tema visual que represente a personalidade da página que você quer criar para seu amor. Cada tema tem sua própria paleta de cores e estilo único! ✨";

  useEffect(() => {
    if (unlockedFeatures.has('theme')) {
      if (step === 'locked') {
        setStep('idle');
      }
    }
  }, [unlockedFeatures, step]);

  useEffect(() => {
    if (isPreview && cardReady && step === 'idle') {
      setStep('ai_suggesting');
    }
  }, [isPreview, cardReady, step]);

  useEffect(() => {
    if (step === 'ai_suggesting' && aiMessageComplete) {
      const timer = setTimeout(() => {
        setStep('selecting');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [step, aiMessageComplete]);

  useEffect(() => {
    if (step === 'selecting') {
      let index = 0;
      const interval = setInterval(() => {
        if (index < themes.length) {
          setSelectedTheme(themes[index].name);
          index++;
        } else {
          clearInterval(interval);
          setStep('complete');
          unlockFeature('qrcode');
        }
      }, 700);
      return () => clearInterval(interval);
    }
  }, [step, unlockFeature]);

  const handleStart = () => {
    if (isPreview && cardReady) {
      setSelectedTheme('');
      setAiMessageComplete(false);
      setStep('ai_suggesting');
    } else {
      setPreviewCard('theme');
    }
  };

  if (step === 'locked') {
    return (
      <LockedDemoCard
        number="4"
        icon={<Icons.Sparkles />}
        title="Escolher Tema"
        description="Complete a demo anterior para desbloquear"
      />
    );
  }

  if (!isPreview && isInPreview && !isAnimating) {
    return <div className="opacity-0 pointer-events-none" aria-hidden="true" />;
  }

  return (
    <ActiveDemoCard
      cardRef={cardRef}
      cardId="theme"
      number="4"
      icon={<Icons.Sparkles />}
      title="Escolher Tema"
      description="Personalize o visual"
      isPreview={isPreview}
      cardReady={cardReady}
      onClose={onClose}
    >
      <div className="flex flex-col space-y-3">
        {step === 'idle' && (
          <button
            onClick={handleStart}
            className="w-full text-sm py-3 px-4 rounded-lg transition-colors font-semibold text-white"
            style={{ background: 'var(--primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
          >
            <Icons.Sparkles className="w-4 h-4 inline mr-2" />
            Escolher Tema
          </button>
        )}

        {(step === 'ai_suggesting' || step === 'selecting' || step === 'complete') && (
          <div 
            className="rounded-lg p-4 border"
            style={{ 
              background: 'var(--primary-light)',
              borderColor: 'var(--primary)'
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-1.5 animate-pulse flex-shrink-0" style={{ background: 'var(--primary)' }}></div>
              <div className="flex-1">
                <div className="text-xs font-semibold mb-1" style={{ color: 'var(--primary)' }}>IA:</div>
                <div className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                  {step === 'ai_suggesting' ? (
                    <Typewriter 
                      text={aiMessage}
                      speed={30}
                      onComplete={() => setAiMessageComplete(true)}
                    />
                  ) : (
                    aiMessage
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {(step === 'selecting' || step === 'complete') && (
          <div 
            className="rounded-lg p-4 border"
            style={{ 
              background: 'var(--bg-card)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              {themes.map((theme, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border transition-all animate-fadeIn"
                  style={{
                    background: selectedTheme === theme.name ? 'var(--demo-icon-bg)' : 'transparent',
                    borderColor: selectedTheme === theme.name ? 'var(--primary)' : 'var(--border)',
                    boxShadow: selectedTheme === theme.name ? '0 0 0 2px var(--primary)' : 'none'
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      {theme.name}
                    </div>
                    {selectedTheme === theme.name && (
                      <Icons.Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex gap-1">
                    {theme.colors.map((color, colorIdx) => (
                      <div
                        key={colorIdx}
                        className="w-6 h-6 rounded-full border-2 border-white/20"
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {step === 'selecting' && (
              <div className="flex items-center gap-2 text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
                <Loader2Icon className="w-3 h-3 animate-spin" />
                <span>Analisando temas...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </ActiveDemoCard>
  );
};

/**
 * ═══════════════════════════════════════════════════════════════
 * DEMO 5: GERAR QR CODE
 * ═══════════════════════════════════════════════════════════════
 * 
 * Quinta demo. Simula geração de QR Code para compartilhamento
 * do presente eterno. Utiliza API pública do QR Server.
 * 
 * O QR Code gerado aponta para: https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * 
 * Estados:
 * - locked: Aguardando desbloqueio do Demo 4
 * - idle: Desbloqueado, aguardando início
 * - generating: Simulando geração (2 segundos)
 * - complete: QR Code gerado e exibido
 * 
 * Nota: No preview (expandido), o conteúdo é centralizado verticalmente.
 * 
 * @component
 * @param {DemoProps} props - Propriedades do demo
 */

export const QRCodeDemo = ({ isPreview = false, cardReady = false, onClose }: DemoProps = {}) => {
  const { unlockedFeatures, unlockFeature, setPreviewCard, previewCard, isAnimating } = useDemo();
  const [step, setStep] = useState<'locked' | 'idle' | 'generating' | 'complete'>('locked');
  const cardRef = useCardAnimation('qrcode', isPreview);
  const isInPreview = previewCard === 'qrcode';

  const qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.youtube.com/watch?v=dQw4w9WgXcQ';

  useEffect(() => {
    if (unlockedFeatures.has('qrcode')) {
      if (step === 'locked') {
        setStep('idle');
      }
    }
  }, [unlockedFeatures, step]);

  useEffect(() => {
    if (isPreview && cardReady && step === 'idle') {
      setStep('generating');
    }
  }, [isPreview, cardReady, step]);

  useEffect(() => {
    if (step === 'generating') {
      const timer = setTimeout(() => {
        setStep('complete');
        unlockFeature('share');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, unlockFeature]);

  const handleStart = () => {
    if (isPreview && cardReady) {
      setStep('generating');
    } else {
      setPreviewCard('qrcode');
    }
  };

  if (step === 'locked') {
    return (
      <LockedDemoCard
        number="5"
        icon={<Icons.QRCode />}
        title="Gerar QR Code"
        description="Complete a demo anterior para desbloquear"
      />
    );
  }

  if (!isPreview && isInPreview && !isAnimating) {
    return <div className="opacity-0 pointer-events-none" aria-hidden="true" />;
  }

  return (
    <ActiveDemoCard
      cardRef={cardRef}
      cardId="qrcode"
      number="5"
      icon={<Icons.QRCode />}
      title="Gerar QR Code"
      description="Compartilhe facilmente"
      isPreview={isPreview}
      cardReady={cardReady}
      onClose={onClose}
    >
      <div className={`flex flex-col ${isPreview ? 'h-full justify-center items-center' : ''}`}>
        {step === 'idle' && (
          <button
            onClick={handleStart}
            className="w-full text-sm py-3 px-4 rounded-lg transition-colors font-semibold text-white"
            style={{ background: 'var(--primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
          >
            <Icons.Sparkles className="w-4 h-4 inline mr-2" />
            Gerar QR Code
          </button>
        )}

        {step === 'generating' && (
          <div className={`flex flex-col items-center gap-3 animate-fadeIn ${isPreview ? 'justify-center h-full' : ''}`}>
            <div style={{ color: 'var(--primary)' }}>
              <Loader2Icon className="w-12 h-12 animate-spin" />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Gerando QR Code...
            </span>
          </div>
        )}

        {step === 'complete' && (
          <div className={`flex flex-col items-center gap-4 animate-fadeIn w-full ${isPreview ? 'justify-center h-full' : ''}`}>
            <div 
              className="p-4 bg-white rounded-2xl shadow-lg"
              style={{ 
                border: '3px solid',
                borderColor: 'var(--primary)'
              }}
            >
              <img 
                src={qrCodeUrl}
                alt="QR Code"
                className="w-40 h-40"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Icons.Check className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                QR Code gerado com sucesso!
              </span>
            </div>
            <div className="text-xs text-center max-w-[200px]" style={{ color: 'var(--text-secondary)' }}>
              Escaneie para acessar seu presente eterno
            </div>
          </div>
        )}
      </div>
    </ActiveDemoCard>
  );
};

/**
 * ═══════════════════════════════════════════════════════════════
 * DEMO 6: CONTADOR DE TEMPO
 * ═══════════════════════════════════════════════════════════════
 * 
 * Sexta e última demo. Calcula o tempo que o casal está junto
 * baseado em uma data de início (15/01/2021 no exemplo).
 * 
 * O cálculo é DINÂMICO e atualiza conforme os dias reais passam:
 * - Hoje (22/12/2025): 4 anos, 11 meses, 7 dias
 * - Amanhã: 4 anos, 11 meses, 8 dias
 * - E assim sucessivamente
 * 
 * Estados:
 * - locked: Aguardando desbloqueio do Demo 5
 * - idle: Desbloqueado, aguardando início
 * - filling: Simulando preenchimento do campo de data
 * - calculating: Calculando tempo (mostra valores progressivamente)
 * - complete: Cálculo finalizado, exibe mensagem da IA
 * 
 * @component
 * @param {DemoProps} props - Propriedades do demo
 */

/**
 * Calcula a diferença de tempo entre uma data de início e hoje.
 * 
 * Implementa cálculo preciso considerando:
 * - Anos completos
 * - Meses restantes (com ajuste para dias negativos)
 * - Dias restantes
 * - Hora atual do dia
 * 
 * @function calculateTimeDifference
 * @param {string} startDateStr - Data de início no formato YYYY-MM-DD
 * @returns {Object} Objeto com years, months, days e hours
 * 
 * @example
 * calculateTimeDifference('2021-01-15')
 * // Retorna: { years: 4, months: 11, days: 7, hours: 14 }
 */

const calculateTimeDifference = (startDateStr: string) => {
  const start = new Date(startDateStr);
  const now = new Date();
  
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  
  if (days < 0) {
    months--;
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += lastMonth.getDate();
  }
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  const hours = now.getHours();
  
  return { years, months, days, hours };
};

export const ShareDemo = ({ isPreview = false, cardReady = false, onClose }: DemoProps = {}) => {
  const { unlockedFeatures, setPreviewCard, previewCard, isAnimating } = useDemo();
  const [step, setStep] = useState<'locked' | 'idle' | 'filling' | 'calculating' | 'complete'>('locked');
  const [startDate, setStartDate] = useState('');
  const [timeUnits, setTimeUnits] = useState<Array<{ value: number; label: string }>>([]);
  const [calculatedTime, setCalculatedTime] = useState<{ years: number; months: number; days: number; hours: number } | null>(null);
  const cardRef = useCardAnimation('share', isPreview);
  const isInPreview = previewCard === 'share';

  useEffect(() => {
    if (startDate) {
      const timeDiff = calculateTimeDifference(startDate);
      setCalculatedTime(timeDiff);
    }
  }, [startDate]);

  const aiMessage = calculatedTime 
    ? `Que lindo! Vocês estão juntos há ${calculatedTime.years} ${calculatedTime.years === 1 ? 'ano' : 'anos'}, ${calculatedTime.months} ${calculatedTime.months === 1 ? 'mês' : 'meses'}, ${calculatedTime.days} ${calculatedTime.days === 1 ? 'dia' : 'dias'} e ${calculatedTime.hours} ${calculatedTime.hours === 1 ? 'hora' : 'horas'}! Um contador em tempo real será adicionado à sua página para celebrar cada momento juntos. 💕`
    : "Que lindo! Um contador em tempo real será adicionado à sua página para celebrar cada momento juntos. 💕";

  useEffect(() => {
    if (unlockedFeatures.has('share')) {
      if (step === 'locked') {
        setStep('idle');
      }
    }
  }, [unlockedFeatures, step]);

  useEffect(() => {
    if (isPreview && cardReady && step === 'idle') {
      setStep('filling');
    }
  }, [isPreview, cardReady, step]);

  useEffect(() => {
    if (step === 'filling') {
      const timer = setTimeout(() => {
        setStartDate('2021-01-15');
        setTimeout(() => {
          setStep('calculating');
        }, 800);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'calculating' && calculatedTime) {
      setTimeUnits([]);
      const finalTimeUnits = [
        { value: calculatedTime.years, label: 'Anos' },
        { value: calculatedTime.months, label: 'Meses' },
        { value: calculatedTime.days, label: 'Dias' },
        { value: calculatedTime.hours, label: 'Horas' }
      ];
      
      let index = 0;
      const interval = setInterval(() => {
        if (index < finalTimeUnits.length && finalTimeUnits[index]) {
          setTimeUnits(prev => [...prev, finalTimeUnits[index]]);
          index++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setStep('complete');
          }, 500);
        }
      }, 600);
      return () => clearInterval(interval);
    }
  }, [step, calculatedTime]);

  const handleStart = () => {
    if (isPreview && cardReady) {
      setStartDate('');
      setTimeUnits([]);
      setCalculatedTime(null);
      setStep('filling');
    } else {
      setPreviewCard('share');
    }
  };

  if (step === 'locked') {
    return (
      <LockedDemoCard
        number="6"
        icon={<Icons.Heart />}
        title="Contador de Tempo"
        description="Complete a demo anterior para desbloquear"
      />
    );
  }

  if (!isPreview && isInPreview && !isAnimating) {
    return <div className="opacity-0 pointer-events-none" aria-hidden="true" />;
  }

  return (
    <ActiveDemoCard
      cardRef={cardRef}
      cardId="share"
      number="6"
      icon={<Icons.Heart />}
      title="Contador de Tempo"
      description="Calcule o tempo juntos"
      isPreview={isPreview}
      cardReady={cardReady}
      onClose={onClose}
    >
      <div className="flex flex-col space-y-3">
        {step === 'idle' && (
          <button
            onClick={handleStart}
            className="w-full text-sm py-3 px-4 rounded-lg transition-colors font-semibold text-white"
            style={{ background: 'var(--primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
          >
            <Icons.Sparkles className="w-4 h-4 inline mr-2" />
            Configurar Contador
          </button>
        )}

        {(step === 'filling' || step === 'calculating' || step === 'complete') && (
          <>
            <div 
              className="rounded-lg p-4 border"
              style={{ 
                background: 'var(--bg-card)',
                borderColor: 'var(--border)'
              }}
            >
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                    Data de Início do Relacionamento
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm border transition-colors"
                    style={{ 
                      background: 'var(--bg-deep)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)'
                    }}
                    disabled={step !== 'filling'}
                  />
                </div>
                {step === 'filling' && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <Loader2Icon className="w-3 h-3 animate-spin" />
                    <span>Preenchendo...</span>
                  </div>
                )}
              </div>
            </div>

            {(step === 'calculating' || step === 'complete') && (
              <>
                <div 
                  className="rounded-lg p-6 border"
                  style={{ 
                    background: 'var(--bg-card)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <div className="text-center mb-4">
                    <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Tempo Juntos
                    </div>
                    <div className="text-2xl font-black mb-1" style={{ color: 'var(--primary)' }}>
                      ∞
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {timeUnits.map((unit, idx) => {
                      if (!unit || !unit.value || !unit.label) return null;
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-xl text-center animate-fadeIn"
                          style={{ 
                            background: 'var(--demo-icon-bg)',
                            border: '2px solid var(--demo-card-border)'
                          }}
                        >
                          <div className="text-3xl font-black mb-1" style={{ color: 'var(--primary)' }}>
                            {unit.value}
                          </div>
                          <div className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                            {unit.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {step === 'calculating' && (
                    <div className="flex items-center justify-center gap-2 text-xs mt-4" style={{ color: 'var(--text-secondary)' }}>
                      <Loader2Icon className="w-3 h-3 animate-spin" />
                      <span>Calculando...</span>
                    </div>
                  )}
                </div>

                {step === 'complete' && (
                  <div 
                    className="rounded-lg p-4 border"
                    style={{ 
                      background: 'var(--primary-light)',
                      borderColor: 'var(--primary)'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-1.5 animate-pulse flex-shrink-0" style={{ background: 'var(--primary)' }}></div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold mb-1" style={{ color: 'var(--primary)' }}>IA:</div>
                        <div className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                          <Typewriter 
                            text={aiMessage}
                            speed={30}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </ActiveDemoCard>
  );
};
