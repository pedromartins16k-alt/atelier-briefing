import React, { useMemo } from 'react';
import type { BriefingData } from '../../types';
import { Sparkles, ShoppingBag, Calendar, MessageCircle, Star } from 'lucide-react';
import { getFormConfigSync, DEFAULT_PALETTES } from '../../services/formConfigService';
import type { ColorPaletteColors } from '../../types';

interface ComputerPreviewProps {
  data: BriefingData;
}

function resolvePalette(data: BriefingData): ColorPaletteColors {
  // 1. Paleta personalizada pelo usuário (color pickers)
  if (data.customPalette) return data.customPalette;

  // 2. Paleta selecionada por ID
  if (data.selectedPaletteId) {
    const config = getFormConfigSync();
    const found = config.palettes.find(p => p.id === data.selectedPaletteId);
    if (found) return found.colors;
    const fallback = DEFAULT_PALETTES.find(p => p.id === data.selectedPaletteId);
    if (fallback) return fallback.colors;
  }

  // 3. Inferência automática por palavras-chave nas cores/percepções
  const colorText = (data.brandColors || '').toLowerCase();
  const perceptions = data.brandPerceptions || [];

  if (colorText.includes('preto') || colorText.includes('escuro') || colorText.includes('black') || perceptions.includes('Luxuosa')) {
    const p = DEFAULT_PALETTES.find(p => p.id === 'onyx');
    if (p) return p.colors;
  }
  if (colorText.includes('azul') || colorText.includes('marinho') || colorText.includes('ciano')) {
    const p = DEFAULT_PALETTES.find(p => p.id === 'cobalt');
    if (p) return p.colors;
  }
  if (colorText.includes('verde') || colorText.includes('oliva') || colorText.includes('lime')) {
    const p = DEFAULT_PALETTES.find(p => p.id === 'sage');
    if (p) return p.colors;
  }
  if (colorText.includes('rosa') || colorText.includes('blush') || colorText.includes('vermelho')) {
    const p = DEFAULT_PALETTES.find(p => p.id === 'blush');
    if (p) return p.colors;
  }
  if (perceptions.includes('Minimalista')) {
    const p = DEFAULT_PALETTES.find(p => p.id === 'minimal');
    if (p) return p.colors;
  }

  // 4. Default: atelier
  return DEFAULT_PALETTES[0].colors;
}

function resolveTypographyClass(data: BriefingData): string {
  if (data.typographyStyle) {
    const map: Record<string, string> = {
      serif: 'font-serif',
      sans: 'font-sans',
      mono: 'font-mono',
      display: 'font-display'
    };
    return map[data.typographyStyle] || 'font-sans';
  }
  const perceptions = data.brandPerceptions || [];
  if (perceptions.some(p => ['Elegante', 'Sofisticada', 'Luxuosa'].includes(p))) return 'font-serif';
  if (perceptions.some(p => ['Tecnológica', 'Inovadora'].includes(p))) return 'font-mono';
  return 'font-sans';
}

function resolveLayoutVariant(data: BriefingData): string {
  if (data.layoutStyle) return data.layoutStyle;
  if (data.selectedFeatures?.includes('Comprar produtos')) return 'grid';
  if (data.brandPerceptions?.includes('Minimalista')) return 'centered';
  return 'editorial';
}

function resolveBorderRadius(data: BriefingData): string {
  if (data.borderRadiusStyle === 'sharp') return '0px';
  if (data.borderRadiusStyle === 'rounded') return '16px';
  return '6px'; // soft (default)
}

export default function ComputerPreview({ data }: ComputerPreviewProps) {
  const palette = useMemo(() => resolvePalette(data), [data]);
  const fontClass = useMemo(() => resolveTypographyClass(data), [data]);
  const layoutVariant = useMemo(() => resolveLayoutVariant(data), [data]);
  const borderRadius = useMemo(() => resolveBorderRadius(data), [data]);

  const isDark = useMemo(() => {
    // Verifica se o background é escuro pelo hex
    const bg = palette.background;
    if (bg.startsWith('#')) {
      const r = parseInt(bg.slice(1, 3), 16);
      const g = parseInt(bg.slice(3, 5), 16);
      const b = parseInt(bg.slice(5, 7), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.5;
    }
    return false;
  }, [palette.background]);

  // Textos e fallbacks
  const companyName = data.companyName?.trim() || 'Sua Marca';
  const tagline = data.businessDescription?.trim() || data.businessSegment?.trim() || 'Design & Estratégia Digital de Alto Impacto';
  const ctaText = data.singlePrimaryAction?.trim() ||
    (data.selectedFeatures?.includes('Comprar produtos') ? 'Ver Coleção' :
     data.selectedFeatures?.includes('Agendar horário') ? 'Agendar Horário' :
     'Solicitar Orçamento');

  const menuPages = (data.selectedPages?.length > 0)
    ? data.selectedPages.slice(0, 4)
    : ['Home', 'Sobre', 'Serviços', 'Contato'];

  const hasEcommerce = data.selectedFeatures?.includes('Comprar produtos');
  const hasBooking = data.selectedFeatures?.includes('Agendar horário');
  const hasWhatsapp = data.selectedFeatures?.includes('Chamar no WhatsApp');
  const hasTestimonials = data.selectedFeatures?.includes('Ver depoimentos');
  const hasPortfolio = data.selectedFeatures?.includes('Ver portfólio');

  const cssVars = {
    '--preview-primary': palette.primary,
    '--preview-secondary': palette.secondary,
    '--preview-accent': palette.accent,
    '--preview-bg': palette.background,
    '--preview-surface': palette.surface,
    '--preview-text': palette.text,
    '--preview-radius': borderRadius,
  } as React.CSSProperties;

  return (
    <div className="preview-device-wrapper">
      <div className="preview-section-tag">
        <Sparkles size={13} />
        <span>PREVIEW EM TEMPO REAL</span>
      </div>

      {/* Mockup do Notebook */}
      <div className="laptop-mockup">
        <div className="laptop-screen-bezel">
          <div className="laptop-camera" />

          {/* Tela do Mini-Site com CSS variables */}
          <div
            className={`laptop-display ${fontClass} layout-${layoutVariant} ${isDark ? 'is-dark-theme' : 'is-light-theme'}`}
            style={cssVars}
          >
            {/* Nav */}
            <div className="mini-site-nav" style={{ background: palette.surface, borderBottom: `1px solid ${palette.primary}18` }}>
              <div className="mini-brand-logo">
                <span className="logo-symbol" style={{ color: palette.accent }}>✦</span>
                <span className="logo-text" style={{ color: palette.text }}>{companyName}</span>
              </div>
              <div className="mini-nav-links">
                {menuPages.map((page, idx) => (
                  <span
                    key={page}
                    className={`mini-nav-link ${idx === 0 ? 'active' : ''}`}
                    style={{ color: idx === 0 ? palette.primary : palette.secondary }}
                  >
                    {page}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero */}
            <div
              className={`mini-hero layout-hero-${layoutVariant}`}
              style={{ background: `linear-gradient(135deg, ${palette.background} 0%, ${palette.surface} 100%)` }}
            >
              <div className="mini-badge" style={{ background: `${palette.primary}18`, color: palette.primary }}>
                <span>{data.businessSegment || 'Lançamento Exclusivo'}</span>
              </div>

              <h3 className="mini-hero-title" style={{ color: palette.text }}>{companyName}</h3>
              <p className="mini-hero-subtitle" style={{ color: palette.secondary }}>{tagline}</p>

              <div className="mini-hero-actions">
                <button
                  type="button"
                  className="mini-cta-btn"
                  style={{
                    background: palette.primary,
                    color: isDark ? '#111' : '#fff',
                    borderRadius: borderRadius
                  }}
                >
                  {hasEcommerce && <ShoppingBag size={10} />}
                  {hasBooking && !hasEcommerce && <Calendar size={10} />}
                  <span>{ctaText}</span>
                </button>
              </div>
            </div>

            {/* Seção E-commerce */}
            {hasEcommerce && (
              <div className="mini-ecommerce-preview" style={{ background: palette.surface }}>
                <div className="mini-section-label" style={{ color: palette.secondary }}>PRODUTOS EM DESTAQUE</div>
                <div className="mini-product-grid">
                  {['Item Signature', 'Edição Atelier'].map((name, i) => (
                    <div key={name} className="mini-product-card" style={{ background: palette.background, borderRadius: borderRadius }}>
                      <div className={`mini-prod-img prod-${i + 1}`} style={{ background: `${palette.primary}25` }} />
                      <span className="mini-prod-title" style={{ color: palette.text }}>{name}</span>
                      <span className="mini-prod-price" style={{ color: palette.accent }}>R$ {i === 0 ? '290' : '450'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seção Agendamento */}
            {hasBooking && !hasEcommerce && (
              <div className="mini-booking-preview" style={{ background: palette.surface }}>
                <div className="mini-booking-card" style={{ background: palette.background, borderRadius: borderRadius }}>
                  <div className="mini-cal-icon" style={{ color: palette.accent }}>
                    <Calendar size={12} />
                  </div>
                  <div className="mini-booking-info">
                    <strong style={{ color: palette.text }}>
                      {data.featureConditionals?.bookingServiceType || 'Atendimento Personalizado'}
                    </strong>
                    <small style={{ color: palette.secondary }}>Horários disponíveis esta semana</small>
                  </div>
                </div>
              </div>
            )}

            {/* Seção Portfólio (layout editorial) */}
            {hasPortfolio && (layoutVariant === 'editorial' || layoutVariant === 'grid') && (
              <div className="mini-portfolio-preview" style={{ background: palette.background }}>
                <div className="mini-section-label" style={{ color: palette.secondary }}>PORTFÓLIO</div>
                <div className="mini-portfolio-grid">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="mini-portfolio-item"
                      style={{ background: `${palette.primary}${i === 1 ? '30' : '18'}`, borderRadius: borderRadius }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Depoimentos */}
            {hasTestimonials && (
              <div className="mini-testimonial-preview" style={{ background: palette.surface }}>
                <div className="mini-testimonial-card" style={{ background: palette.background, borderRadius: borderRadius }}>
                  <div className="mini-stars">
                    {[1,2,3,4,5].map(s => <Star key={s} size={8} fill={palette.accent} color={palette.accent} />)}
                  </div>
                  <p className="mini-testimonial-text" style={{ color: palette.secondary }}>
                    "Resultado incrível, superou nossas expectativas"
                  </p>
                  <small className="mini-testimonial-author" style={{ color: palette.primary }}>— Cliente Satisfeito</small>
                </div>
              </div>
            )}

            {/* WhatsApp Float */}
            {hasWhatsapp && (
              <div className="mini-whatsapp-float" title="WhatsApp Ativo" style={{ background: '#25D366' }}>
                <MessageCircle size={11} color="#fff" />
              </div>
            )}
          </div>
        </div>

        {/* Base do Notebook */}
        <div className="laptop-base">
          <div className="laptop-notch" />
        </div>
      </div>

      {/* Legenda da paleta ativa */}
      <div className="preview-palette-indicator">
        <div className="palette-swatches">
          {[palette.primary, palette.secondary, palette.accent, palette.background].map((color, i) => (
            <span
              key={i}
              className="palette-swatch-dot"
              style={{ background: color, border: `1.5px solid ${palette.primary}30` }}
              title={color}
            />
          ))}
        </div>
        <span className="palette-indicator-label">Paleta atual</span>
      </div>
    </div>
  );
}
