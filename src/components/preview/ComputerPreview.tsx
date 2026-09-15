import React from 'react';
import type { BriefingData } from '../../types';
import { Sparkles, ShoppingBag, Calendar, MessageCircle } from 'lucide-react';

interface ComputerPreviewProps {
  data: BriefingData;
}

export default function ComputerPreview({ data }: ComputerPreviewProps) {
  // 1. Determinação da paleta de cores / tema dinâmico
  const colorText = (data.brandColors || '').toLowerCase();
  const perceptions = data.brandPerceptions || [];

  let theme = 'olive'; // padrão elegante atelier
  if (colorText.includes('azul') || colorText.includes('marinho') || colorText.includes('ciano')) {
    theme = 'blue';
  } else if (colorText.includes('preto') || colorText.includes('escuro') || colorText.includes('black') || perceptions.includes('Luxuosa')) {
    theme = 'dark';
  } else if (colorText.includes('verde') || colorText.includes('oliva') || colorText.includes('lime')) {
    theme = 'green';
  } else if (colorText.includes('vermelho') || colorText.includes('laranja') || colorText.includes('terracota')) {
    theme = 'warm';
  } else if (perceptions.includes('Minimalista')) {
    theme = 'minimal';
  }

  // 2. Determinação da tipografia
  const isSerif = perceptions.some(p => ['Elegante', 'Sofisticada', 'Luxuosa'].includes(p));
  const isMono = perceptions.some(p => ['Tecnológica', 'Inovadora'].includes(p));
  const fontClass = isSerif ? 'font-serif' : isMono ? 'font-mono' : 'font-sans';

  // 3. Estilo visual de composição
  const isMinimal = perceptions.includes('Minimalista');

  // Textos e fallbacks elegantes
  const companyName = data.companyName.trim() || 'Sua Marca';
  const tagline = data.businessDescription.trim() || data.businessSegment.trim() || 'Design & Estratégia Digital de Alto Impacto';
  const ctaText = data.singlePrimaryAction.trim() || (data.selectedFeatures.includes('Comprar produtos') ? 'Ver Coleção' : data.selectedFeatures.includes('Agendar horário') ? 'Agendar Horário' : 'Solicitar Orçamento');

  // Páginas do menu
  const menuPages = (data.selectedPages && data.selectedPages.length > 0)
    ? data.selectedPages.slice(0, 4)
    : ['Home', 'Sobre', 'Serviços', 'Contato'];

  const hasEcommerce = data.selectedFeatures.includes('Comprar produtos');
  const hasBooking = data.selectedFeatures.includes('Agendar horário');
  const hasWhatsapp = data.selectedFeatures.includes('Chamar no WhatsApp');

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
          
          {/* Tela do Mini-Site */}
          <div className={`laptop-display theme-${theme} ${fontClass}`}>
            
            {/* Barra do navegador / header do mini-site */}
            <div className="mini-site-nav">
              <div className="mini-brand-logo">
                <span className="logo-symbol">✦</span>
                <span className="logo-text">{companyName}</span>
              </div>

              <div className="mini-nav-links">
                {menuPages.map((page, idx) => (
                  <span key={page} className={`mini-nav-link ${idx === 0 ? 'active' : ''}`}>
                    {page}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero do Mini-Site */}
            <div className={`mini-hero ${isMinimal ? 'minimal-hero' : ''}`}>
              <div className="mini-badge">
                <span>{data.businessSegment || 'Lançamento Exclusivo'}</span>
              </div>
              
              <h3 className="mini-hero-title">
                {companyName}
              </h3>
              
              <p className="mini-hero-subtitle">
                {tagline}
              </p>

              <div className="mini-hero-actions">
                <button type="button" className="mini-cta-btn">
                  {hasEcommerce && <ShoppingBag size={10} />}
                  {hasBooking && !hasEcommerce && <Calendar size={10} />}
                  <span>{ctaText}</span>
                </button>
              </div>
            </div>

            {/* Seções condicionais dentro do mini-site */}
            {hasEcommerce && (
              <div className="mini-ecommerce-preview">
                <div className="mini-section-label">PRODUTOS EM DESTAQUE</div>
                <div className="mini-product-grid">
                  <div className="mini-product-card">
                    <div className="mini-prod-img prod-1" />
                    <span className="mini-prod-title">Item Signature</span>
                    <span className="mini-prod-price">R$ 290</span>
                  </div>
                  <div className="mini-product-card">
                    <div className="mini-prod-img prod-2" />
                    <span className="mini-prod-title">Edição Atelier</span>
                    <span className="mini-prod-price">R$ 450</span>
                  </div>
                </div>
              </div>
            )}

            {hasBooking && !hasEcommerce && (
              <div className="mini-booking-preview">
                <div className="mini-booking-card">
                  <div className="mini-cal-icon"><Calendar size={12} /></div>
                  <div className="mini-booking-info">
                    <strong>{data.featureConditionals.bookingServiceType || 'Atendimento Personalizado'}</strong>
                    <small>Horários disponíveis esta semana</small>
                  </div>
                </div>
              </div>
            )}

            {/* Widget flutuante de WhatsApp se selecionado */}
            {hasWhatsapp && (
              <div className="mini-whatsapp-float" title="WhatsApp Ativo">
                <MessageCircle size={11} />
              </div>
            )}
          </div>
        </div>

        {/* Base do Notebook */}
        <div className="laptop-base">
          <div className="laptop-notch" />
        </div>
      </div>
    </div>
  );
}
