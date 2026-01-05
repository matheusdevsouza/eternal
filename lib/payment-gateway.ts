/**
 * Abstração do Gateway de Pagamento
 * 
 * Implementação mock para desenvolvimento, pronta para integração com Stripe/PagSeguro.
 */

export type PaymentMethod = 'credit_card' | 'pix' | 'boleto';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod?: PaymentMethod;
  clientSecret?: string;
  pixQRCode?: string;
  pixCode?: string;
  boletoUrl?: string;
  boletoCode?: string;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface CreatePaymentParams {
  amount: number;
  currency?: string;
  method: PaymentMethod;
  customerEmail: string;
  customerName?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentGateway {
  createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent>;
  confirmPayment(paymentIntentId: string, paymentData?: any): Promise<PaymentIntent>;
  refundPayment(paymentIntentId: string, amount?: number): Promise<PaymentIntent>;
  cancelPayment(paymentIntentId: string): Promise<PaymentIntent>;
  getPayment(paymentIntentId: string): Promise<PaymentIntent | null>;
}

// Armazenamento em memória para gateway mock

const mockPayments = new Map<string, PaymentIntent>();

/**
 * Gateway de Pagamento Mock para Desenvolvimento
 */

export class MockPaymentGateway implements PaymentGateway {
  
  /**
   * Criar intenção de pagamento
   */

  async createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent> {
    const id = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const payment: PaymentIntent = {
      id,
      amount: params.amount,
      currency: params.currency || 'BRL',
      status: 'pending',
      paymentMethod: params.method,
      clientSecret: `${id}_secret_${Math.random().toString(36).substr(2, 16)}`,
      metadata: params.metadata,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
    };

    // Gerar código PIX se método for PIX

    if (params.method === 'pix') {
      payment.pixCode = this.generatePixCode(params.amount);
      payment.pixQRCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payment.pixCode)}`;
    }

    // Gerar Boleto se método for boleto

    if (params.method === 'boleto') {
      payment.boletoCode = this.generateBoletoCode();
      payment.boletoUrl = `https://example.com/boleto/${id}`;
      payment.expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 dias
    }

    mockPayments.set(id, payment);
    
    console.log('[MOCK_GATEWAY] Intenção de pagamento criada:', id);
    return payment;
  }

  /**
   * Confirmar pagamento
   */

  async confirmPayment(paymentIntentId: string, paymentData?: any): Promise<PaymentIntent> {
    const payment = mockPayments.get(paymentIntentId);
    
    if (!payment) {
      throw new Error('Pagamento não encontrado');
    }

    if (payment.status !== 'pending') {
      throw new Error(`Pagamento não pode ser confirmado. Status atual: ${payment.status}`);
    }

    // Simular atraso de processamento

    payment.status = 'processing';
    mockPayments.set(paymentIntentId, payment);

    // Para cartão de crédito, simular confirmação imediata
    // Para PIX/Boleto, status seria atualizado via webhook

    if (payment.paymentMethod === 'credit_card') {

      // Simular validação do cartão (90% taxa de sucesso para testes)

      const success = Math.random() > 0.1;
      
      if (success) {
        payment.status = 'completed';
      } else {
        payment.status = 'failed';
      }
    } else {

      // PIX e Boleto: Em produção, seria confirmado via webhook
      // Para mock, auto-confirmar

      payment.status = 'completed';
    }

    mockPayments.set(paymentIntentId, payment);
    console.log('[MOCK_GATEWAY] Pagamento confirmado:', paymentIntentId, payment.status);
    
    return payment;
  }

  /**
   * Reembolsar pagamento
   */

  async refundPayment(paymentIntentId: string, amount?: number): Promise<PaymentIntent> {
    const payment = mockPayments.get(paymentIntentId);
    
    if (!payment) {
      throw new Error('Pagamento não encontrado');
    }

    if (payment.status !== 'completed') {
      throw new Error('Apenas pagamentos completos podem ser reembolsados');
    }

    payment.status = 'refunded';
    mockPayments.set(paymentIntentId, payment);
    
    console.log('[MOCK_GATEWAY] Pagamento reembolsado:', paymentIntentId);
    return payment;
  }

  /**
   * Cancelar pagamento
   */

  async cancelPayment(paymentIntentId: string): Promise<PaymentIntent> {
    const payment = mockPayments.get(paymentIntentId);
    
    if (!payment) {
      throw new Error('Pagamento não encontrado');
    }

    if (payment.status !== 'pending') {
      throw new Error('Apenas pagamentos pendentes podem ser cancelados');
    }

    payment.status = 'cancelled';
    mockPayments.set(paymentIntentId, payment);
    
    console.log('[MOCK_GATEWAY] Pagamento cancelado:', paymentIntentId);
    return payment;
  }

  /**
   * Buscar pagamento por ID
   */

  async getPayment(paymentIntentId: string): Promise<PaymentIntent | null> {
    return mockPayments.get(paymentIntentId) || null;
  }

  /**
   * Gerar código PIX fake
   */

  private generatePixCode(amount: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '00020126580014BR.GOV.BCB.PIX0136';
    for (let i = 0; i < 36; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += `5204000053039865802BR5925ETERNAL GIFT6009SAO PAULO62070503***6304`;
    return code;
  }

  /**
   * Gerar código de Boleto fake
   */

  private generateBoletoCode(): string {
    let code = '';
    for (let i = 0; i < 47; i++) {
      code += Math.floor(Math.random() * 10).toString();
    }
    return code;
  }
}

// Instância singleton do gateway

let gatewayInstance: PaymentGateway | null = null;

/**
 * Obter instância do gateway de pagamento
 */

export function getPaymentGateway(): PaymentGateway {
  if (!gatewayInstance) {

    // Em produção, verificar tipo de gateway nas variáveis de ambiente

    const gatewayType = process.env.PAYMENT_GATEWAY || 'mock';
    
    switch (gatewayType) {
      case 'stripe':
        // TODO: Implementar gateway Stripe
        console.warn('[PAYMENT] Gateway Stripe não implementado, usando mock');
        gatewayInstance = new MockPaymentGateway();
        break;
      case 'pagseguro':
        // TODO: Implementar gateway PagSeguro
        console.warn('[PAYMENT] Gateway PagSeguro não implementado, usando mock');
        gatewayInstance = new MockPaymentGateway();
        break;
      default:
        gatewayInstance = new MockPaymentGateway();
    }
  }
  
  return gatewayInstance;
}

/**
 * Verificar assinatura de webhook (placeholder para produção)
 */

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // Em produção, implementar verificação de assinatura adequada
  // Para mock, sempre retornar true

  return true;
}
