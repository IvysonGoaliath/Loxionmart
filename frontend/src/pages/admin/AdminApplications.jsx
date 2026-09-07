import { useEffect,useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { errorMessage } from '../../utils/mall'
import api from '../../utils/api'
export default function AdminApplications(){
 const [shops,setShops]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(false),[busy,setBusy]=useState(null),[notes,setNotes]=useState({})
 async function load(){setLoading(true);try{const r=await api.get('/merchant/applications');setShops(r.data);setError(false)}catch{setError(true)}finally{setLoading(false)}}
 useEffect(()=>{load()},[])
 async function review(id,decision){setBusy(id);try{await api.put(`/merchant/applications/${id}`,{decision,note:notes[id]||''});toast.success(decision==='approved'?'Shop is now live':'Feedback saved');load()}catch(e){toast.error(errorMessage(e))}finally{setBusy(null)}}
 return <div><AdminPageHeader title="Shop applications" sub="Review local businesses before they join the public mall."/>{loading?<p role="status">Loading applications…</p>:error?<button className="btn btn-secondary" onClick={load}>Could not load applications. Retry</button>:shops.length?<div className="mall-application-list">{shops.map(shop=><article className="mall-panel" key={shop.id}><div className="mall-section-head"><h2>{shop.name}</h2><span className="mall-status">{shop.approval_status}</span></div><p>{shop.description}</p><p>{shop.location} · WhatsApp {shop.whatsapp_number}</p><p>{shop.services.length} listings</p><Link to={`/merchant/${shop.id}`} className="mall-text-link">Review shop details and catalogue →</Link><label className="mall-review-label">Feedback for owner<textarea rows="2" maxLength="1500" value={notes[shop.id]??shop.review_note??''} onChange={e=>setNotes(n=>({...n,[shop.id]:e.target.value}))}/></label><div className="mall-form-actions"><button className="btn btn-primary" disabled={busy!==null} onClick={()=>review(shop.id,'approved')}>Approve & publish shop</button><button className="btn btn-secondary" disabled={busy!==null} onClick={()=>review(shop.id,'rejected')}>Request changes</button></div></article>)}</div>:<p>No applications waiting for review.</p>}</div>
}
