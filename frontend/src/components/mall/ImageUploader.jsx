import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import api from '../../utils/api'
import { mediaUrl,errorMessage } from '../../utils/mall'
// Resize a seller-selected photo in the browser before durable upload.
async function optimise(file) {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Choose a JPG, PNG or WebP photo.')
  if(file.size>12*1024*1024)throw new Error('Choose a photo smaller than 12 MB.')
  const image=await createImageBitmap(file), scale=Math.min(1,1200/Math.max(image.width,image.height))
  const canvas=document.createElement('canvas');canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale)
  canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);image.close()
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',0.82))
  if(!blob||blob.size>2*1024*1024)throw new Error('This photo is too large. Choose a smaller one.')
  return blob
}
export default function ImageUploader({ value=[],onChange,max=8,label='Photos',onBusy }){
 const [busy,setBusy]=useState(false),[error,setError]=useState('')
 async function upload(e){const files=[...e.target.files].slice(0,max-value.length);e.target.value='';if(!files.length)return;setBusy(true);onBusy?.(true);setError('');let urls=[...value];try{for(const file of files){const blob=await optimise(file),form=new FormData();form.append('file',blob,'shop-photo.webp');const res=await api.post('/media',form,{headers:{'Content-Type':'multipart/form-data'}});urls.push(res.data.url);onChange([...urls])}}catch(err){setError(err.response?errorMessage(err):err.message||'Could not upload photo.')}finally{setBusy(false);onBusy?.(false)}}
 return <fieldset className="mall-upload"><legend>{label}</legend><div className="mall-upload-thumbs">{value.map((url,i)=><div key={url+i}><img src={mediaUrl(url)} alt={`${label} ${i+1}`} width="90" height="90"/><button type="button" disabled={busy} aria-label={`Remove photo ${i+1}`} onClick={()=>onChange(value.filter((_,index)=>index!==i))}><X size={16}/></button></div>)}{value.length<max&&<label className="mall-upload-button"><Upload size={21}/>{busy?'Uploading…':'Add photo'}<input disabled={busy} type="file" accept="image/jpeg,image/png,image/webp" multiple={max>1} onChange={upload}/></label>}</div><p className="mall-muted">Use your own photos. JPG, PNG or WebP; up to {max} {max===1?'image':'images'}. The first image is the cover.</p>{error&&<p role="alert" className="mall-error">{error}</p>}</fieldset>
}
