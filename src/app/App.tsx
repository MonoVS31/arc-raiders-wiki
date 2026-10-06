import { useMemo, useState } from 'react';
import { catalog, sources } from '../domain/catalog';
import { findEntities, type Filters } from '../domain/query';
import { availabilitySchema, categorySchema, confidenceSchema } from '../domain/schema';
import { EntityDetail, categories } from '../components/EntityDetail';

const defaultFilters: Filters = { category: 'map', query: '', availability: 'disponible', confidence: 'all' };
export function App() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const entities = useMemo(() => findEntities(catalog, filters), [filters]);
  const selected = entities.find(entity => entity.id === selectedId) ?? entities[0];
  const siteName = import.meta.env.VITE_SITE_NAME || 'ARC Atlas';
  return <>
    <a className="skip-link" href="#catalog">Ir al catálogo</a>
    <header className="topbar"><a className="brand" href="#"><span className="brand-mark" aria-hidden="true">A<span>/</span></span>{siteName}</a><span className="top-label">ARCHIVO COMUNITARIO <span className="status-dot" /> FASE 01</span><a href="https://arcraiders.com/news" target="_blank" rel="noreferrer">Noticias oficiales ↗</a></header>
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy"><p className="eyebrow">SPERANZA / INTELIGENCIA DE CAMPO</p><h1 id="hero-title">Conocé el terreno.<br /><em>Elegí tu próxima incursión.</em></h1><p>Mapas, equipamiento y máquinas ARC en un archivo con fuentes rastreables. Explorá lo que sabemos y lo que todavía falta verificar.</p><a className="primary-link" href="#catalog">Explorar archivo <span>↓</span></a></div>
        <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit orbit-three"/><div className="scan-line"/><div className="art-center">ARC<span>FIELD ARCHIVE</span></div><span className="art-label">SEÑAL / 06.10.26</span></div>
      </section>
      <div className="metrics"><div><strong>{catalog.entities.filter(entity=>entity.category==='map'&&entity.availability==='disponible').length}</strong><span>mapas de incursión</span></div><div><strong>{catalog.entities.filter(entity=>entity.category==='weapon'&&entity.availability==='disponible').length}</strong><span>armas inventariadas</span></div><div><strong>83</strong><span>planos por revisar</span></div><div><strong>{sources.length}</strong><span>fuentes registradas</span></div></div>
      <aside className="editorial-note"><span className="eyebrow">CORTE / 6 OCT 2026</span><p>Frozen Trail llega el 8 de octubre según Embark. El contenido anunciado está separado del disponible. Esta base aún no incluye mapas con posiciones verificadas.</p><a href="https://arcraiders.com/news/frozen-trail-content-preview" target="_blank" rel="noreferrer">Ver anuncio ↗</a></aside>
      <section id="catalog" className="catalog-section" aria-labelledby="catalog-title">
        <div className="section-heading"><div><p className="eyebrow">01 / EL ARCHIVO</p><h2 id="catalog-title">Prepará tu información.</h2></div><p className="muted">Investigación inicial · confianza por campo</p></div>
        <nav className="categories" aria-label="Categorías del catálogo">{categorySchema.options.map(category => <button key={category} aria-pressed={filters.category === category} onClick={()=>{setFilters(current=>({...current,category}));setSelectedId(null);}}>{categories[category]}<span>{catalog.entities.filter(entity=>entity.category===category&&entity.availability==='disponible').length}</span></button>)}</nav>
        <div className="filters">
          <label className="search-label">Buscar<input type="search" placeholder="Nombre de mapa, arma o ARC…" value={filters.query} onChange={event=>setFilters(current=>({...current,query:event.target.value}))}/></label>
          <label>Disponibilidad<select value={filters.availability} onChange={event=>setFilters(current=>({...current,availability:event.target.value==='all'?'all':availabilitySchema.parse(event.target.value)}))}><option value="all">Todos los estados</option>{availabilitySchema.options.map(value=><option key={value} value={value}>{value}</option>)}</select></label>
          <label>Evidencia<select value={filters.confidence} onChange={event=>setFilters(current=>({...current,confidence:event.target.value==='all'?'all':confidenceSchema.parse(event.target.value)}))}><option value="all">Todos los niveles</option>{confidenceSchema.options.map(value=><option key={value} value={value}>{value}</option>)}</select></label>
        </div>
        <p className="result-count" role="status">{entities.length} fichas encontradas. El filtro de evidencia busca fichas con al menos un campo de ese nivel.</p>
        <div className="catalog-layout"><div className="entity-list" aria-label="Fichas">{entities.map((entity,index)=><button key={entity.id} className={`entity-button ${selected?.id===entity.id?'active':''}`} aria-pressed={selected?.id===entity.id} onClick={()=>setSelectedId(entity.id)}><span className="entity-number">{String(index+1).padStart(2,'0')}</span><span><strong>{entity.name}</strong><small>{entity.availability}</small></span><span aria-hidden="true">↗</span></button>)}</div>
          {selected ? <EntityDetail key={selected.id} entity={selected}/> : <div className="empty-state"><h3>Sin resultados</h3><p>Probá otro nombre o cambiá los filtros.</p><button onClick={()=>{setFilters(defaultFilters);setSelectedId(null);}}>Restablecer filtros</button></div>}
        </div>
      </section>
      <section className="evidence-guide"><p className="eyebrow">CÓMO LEER EL ARCHIVO</p><div>{[['confirmado','Respaldo oficial para el dato concreto.'],['probable','Ficha comunitaria consistente, pendiente de corroboración primaria.'],['posible','Obtención o reporte que no garantiza aparición.'],['no confirmado','Falta evidencia o hay una contradicción.']].map(([level,description])=><div key={level}><span className={`confidence ${level?.replaceAll(' ','-')}`}>{level}</span><p>{description}</p></div>)}</div></section>
    </main>
    <footer><strong>{siteName}</strong><p>Proyecto comunitario independiente. ARC Raiders pertenece a Embark Studios. Datos con atribución a sus fuentes; cobertura inicial sujeta a revisión.</p><span>ARCHIVO / v0.1</span></footer>
  </>;
}
