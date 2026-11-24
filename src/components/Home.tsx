import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CircleCheck, Compass, Sparkles, Layers, Sliders, FileCode, Check } from 'lucide-react';

type HomeProps = {
  onStart: () => void;
  onNavigate?: (screen: import('../types').Screen) => void;
};

const process = [
  ['01', 'Você nos conta sobre sua marca', 'Conte sua história, posicionamento, público e diferenciais de forma guiada, sem nenhum jargão técnico.'],
  ['02', 'Definimos requisitos e objetivos', 'Mapeamos páginas, recursos essenciais, público-alvo e a ação primordial (CTA) que trará resultados ao seu negócio.'],
  ['03', 'Identificamos dependências e estilo', 'Alinhamos expectativas visuais, referências reais, materiais disponíveis e integrações necessárias.'],
  ['04', 'Briefing pronto para a equipe', 'Ao final, você e o estúdio recebem um briefing estruturado, com sitemap sugerido e diagnóstico inteligente para iniciar o projeto.']
];

const pillars = [
  {
    icon: Layers,
    number: '01',
    title: 'Diagnóstico Sem Complicação',
    desc: 'Sem jargões técnicos. Uma metodologia de perguntas precisas para extrair a essência, o público e o modelo de negócio.'
  },
  {
    icon: Sliders,
    number: '02',
    title: 'Simulação & Preview em Tempo Real',
    desc: 'Veja o mini-site reagir às suas preferências visuais e acompanhe a estimativa de investimento calculada a cada escolha.'
  },
  {
    icon: FileCode,
    number: '03',
    title: 'Especificação para o Estúdio',
    desc: 'Exportação em Markdown estruturado, pontos de atenção técnicos e arquitetura sugerida para início imediato do projeto.'
  }
];

export default function Home({ onStart, onNavigate }: HomeProps) {
  const processRef = useRef<HTMLElement>(null);
  const pillarsRef = useRef<HTMLElement>(null);
  const [processVisible, setProcessVisible] = useState(false);
  const [pillarsVisible, setPillarsVisible] = useState(false);

  useEffect(() => {
    const processEl = processRef.current;
    if (processEl) {
      const observer = new IntersectionObserver(([entry]) => setProcessVisible(entry.isIntersecting), { threshold: 0.15 });
      observer.observe(processEl);
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    const pillarsEl = pillarsRef.current;
    if (pillarsEl) {
      const observer = new IntersectionObserver(([entry]) => setPillarsVisible(entry.isIntersecting), { threshold: 0.15 });
      observer.observe(pillarsEl);
      return () => observer.disconnect();
    }
  }, []);

  const parallax = (event: React.PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 801) return;
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--px', `${((event.clientX - box.left) / box.width - .5) * 10}px`);
    event.currentTarget.style.setProperty('--py', `${((event.clientY - box.top) / box.height - .5) * 10}px`);
  };

  return (
    <main className="home">
      {/* Header Sticky com Glassmorphism Editorial Leve */}
      <header className="home-nav-container">
        <nav className="home-nav">
          <button className="brand home-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span>✦</span> atelier<span>.</span>
          </button>
          <div className="home-nav-actions">
            {onNavigate && (
              <button className="ghost nav-login-btn" onClick={() => onNavigate('login')}>
                Entrar
              </button>
            )}
            <button className="ghost home-link" onClick={onStart}>
              <span>Acessar briefing</span> <ArrowRight size={15}/>
            </button>
          </div>
        </nav>
      </header>

      {/* Hero com Sequência Cinematográfica Editorial */}
      <section className="hero">
        <div className="hero-copy">
          <div className="pill hero-badge-enter">
            <Sparkles size={13}/> <span>CONSULTOR DIGITAL DE BRIEFING</span>
          </div>

          <h1 className="hero-headline hero-title-enter">
            Seu próximo site <br className="hero-title-break" />
            <span className="serif-italic"><i>começa aqui.</i></span>
          </h1>

          <p className="hero-desc-enter">
            Uma experiência guiada para mapear as necessidades reais da sua empresa e transformar sua visão em um briefing completo, sem complicação ou termos técnicos.
          </p>

          <div className="hero-cta-enter">
            <button className="primary big" onClick={onStart}>
              <span>Iniciar meu briefing</span> <ArrowRight className="button-arrow" size={17}/>
            </button>
          </div>

          <div className="hero-meta hero-meta-enter">
            <span><CircleCheck size={16}/> 10–15 min</span>
            <span><CircleCheck size={16}/> Levantamento inteligente de requisitos</span>
          </div>

          <a className="scroll-cue" href="#processo">
            SCROLL PARA EXPLORAR <span className="cue-arrow">↓</span>
          </a>
        </div>

        {/* Órbita Visual do Atelier */}
        <div
          className="orbital hero-orbital-enter"
          onPointerMove={parallax}
          onPointerLeave={event => {
            event.currentTarget.style.setProperty('--px', '0px');
            event.currentTarget.style.setProperty('--py', '0px');
          }}
        >
          <div className="orbit-line orbit-three"/>
          <div className="solar-track track-briefing"><div className="orbit-label top">BRIEFING <b>01</b></div></div>
          <div className="solar-track track-strategy"><div className="orbit-label right">ESTRATÉGIA <b>02</b></div></div>
          <div className="solar-track track-design"><div className="orbit-label bottom">DESIGN <b>03</b></div></div>
          <div className="orb-core">
            <Compass size={38}/>
            <span>do insight<br/>ao impacto</span>
          </div>
          <div className="solar-track track-dot-one"><div className="orbit-dot d1"/></div>
          <div className="solar-track track-dot-two"><div className="orbit-dot d2"/></div>
          <div className="solar-track track-dot-three"><div className="orbit-dot d3"/></div>
        </div>
      </section>

      {/* O Processo Atelier */}
      <section id="processo" ref={processRef} className={'how ' + (processVisible ? 'is-visible' : '')}>
        <div className="section-container">
          <span className="eyebrow">O PROCESSO ATELIER</span>
          <h2>Clareza em cada decisão.<br/><span className="serif-italic"><i>Excelência em cada detalhe.</i></span></h2>
          <div className="how-grid">
            {process.map(([number, title, description], index) => (
              <article
                className="process-card"
                style={{ '--delay': `${index * 80}ms` } as React.CSSProperties}
                key={number}
              >
                <span className="process-number">{number}</span>
                <b>{title}</b>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Seção Editorial: Pilares da Experiência */}
      <section ref={pillarsRef} className={'editorial-pillars ' + (pillarsVisible ? 'is-visible' : '')}>
        <div className="section-container">
          <div className="editorial-statement-box">
            <span className="eyebrow">EDITORIAL DESIGN STUDIO + DIGITAL EXPERIENCE</span>
            <h3 className="statement-quote">
              "Um briefing bem estruturado não é sobre preencher formulários. É sobre eliminar ambiguidades antes que elas se tornem retrabalho."
            </h3>
            <span className="statement-author">— Metodologia Atelier</span>
          </div>

          <div className="pillars-grid">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <article
                  key={p.number}
                  className="pillar-card"
                  style={{ '--delay': `${idx * 100}ms` } as React.CSSProperties}
                >
                  <div className="pillar-header">
                    <span className="pillar-icon"><Icon size={20} /></span>
                    <span className="pillar-num">{p.number}</span>
                  </div>
                  <h4>{p.title}</h4>
                  <p>{p.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Banner de Ação Final */}
      <section className="cta-banner-section">
        <div className="cta-banner-card">
          <span className="pill dark-pill"><Sparkles size={12}/> PRONTO PARA COMEÇAR?</span>
          <h2>Dê o próximo passo para o site que sua marca merece.</h2>
          <p>Leva de 10 a 15 minutos e você recebe um diagnóstico estruturado pronto para orçamentos e desenvolvimento.</p>
          <div className="cta-banner-actions">
            <button className="primary big" onClick={onStart}>
              <span>Iniciar meu briefing agora</span> <ArrowRight className="button-arrow" size={17}/>
            </button>
          </div>
        </div>
      </section>

      {/* Footer Minimalista */}
      <footer className="home-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span>✦</span> atelier<span>.</span>
            <small>Consultor Digital de Briefing & Experiência Editorial</small>
          </div>
          <div className="footer-meta">
            <span>© {new Date().getFullYear()} Atelier. Todos os direitos reservados.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
