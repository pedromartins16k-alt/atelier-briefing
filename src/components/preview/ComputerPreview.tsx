import React, { useMemo } from 'react';
import type { BriefingData, FormConfig, ColorPaletteColors } from '../../types';
import { Sparkles, ShoppingBag, Calendar, MessageCircle, Star } from 'lucide-react';
import { getFormConfigSync, DEFAULT_PALETTES } from '../../services/formConfigService';
import { FEATURE_ALIASES, hasSelectedFeature } from '../../utils/featureMatchers';

interface ComputerPreviewProps {
  data: BriefingData;
  config?: FormConfig;
}

function getHexLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return 0.5;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function resolvePalette(data: BriefingData, config?: FormConfig): ColorPaletteColors {
  // 1. Paleta personalizada pelo usuário (color pickers)
  if (data.customPalette) return data.customPalette;

  // 2. Paleta selecionada por ID
  const palettes = config?.palettes || getFormConfigSync().palettes;
  if (data.selectedPaletteId) {
    const found = palettes.find(p => p.id === data.selectedPaletteId);
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
  return palettes.find(p => p.enabled)?.colors || DEFAULT_PALETTES[0].colors;
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

function resolveLayoutVariant(data: BriefingData, hasEcommerce: boolean): string {
  if (data.layoutStyle) return data.layoutStyle;
  if (data.visualStyle === 'minimal') return 'centered';
  if (data.visualStyle === 'bold' || data.visualStyle === 'playful') return 'grid';
  if (data.visualStyle === 'elegant' || data.visualStyle === 'modern') return 'editorial';
  if (hasEcommerce) return 'grid';
  if (data.brandPerceptions?.includes('Minimalista')) return 'centered';
  return 'editorial';
}

function resolveBorderRadius(data: BriefingData): string {
  if (data.borderRadiusStyle === 'sharp') return '0px';
  if (data.borderRadiusStyle === 'rounded') return '16px';
  return '6px'; // soft (default)
}

export default function ComputerPreview({ data, config }: ComputerPreviewProps) {
  const activeConfig = config || getFormConfigSync();
  const palette = useMemo(() => resolvePalette(data, activeConfig), [data, activeConfig]);
  const fontClass = useMemo(() => resolveTypographyClass(data), [data]);

  const hasEcommerce = hasSelectedFeature(data.selectedFeatures, FEATURE_ALIASES.ecommerce, 'ecommerce', activeConfig.features);
  const hasBooking = hasSelectedFeature(data.selectedFeatures, FEATURE_ALIASES.booking, 'booking', activeConfig.features);
  const hasWhatsapp = hasSelectedFeature(data.selectedFeatures, FEATURE_ALIASES.whatsapp, undefined, activeConfig.features);
  const hasTestimonials = hasSelectedFeature(data.selectedFeatures, FEATURE_ALIASES.testimonials, undefined, activeConfig.features);
  const hasPortfolio = hasSelectedFeature(data.selectedFeatures, FEATURE_ALIASES.portfolio, undefined, activeConfig.features);

  const layoutVariant = useMemo(() => resolveLayoutVariant(data, hasEcommerce), [data, hasEcommerce]);
  const borderRadius = useMemo(() => resolveBorderRadius(data), [data]);

  const isDark = useMemo(() => getHexLuminance(palette.background) < 0.5, [palette.background]);
  const ctaBg = useMemo(
    () => (isDark && getHexLuminance(palette.primary) < 0.3 ? palette.accent : palette.primary),
    [isDark, palette.primary, palette.accent]
  );
  const ctaTextColor = useMemo(
    () => (getHexLuminance(ctaBg) > 0.55 ? '#171918' : '#FFFFFF'),
    [ctaBg]
  );
  const readableAccent = useMemo(
    () => (isDark && getHexLuminance(palette.primary) < 0.35 ? palette.accent : palette.primary),
    [isDark, palette.primary, palette.accent]
  );

  // Textos e fallbacks
  const companyName = data.companyName?.trim() || 'Sua Marca';
  const tagline = data.businessDescription?.trim() || data.businessSegment?.trim() || 'Design & Estratégia Digital de Alto Impacto';
  const ctaText = data.singlePrimaryAction?.trim() ||
    (hasEcommerce ? 'Ver Coleção' :
     hasBooking ? 'Agendar Horário' :
     'Solicitar Orçamento');

  const menuPages = (data.selectedPages?.length > 0)
    ? data.selectedPages.slice(0, 4)
    : ['Home', 'Sobre', 'Serviços', 'Contato'];

  const cssVars = {
    '--preview-primary': palette.primary,
    '--preview-secondary': palette.secondary,
    '--preview-accent': palette.accent,
    '--preview-bg': palette.background,
    '--preview-surface': palette.surface,
    '--preview-text': palette.text,
    '--preview-radius': borderRadius,
    '--mini-primary': readableAccent,
    '--mini-primary-hover': readableAccent,
    '--mini-bg': palette.background,
    '--mini-surface': palette.surface,
    '--mini-text': palette.text,
    '--mini-muted': isDark ? '#A3A3A3' : palette.secondary,
    '--mini-border': `${readableAccent}25`,
    '--mini-badge': `${readableAccent}18`,
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
            <div className="mini-site-nav" style={{ background: palette.surface, borderBottom: `1px solid ${readableAccent}22` }}>
              <div className="mini-brand-logo">
                <span className="logo-symbol" style={{ color: palette.accent }}>✦</span>
                <span className="logo-text" style={{ color: palette.text }}>{companyName}</span>
              </div>
              <div className="mini-nav-links">
                {menuPages.map((page, idx) => (
                  <span
                    key={page}
                    className={`mini-nav-link ${idx === 0 ? 'active' : ''}`}
                    style={{ color: idx === 0 ? readableAccent : (isDark ? '#B5B5B5' : palette.secondary) }}
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
              <div className="mini-badge" style={{ background: `${readableAccent}22`, color: readableAccent }}>
                <span>{data.businessSegment || 'Lançamento Exclusivo'}</span>
              </div>

              <h3 className="mini-hero-title" style={{ color: palette.text }}>{companyName}</h3>
              <p className="mini-hero-subtitle" style={{ color: isDark ? '#B8B8B8' : palette.secondary }}>{tagline}</p>

              <div className="mini-hero-actions">
                <button
                  type="button"
                  className="mini-cta-btn"
                  style={{
                    background: ctaBg,
                    color: ctaTextColor,
                    borderRadius: borderRadius
                  }}
                >
                  {hasEcommerce && <ShoppingBag size={10} />}
                  {hasBooking && !hasEcommerce && <Calendar size={10} />}
                  <span>{ctaText}</span>
                </button>
              </div>

              {layoutVariant === 'grid' && !hasEcommerce && (
                <div className="mini-grid-highlights">
                  <div className="mini-grid-tile" style={{ background: palette.surface, borderRadius: borderRadius, border: `1px solid ${readableAccent}22` }}>
                    <span className="mini-tile-dot" style={{ background: palette.accent }} />
                    <small style={{ color: palette.text }}>Diferencial</small>
                  </div>
                  <div className="mini-grid-tile" style={{ background: palette.surface, borderRadius: borderRadius, border: `1px solid ${readableAccent}22` }}>
                    <span className="mini-tile-dot" style={{ background: readableAccent }} />
                    <small style={{ color: palette.text }}>Soluções</small>
                  </div>
                </div>
              )}
            </div>

            {/* Seção E-commerce */}
            {hasEcommerce && (
              <div className="mini-ecommerce-preview" style={{ background: palette.surface }}>
                <div className="mini-section-label" style={{ color: isDark ? '#A3A3A3' : palette.secondary }}>PRODUTOS EM DESTAQUE</div>
                <div className="mini-product-grid">
                  {['Item Signature', 'Edição Atelier'].map((name, i) => (
                    <div key={name} className="mini-product-card" style={{ background: palette.background, borderRadius: borderRadius }}>
                      <div className={`mini-prod-img prod-${i + 1}`} style={{ background: `${readableAccent}28` }} />
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
                    <small style={{ color: isDark ? '#A3A3A3' : palette.secondary }}>Horários disponíveis esta semana</small>
                  </div>
                </div>
              </div>
            )}

            {/* Seção Portfólio */}
            {hasPortfolio && (
              <div className="mini-portfolio-preview" style={{ background: palette.background }}>
                <div className="mini-section-label" style={{ color: isDark ? '#A3A3A3' : palette.secondary }}>PORTFÓLIO</div>
                <div className="mini-portfolio-grid">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="mini-portfolio-item"
                      style={{ background: `${readableAccent}${i === 1 ? '32' : '18'}`, borderRadius: borderRadius }}
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
                  <p className="mini-testimonial-text" style={{ color: isDark ? '#B8B8B8' : palette.secondary }}>
                    "Resultado incrível, superou nossas expectativas"
                  </p>
                  <small className="mini-testimonial-author" style={{ color: readableAccent }}>— Cliente Satisfeito</small>
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
