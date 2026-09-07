import { useState,useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Compass,CheckCircle2,Heart } from 'lucide-react'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import ItemCard from '../../components/mall/ItemCard'
import ShopCard from '../../components/mall/ShopCard'
import AsyncState from '../../components/mall/AsyncState'
import { useSaved } from '../../components/mall/SavedProvider'
import { categories } from '../../utils/mall'
import api from '../../utils/api'
export default function SavedPage(){
 const saved=useSaved(),[tab,setTab]=useState('items'),[fromShops,setFromShops]=useState([])
 const explored=new Set([...saved.items.map(i=>i.business.category),...saved.shops.map(s=>s.category)])
 useEffect(()=>{let live=true;Promise.allSettled(saved.shops.slice(0,8).map(s=>api.get(`/catalogue?shop_id=${s.id}&page_size=4`))).then(results=>{if(live)setFromShops(results.filter(r=>r.status==='fulfilled').flatMap(r=>r.value.data.items).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,12))});return()=>{live=false}},[saved.shops.map(s=>s.id).join(',')])
 return <><Navbar/><main id="mall-content" className="container mall-main"><div className="mall-page-heading"><span className="mall-eyebrow">YOUR CORNER OF THE MALL</span><h1>A little collection of lekker.</h1><p>Your saved finds and followed shops, ready whenever you return.</p></div><section className="mall-passport"><div><Compass size={30}/><div><h2>Local Explorer</h2><p>{explored.size} of 6 departments in your collection. Discover at your own pace.</p></div></div><div className="mall-passport-stamps">{categories.map(c=><Link to={`/mall?category=${c.id}`} key={c.id} className={explored.has(c.id)?'collected':''}>{explored.has(c.id)?<CheckCircle2 size={17}/>:<span aria-hidden="true">{c.emoji}</span>}{c.label}</Link>)}</div></section><div className="mall-tablinks"><button className={tab==='items'?'selected':''} onClick={()=>setTab('items')}>Saved items ({saved.items.length})</button><button className={tab==='shops'?'selected':''} onClick={()=>setTab('shops')}>Followed shops ({saved.shops.length})</button><button className={tab==='updates'?'selected':''} onClick={()=>setTab('updates')}>From shops you follow</button></div>{saved.unavailable_count>0&&<p className="mall-notice">{saved.unavailable_count} saved listings or shops are currently unavailable. They’ll return here if made available again.</p>}<AsyncState loading={saved.loading} error={saved.error} retry={saved.reload}>{tab==='shops'?saved.shops.length?<div className="mall-shop-grid">{saved.shops.map(shop=><ShopCard key={shop.id} shop={shop}/>)}</div>:<Empty/>:((tab==='updates'?fromShops:saved.items).length?<div className="mall-item-grid">{(tab==='updates'?fromShops:saved.items).map(item=><ItemCard key={item.id} item={item}/>)}</div>:<Empty/>)}</AsyncState></main><Footer/></>
}
function Empty(){return <div className="mall-empty"><Heart size={32}/><h2>Your next favourite is out there.</h2><p>Tap a heart on an item or follow a shop to start your collection.</p><Link to="/mall" className="btn btn-primary">Explore the mall</Link></div>}
