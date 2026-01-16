'use client';

/**
 * Global Error Page
 * Este componente é renderizado quando ocorre um erro no layout root.
 * NÃO pode usar contextos (ThemeContext, AuthContext) porque eles podem estar quebrados.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body style={{
        margin: 0,
        padding: 0,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0515 0%, #1a0a14 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#ffffff',
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          maxWidth: '500px',
        }}>
          {/* Ícone de erro */}
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 24px',
            borderRadius: '50%',
            background: 'rgba(255, 51, 102, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FF3366"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          {/* Título */}
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            margin: '0 0 12px',
            color: '#ffffff',
          }}>
            Algo deu errado
          </h1>

          {/* Descrição */}
          <p style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.7)',
            margin: '0 0 32px',
            lineHeight: 1.6,
          }}>
            Ocorreu um erro inesperado. Por favor, tente novamente.
          </p>

          {/* Botão de retry */}
          <button
            onClick={() => reset()}
            style={{
              padding: '14px 32px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#ffffff',
              background: 'linear-gradient(135deg, #FF3366 0%, #cc2952 100%)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(255, 51, 102, 0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 25px rgba(255, 51, 102, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 51, 102, 0.3)';
            }}
          >
            Tentar Novamente
          </button>

          {/* Link para home */}
          <div style={{ marginTop: '20px' }}>
            <a
              href="/"
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.5)',
                textDecoration: 'none',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#FF3366';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
              }}
            >
              Voltar para a página inicial
            </a>
          </div>

          {/* Info do erro (apenas em dev) */}
          {process.env.NODE_ENV === 'development' && error.message && (
            <div style={{
              marginTop: '40px',
              padding: '16px',
              background: 'rgba(255, 51, 102, 0.1)',
              borderRadius: '8px',
              textAlign: 'left',
            }}>
              <p style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.5)',
                margin: '0 0 8px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                Erro (dev only):
              </p>
              <code style={{
                fontSize: '13px',
                color: '#FF3366',
                wordBreak: 'break-all',
              }}>
                {error.message}
              </code>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}

