import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import api from "../services/api";
export default function DestinationDetails(){const {id}=useParams();const [item,setItem]=useState(null);useEffect(()=>{api.get(`/destinations/${id}`).then(r=>setItem(r.data))},[id]);if(!item)return <main className="workspace-page">Loading destination...</main>;return <main className="workspace-page"><Link className="back-link" to="/destinations"><ArrowLeft size={16}/> Discover</Link><article className="destination-detail">{item.imageUrl&&<img src={item.imageUrl} alt={item.name}/>}<div><p className="eyebrow">Destination guide</p><h1>{item.name}</h1><p className="destination-location"><MapPin size={16}/>{[item.city,item.state,item.country].filter(Boolean).join(", ")}</p><p>{item.description}</p><Link className="primary-button" to="/trips">Plan a trip here</Link></div></article></main>}
