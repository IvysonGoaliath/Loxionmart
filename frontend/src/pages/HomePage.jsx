import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowRight, ArrowUpRight, Scissors, Smartphone, Utensils, Wrench, Shirt, Store } from 'lucide-react'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import BusinessCard from '../components/common/BusinessCard'
import api from '../utils/api'
import styles from './HomePage.module.css'
const CATEGORIES = [
  {id:'hair_beauty',label:'Hair & Beauty',icon:Scissors}, {id:'phones_tech',label:'Phones & Tech',icon:Smartphone},
  {id:'food_catering',label:'Food & Catering',icon:Utensils}, {id:'home_services',label:'Home Services',icon:Wrench},
  {id:'fashion',label:'Fashion',icon:Shirt}, {id:'other',label:'More local finds',icon:Store},
]
export default function HomePage() {
  const [businesses,setBusinesses]=useState([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState(false)
  const [search,setSearch]=useState('')
  const navigate=useNavigate()
  const load=()=>{setLoading(true);setError(false);api.get('/businesses/').then(r=>setBusinesses(r.data)).catch(()=>setError(true)).finally(()=>setLoading(false))}
  useEffect(()=>{load()},[])
  const featured=businesses.filter(b=>b.is_featured)
  const picks=(featured.length?featured:businesses).slice(0,6)
  return <><Navbar/><main>
    <section className={styles.hero}><div className={`container ${styles.heroInner}`}>
      <div className={styles.heroText}><span className={styles.eyebrow}><span/> YOUR LOCAL. ALL IN ONE PLACE.</span>
        <h1>Good things.<br/>Great people.<br/><em>Right here.</em></h1>
        <p className={styles.intro}>From your next fresh cut to your next favourite spot. Discover the businesses that make your loxion, your loxion.</p>
        <form className={styles.searchBar} onSubmit={e=>{e.preventDefault();navigate(search.trim()?`/browse?q=${encodeURIComponent(search.trim())}`:'/browse')}}>
          <Search size={20}/><input aria-label="Search local businesses" placeholder="What are you looking for?" value={search} onChange={e=>setSearch(e.target.value)}/><button type="submit" aria-label="Search businesses"><ArrowRight size={22}/></button>
        </form>
        <div className={styles.popular}>Try <Link to="/browse?cat=hair_beauty">Hair & beauty</Link><Link to="/browse?cat=food_catering">Something to eat</Link><Link to="/browse?cat=phones_tech">Tech</Link></div>
      </div>
      <div className={styles.brandPanel}><div className={styles.panelTop}><span>THE LOCAL EDIT</span><ArrowUpRight size={24}/></div><div className={styles.logoStage}><img src="/logo.png" alt="Loxion Mart — shop local, shop lekker"/></div><div className={styles.panelBottom}><span>A little closer.<br/><strong>A lot more local.</strong></span><Link to="/browse" aria-label="Explore the local marketplace"><ArrowRight size={24}/></Link></div></div>
    </div></section>
    <section className={styles.categories}><div className="container"><div className={styles.sectionHead}><div><span className={styles.kicker}>FIND YOUR EVERYDAY</span><h2>What’s your thing?</h2></div><Link to="/browse" className={styles.textLink}>Explore everything <ArrowUpRight size={18}/></Link></div><div className={styles.catGrid}>{CATEGORIES.map(({id,label,icon:Icon},i)=><Link key={id} to={`/browse?cat=${id}`} className={styles.catCard}><span className={styles.catNumber}>0{i+1}</span><Icon size={27} strokeWidth={1.5}/><span>{label}</span><ArrowUpRight size={16}/></Link>)}</div></div></section>
    <section className={styles.section}><div className="container"><div className={styles.sectionHead}><div><span className={styles.kicker}>MEET YOUR LOCAL BUSINESSES</span><h2>{featured.length?'In the neighbourhood.':'Local starts here.'}</h2></div><Link to="/browse" className={styles.textLink}>Browse all <ArrowRight size={18}/></Link></div>
    {loading?<p role="status" className={styles.status}>Finding your local businesses…</p>:error?<div role="alert" className={styles.status}>We couldn’t load businesses. <button className="btn btn-secondary" onClick={load}>Try again</button></div>:picks.length?<div className={styles.bizGrid}>{picks.map(biz=><BusinessCard key={biz.id} biz={biz}/>)}</div>:<p className={styles.status}>The neighbourhood is growing. Check back soon for local businesses.</p>}
    </div></section>
    <section id="how-it-works" className={styles.how}><div className="container"><span className={styles.kicker}>LESS SEARCHING. MORE LOCAL.</span><div className={styles.howLayout}><h2>Your next local find.<br/>Three simple steps.</h2><div className={styles.steps}>{[['Discover','Find a business by category, name or location.'],['Explore','Browse its products and services, and find something for you.'],['Connect','Request an appointment or use the business’s listed contact details.']].map(([title,desc],i)=><div className={styles.step} key={title}><span>0{i+1}</span><div><h3>{title}</h3><p>{desc}</p></div></div>)}</div></div></div></section>
    <section className={styles.cta}><div className={`container ${styles.ctaInner}`}><div><span className={styles.kicker}>SHOP LOCAL. SHOP LEKKER.</span><h2>Your neighbourhood<br/>has a lot to offer.</h2></div><Link to="/browse" className="btn btn-primary btn-lg">Find your next favourite <ArrowUpRight size={19}/></Link></div></section>
  </main><Footer/></>
}
