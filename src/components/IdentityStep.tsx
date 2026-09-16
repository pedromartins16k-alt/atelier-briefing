/**
 * IdentityStep.tsx
 * Etapa 6 do briefing: Identidade Visual + Seletor de Paletas
 * Extraído como componente para poder usar hooks (useState).
 */
import React, { useState } from 'react';
import { Check, Palette, Sparkles } from 'lucide-react';
import type { BriefingData, ColorPaletteColors, ColorPalette } from '../types';
import { BRAND_PERCEPTIONS } from '../data/briefingConfig';
import { getFormConfigSync } from '../services/formConfigService';

interface IdentityStepProps {
  data: BriefingData;
  update: (patch: Partial<BriefingData>) => void;
  toggleArrayItem: (key: keyof BriefingData, item: string) => void;
  stepTitle: string;
}

export default function IdentityStep({ data, update, toggleArrayItem, stepTitle }: IdentityStepProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(!!data.customPalette);

  const formConfig = getFormConfigSync();
  const enabledPalettes = formConfig.palettes.filter((p: ColorPalette) => p.enabled);

  const dynamicPerceptions = (formConfig.steps?.find(s => s.id === 'identity')?.questions?.find(q => q.id === 'brandPerceptions')?.options?.filter(o => o.enabled)
    || BRAND_PERCEPTIONS.map(b => ({ id: b.id, label: b.id, description: b.desc }))) as { id: string; label?: string; description?: string; desc?: string }[];

  return (
    <div className="step-body">
      <div className="eyebrow">06 / ATMOSFERA VISUAL</div>
      <h1>{stepTitle}</h1>
      <p>Como você gostaria que sua marca fosse percebida visualmente?</p>

      <div className="perceptions-grid">
        {dynamicPerceptions.map(item => {
          const selected = data.brandPerceptions.includes(item.id);
          return (
            <button
              type="button"
              key={item.id}
              className={'perception-card ' + (selected ? 'is-selected' : '')}
              onClick={() => toggleArrayItem('brandPerceptions', item.id)}
            >
              <span className="check-bullet">{selected && <Check size={14} />}</span>
              <strong>{item.label || item.id}</strong>
              <small>{item.description || item.desc}</small>
            </button>
          );
        })}
      </div>

      {/* ── Seletor de Paleta de Cores ── */}
      <div className="palette-selector-section">
        <div className="palette-selector-header">
          <Palette size={16} />
          <span>Paleta de Cores</span>
          <small>Escolha a que melhor representa sua marca</small>
        </div>

        <div className="palette-grid">
          {enabledPalettes.map((palette: ColorPalette) => {
            const isActive = data.selectedPaletteId === palette.id && !data.customPalette;
            return (
              <button
                type="button"
                key={palette.id}
                className={'palette-card ' + (isActive ? 'is-selected' : '')}
                onClick={() => {
                  update({ selectedPaletteId: palette.id, customPalette: undefined });
                  setShowCustomPicker(false);
                }}
                title={palette.name}
              >
                <div className="palette-swatches">
                  <span style={{ background: palette.colors.primary }} />
                  <span style={{ background: palette.colors.secondary }} />
                  <span style={{ background: palette.colors.accent }} />
                  <span style={{ background: palette.colors.background }} />
                </div>
                <span className="palette-name">
                  {palette.emoji && <span>{palette.emoji} </span>}
                  {palette.name}
                </span>
                {isActive && <span className="palette-check"><Check size={12} /></span>}
              </button>
            );
          })}

          {/* Card de paleta customizada */}
          <button
            type="button"
            className={'palette-card palette-custom-card ' + (showCustomPicker ? 'is-selected' : '')}
            onClick={() => setShowCustomPicker(v => !v)}
          >
            <div className="palette-swatches custom-swatches">
              {data.customPalette ? (
                <>
                  <span style={{ background: data.customPalette.primary }} />
                  <span style={{ background: data.customPalette.secondary }} />
                  <span style={{ background: data.customPalette.accent }} />
                  <span style={{ background: data.customPalette.background }} />
                </>
              ) : (
                <span className="custom-palette-plus">+</span>
              )}
            </div>
            <span className="palette-name">🎨 Personalizar</span>
          </button>
        </div>

        {showCustomPicker && (
          <div className="custom-palette-picker">
            <div className="custom-picker-title">
              <Sparkles size={14} />
              <span>Defina suas cores personalizadas</span>
            </div>
            <div className="color-picker-grid">
              {(
                [
                  { key: 'primary', label: 'Cor Principal' },
                  { key: 'secondary', label: 'Cor Secundária' },
                  { key: 'accent', label: 'Destaque / CTA' },
                  { key: 'background', label: 'Fundo da Página' },
                  { key: 'surface', label: 'Superfície / Cards' },
                  { key: 'text', label: 'Cor do Texto' },
                ] as { key: keyof ColorPaletteColors; label: string }[]
              ).map(({ key, label }) => {
                const defaultPalette = enabledPalettes[0];
                const currentVal = data.customPalette?.[key] || defaultPalette?.colors[key] || '#6B5E4E';
                return (
                  <label key={key} className="color-picker-item">
                    <input
                      type="color"
                      value={currentVal}
                      onChange={e => {
                        const prev = data.customPalette || { ...defaultPalette.colors };
                        update({
                          customPalette: { ...prev, [key]: e.target.value },
                          selectedPaletteId: undefined
                        });
                      }}
                      className="color-picker-native"
                    />
                    <div className="color-picker-preview" style={{ background: currentVal }} />
                    <div className="color-picker-info">
                      <span className="color-picker-label">{label}</span>
                      <span className="color-picker-hex">{currentVal}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Estilo Visual ── */}
      <div className="visual-style-section">
        <div className="visual-style-header">
          <span>Estilo do Layout</span>
          <small>Como o conteúdo será organizado na tela</small>
        </div>
        <div className="radio-pills">
          {([
            { id: 'minimal' as const, label: '⬜ Minimal' },
            { id: 'modern' as const, label: '◼ Moderno' },
            { id: 'elegant' as const, label: '✦ Elegante' },
            { id: 'bold' as const, label: '⚡ Ousado' },
            { id: 'playful' as const, label: '🎨 Criativo' },
          ]).map(opt => (
            <button
              type="button"
              key={opt.id}
              className={'pill-radio ' + (data.visualStyle === opt.id ? 'is-active' : '')}
              onClick={() => update({ visualStyle: opt.id })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tipografia ── */}
      <div className="visual-style-section">
        <div className="visual-style-header">
          <span>Tipografia</span>
          <small>A personalidade das fontes do seu site</small>
        </div>
        <div className="radio-pills">
          {([
            { id: 'serif' as const, label: 'Serifada' },
            { id: 'sans' as const, label: 'Sem serifa' },
            { id: 'mono' as const, label: 'Monospace' },
            { id: 'display' as const, label: 'Display' },
          ]).map(opt => (
            <button
              type="button"
              key={opt.id}
              className={'pill-radio ' + (data.typographyStyle === opt.id ? 'is-active' : '')}
              onClick={() => update({ typographyStyle: opt.id })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Bordas ── */}
      <div className="visual-style-section">
        <div className="visual-style-header">
          <span>Estilo de Bordas</span>
          <small>A suavidade dos cantos de botões e cards</small>
        </div>
        <div className="radio-pills">
          {([
            { id: 'sharp' as const, label: '▪ Retos' },
            { id: 'soft' as const, label: '▫ Suaves' },
            { id: 'rounded' as const, label: '○ Arredondados' },
          ]).map(opt => (
            <button
              type="button"
              key={opt.id}
              className={'pill-radio ' + (data.borderRadiusStyle === opt.id ? 'is-active' : '')}
              onClick={() => update({ borderRadiusStyle: opt.id })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field-grid two" style={{ marginTop: '28px' }}>
        <label className="field-label">
          <span>Existe alguma cor que representa sua marca?</span>
          <input
            type="text"
            placeholder="Ex: Tons de oliva, dourado e off-white..."
            value={data.brandColors}
            onChange={e => update({ brandColors: e.target.value })}
          />
        </label>
        <label className="field-label">
          <span>Existe alguma cor que você NÃO quer utilizar?</span>
          <input
            type="text"
            placeholder="Ex: Vermelho, amarelo berrante, tons fluorescentes..."
            value={data.colorsToAvoid}
            onChange={e => update({ colorsToAvoid: e.target.value })}
          />
        </label>
      </div>

      <div className="identity-status-box">
        <span>Você já possui identidade visual definida?</span>
        <div className="radio-pills">
          {[
            { id: 'complete', label: 'Sim, completa (manual + vetor)' },
            { id: 'logo_only', label: 'Tenho apenas o logotipo' },
            { id: 'some_materials', label: 'Tenho alguns materiais pontuais' },
            { id: 'none', label: 'Ainda não possuo identidade visual' }
          ].map(opt => (
            <button
              type="button"
              key={opt.id}
              className={'pill-radio ' + (data.identityStatus === opt.id ? 'is-active' : '')}
              onClick={() => update({ identityStatus: opt.id as BriefingData['identityStatus'] })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
