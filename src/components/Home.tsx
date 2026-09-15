import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CircleCheck, Compass, Sparkles } from 'lucide-react';

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

export default function Home({ onStart, onNavigate }: HomeProps) {
  const processRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = processRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.18 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const parallax = (event: React.PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 801) return;
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--px', `${((event.clientX - box.left) / box.width - .5) * 10}px`);
    event.currentTarget.style.setProperty('--py', `${((event.clientY - box.top) / box.height - .5) * 10}px`);
  };

  return <main className="home">
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
          Acessar briefing <ArrowRight size={16}/>
        </button>
      </div>
    </nav>
    <section className="hero">
      <div className="hero-copy">
        <div className="pill"><Sparkles size={14}/> CONSULTOR DIGITAL DE BRIEFING</div>
        <h1>Seu próximo site <i>começa aqui.</i></h1>
        <p>Uma experiência guiada para mapear as necessidades reais da sua empresa e transformar sua visão em um briefing completo, sem complicação ou termos técnicos.</p>
        <button className="primary big" onClick={onStart}>
          Iniciar meu briefing <ArrowRight className="button-arrow" size={18}/>
        </button>
        <div className="hero-meta">
          <span><CircleCheck size={17}/> 10–15 min</span>
          <span><CircleCheck size={17}/> Levantamento inteligente de requisitos</span>
        </div>
        <a className="scroll-cue" href="#processo">SCROLL PARA EXPLORAR <span>↓</span></a>
      </div>
      <div className="orbital" onPointerMove={parallax} onPointerLeave={event => { event.currentTarget.style.setProperty('--px', '0px'); event.currentTarget.style.setProperty('--py', '0px'); }}>
        <div className="orbit-line orbit-three"/>
        <div className="solar-track track-briefing"><div className="orbit-label top">BRIEFING <b>01</b></div></div>
        <div className="solar-track track-strategy"><div className="orbit-label right">ESTRATÉGIA <b>02</b></div></div>
        <div className="solar-track track-design"><div className="orbit-label bottom">DESIGN <b>03</b></div></div>
        <div className="orb-core"><Compass size={42}/><span>do insight<br/>ao impacto</span></div>
        <div className="solar-track track-dot-one"><div className="orbit-dot d1"/></div>
        <div className="solar-track track-dot-two"><div className="orbit-dot d2"/></div>
        <div className="solar-track track-dot-three"><div className="orbit-dot d3"/></div>
      </div>
    </section>
    <section id="processo" ref={processRef} className={'how '+(visible ? 'is-visible' : '')}>
      <span className="eyebrow">O PROCESSO ATELIER</span>
      <h2>Clareza em cada decisão.<br/><i>Excelência em cada detalhe.</i></h2>
      <div className="how-grid">
        {process.map(([number,title,description], index)=>(
          <article className="process-card" style={{ '--delay': `${index * 90}ms` } as React.CSSProperties} key={number}>
            <span>{number}</span>
            <b>{title}</b>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  </main>;
}
