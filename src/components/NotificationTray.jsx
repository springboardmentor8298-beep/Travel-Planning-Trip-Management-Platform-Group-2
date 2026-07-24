import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import api from "../services/api";

export default function NotificationTray() {
  const [open,setOpen]=useState(false); const [items,setItems]=useState([]);
  const load=()=>api.get("/notifications").then(r=>setItems(r.data)).catch(()=>setItems([]));
  useEffect(()=>{load(); const id=window.setInterval(load,60000); return()=>window.clearInterval(id);},[]);
  const unread=items.filter(item=>!item.read).length; const readAll=async()=>{await api.patch("/notifications/read-all");load();};
  return <div className="notification-tray"><button className="icon-button notification-button" title="Notifications" onClick={()=>setOpen(!open)}><Bell size={20}/>{unread>0&&<span/>}</button>{open&&<section className="notification-popover"><header><strong>Notifications</strong>{unread>0&&<button onClick={readAll}><CheckCheck size={14}/> Mark all read</button>}</header>{items.length?items.slice(0,8).map(item=><article className={item.read?"":"is-unread"} key={item.id}><b>{item.title}</b><p>{item.message}</p><small>{new Date(item.createdAt).toLocaleString()}</small></article>):<p className="empty-copy">You are all caught up.</p>}</section>}</div>;
}
