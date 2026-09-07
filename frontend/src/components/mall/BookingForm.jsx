import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import api from '../../utils/api'
import { errorMessage } from '../../utils/mall'
export default function BookingForm({ item }) {
  const user=useAuthStore(s=>s.user),navigate=useNavigate(),location=useLocation()
  const [date,setDate]=useState(''),[notes,setNotes]=useState(''),[busy,setBusy]=useState(false),[done,setDone]=useState(false)
  async function submit(e){e.preventDefault();if(!user){navigate('/login',{state:{from:location.pathname+location.search}});return}if(date&&new Date(date).getTime()<=Date.now()){toast.error('Choose a future date and time.');return}setBusy(true);try{await api.post('/bookings/',{business_id:item.business_id,service_id:item.id,notes:notes||undefined,preferred_date:date?new Date(date).toISOString():undefined});setDone(true);toast.success('Booking request sent')}catch(err){toast.error(errorMessage(err))}finally{setBusy(false)}}
  if(done)return <div className="mall-success" role="status"><h3>Your request is in.</h3><p>The appointment is pending until it is confirmed. You can check its status in My bookings.</p><Link className="btn btn-primary" to="/my-bookings">View my bookings</Link></div>
  return <form className="mall-form mall-booking-form" onSubmit={submit}><h2>Request an appointment</h2><p className="mall-muted">Choose a preferred time. The shop will need to confirm availability.</p><label>Preferred date & time <span>(optional)</span><input type="datetime-local" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Anything the shop should know? <span>(optional)</span><textarea rows="3" maxLength="2000" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Tell the shop about your request"/></label><button className="btn btn-primary btn-full" disabled={busy}>{busy?'Sending…':user?'Send booking request':'Sign in to book'}</button></form>
}
