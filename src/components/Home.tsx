import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CircleCheck, Compass, Sparkles } from 'lucide-react';

type HomeProps = { onStart: () => void };

const process = [
  ['01', 'Você nos conta sobre sua marca', 'Conte sua história, posicionamento, público e objetivos. Quanto melhor entendermos sua marca, melhor será o projeto.'],
  ['02', 'Definimos a experiência ideal', 'Transformamos seus objetivos em estrutura, funcionalidades e uma experiência digital clara e estratégica.'],
  ['03', 'Componha seu investimento', 'Suas escolhas são transformadas em uma estimativa transparente de investimento, atualizada em tempo real.'],
  ['04', 'Receba uma proposta estratégica', 'Ao final, você recebe um resumo completo do projeto e os próximos passos para tirar a ideia do papel.']
];

export default function Home({ onStart }: HomeProps) {
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
    <nav className="home-nav"><button className="brand home-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><span>✦</span> atelier<span>.</span></button><button className="ghost home-link" onClick={onStart}>Acessar briefing <ArrowRight size={16}/></button></nav>
    <section className="hero">
      <div className="hero-copy"><div className="pill"><Sparkles size={14}/> BRIEFING INTELIGENTE</div><h1>Seu próximo site <i>começa aqui.</i></h1><p>Uma experiência guiada para transformar a ambição da sua marca em um projeto digital claro, estratégico e pronto para acontecer.</p><button className="primary big" onClick={onStart}>Começar meu projeto <ArrowRight className="button-arrow" size={18}/></button><div className="hero-meta"><span><CircleCheck size={17}/> 10–15 min</span><span><CircleCheck size={17}/> orçamento em tempo real</span></div><a className="scroll-cue" href="#processo">SCROLL PARA EXPLORAR <span>↓</span></a></div>
      <div className="orbital" onPointerMove={parallax} onPointerLeave={event => { event.currentTarget.style.setProperty('--px', '0px'); event.currentTarget.style.setProperty('--py', '0px'); }}><div className="orbit-label top">BRIEFING <b>01</b></div><div className="orbit-label right">ESTRATÉGIA <b>02</b></div><div className="orbit-label bottom">DESIGN <b>03</b></div><div className="orb-core"><Compass size={42}/><span>do insight<br/>ao impacto</span></div><div className="orbit-dot d1"/><div className="orbit-dot d2"/><div className="orbit-dot d3"/></div>
    </section>
    <section id="processo" ref={processRef} className={'how '+(visible ? 'is-visible' : '')}><span className="eyebrow">O PROCESSO ATELIER</span><h2>Clareza em cada decisão.<br/><i>Excelência em cada detalhe.</i></h2><div className="how-grid">{process.map(([number,title,description], index)=><article className="process-card" style={{ '--delay': `${index * 90}ms` } as React.CSSProperties} key={number}><span>{number}</span><b>{title}</b><p>{description}</p></article>)}</div></section>
  </main>;
}
