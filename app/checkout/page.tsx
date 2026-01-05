'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { PLAN_CONFIG } from '@/lib/plan-config';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planParam = searchParams.get('plan') || 'PREMIUM';
  
  const [selectedPlan, setSelectedPlan] = useState(planParam.toUpperCase());
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix' | 'boleto'>('pix');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [error, setError] = useState('');
  const [checkoutData, setCheckoutData] = useState<any>(null);

  const planConfig = PLAN_CONFIG[selectedPlan as keyof typeof PLAN_CONFIG];
  const originalPrice = planConfig?.price || 0;
  const discount = couponApplied?.discount || 0;
  const finalPrice = originalPrice - discount;

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setValidatingCoupon(true);
    setError('');

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, plan: selectedPlan }),
      });

      const data = await response.json();

      if (data.valid) {
        setCouponApplied(data);
      } else {
        setError(data.error || 'Cupom inválido');
        setCouponApplied(null);
      }
    } catch (err) {
      setError('Erro ao validar cupom');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          paymentMethod,
          couponCode: couponApplied?.coupon?.code || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push(`/login?redirect=/checkout?plan=${selectedPlan}`);
          return;
        }
        setError(data.error || 'Erro no checkout');
        return;
      }

      setCheckoutData(data.checkout);
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!checkoutData) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: checkoutData.paymentId,
          gatewayId: checkoutData.gatewayId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao confirmar pagamento');
        return;
      }

      if (data.success && data.subscription) {
        router.push('/checkout/success');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className="pt-24 pb-20 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Checkout</h1>
            <p className="text-[var(--text-secondary)]">
              Complete sua assinatura do plano {planConfig?.displayName}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
              <h2 className="text-lg font-bold mb-4">Resumo do Pedido</h2>
              <div className="space-y-3 mb-6">
                {Object.entries(PLAN_CONFIG).map(([key, plan]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedPlan(key);
                      setCouponApplied(null);
                    }}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedPlan === key
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                        : 'border-[var(--border)] hover:border-[var(--border-hover)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">{plan.displayName}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{plan.description}</p>
                      </div>
                      <p className="font-bold text-[var(--primary)]">{plan.priceDisplay}/mês</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Cupom de Desconto</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="CODIGO"
                    className="flex-1 px-4 py-3 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl outline-none focus:border-[var(--primary)]"
                  />
                  <button
                    onClick={handleValidateCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="px-4 py-3 bg-[var(--bg-card-hover)] rounded-xl font-medium hover:bg-[var(--border)] transition-all disabled:opacity-50"
                  >
                    {validatingCoupon ? '...' : 'Aplicar'}
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-sm text-green-400 mt-2">
                    ✓ {couponApplied.discountDisplay} aplicado!
                  </p>
                )}
              </div>
              <div className="border-t border-[var(--border)] pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Subtotal</span>
                  <span>{formatPrice(originalPrice)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Desconto</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-[var(--border)]">
                  <span>Total</span>
                  <span className="text-[var(--primary)]">{formatPrice(finalPrice)}</span>
                </div>
              </div>
            </div>
            <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border)]">
              <h2 className="text-lg font-bold mb-4">Pagamento</h2>

              {!checkoutData ? (
                <>
                  <div className="space-y-3 mb-6">
                    {[
                      { id: 'pix', label: 'PIX', icon: '💳', description: 'Aprovação instantânea' },
                      { id: 'credit_card', label: 'Cartão de Crédito', icon: '💳', description: 'Visa, Master, Elo' },
                      { id: 'boleto', label: 'Boleto Bancário', icon: '📄', description: 'Até 3 dias úteis' },
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                          paymentMethod === method.id
                            ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                            : 'border-[var(--border)] hover:border-[var(--border-hover)]'
                        }`}
                      >
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <p className="font-medium">{method.label}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{method.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full py-4 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Processando...' : `Pagar ${formatPrice(finalPrice)}`}
                  </button>
                </>
              ) : (
                <div className="space-y-6">
                  {paymentMethod === 'pix' && checkoutData.pixQRCode && (
                    <div className="text-center">
                      <p className="text-sm text-[var(--text-secondary)] mb-4">
                        Escaneie o QR Code ou copie o código PIX
                      </p>
                      <img
                        src={checkoutData.pixQRCode}
                        alt="QR Code PIX"
                        className="mx-auto mb-4 rounded-xl"
                      />
                      <div className="bg-[var(--bg-deep)] p-3 rounded-xl">
                        <p className="text-xs text-[var(--text-secondary)] mb-1">Código PIX</p>
                        <p className="text-xs font-mono break-all">{checkoutData.pixCode?.substring(0, 50)}...</p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'credit_card' && (
                    <div className="text-center py-8">
                      <p className="text-lg font-medium mb-2">Pagamento com Cartão</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        No ambiente de produção, aqui aparecerá o formulário de cartão seguro.
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'boleto' && checkoutData.boletoUrl && (
                    <div className="text-center">
                      <p className="text-sm text-[var(--text-secondary)] mb-4">
                        Boleto gerado! Pague em qualquer banco ou app.
                      </p>
                      <a
                        href={checkoutData.boletoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-6 py-3 bg-[var(--bg-deep)] rounded-xl hover:bg-[var(--border)] transition-all"
                      >
                        Abrir Boleto
                      </a>
                    </div>
                  )}

                  <button
                    onClick={handleConfirmPayment}
                    disabled={loading}
                    className="w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Confirmando...' : 'Confirmar Pagamento'}
                  </button>

                  <p className="text-xs text-center text-[var(--text-secondary)]">
                    Em ambiente de produção, o pagamento seria verificado automaticamente.
                  </p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-[var(--border)] text-center">
                <p className="text-xs text-[var(--text-secondary)]">
                  🔒 Pagamento 100% seguro
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text)]">
      <Navbar />
      <Suspense fallback={
        <div className="pt-24 pb-20 px-6 min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <CheckoutContent />
      </Suspense>
      <Footer />
    </div>
  );
}
