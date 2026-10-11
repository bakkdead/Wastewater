import React, { useMemo, useRef, useState } from 'react';

// True 3D camera projection of equipment meshes (no static image or flat SVG rotation).
// Built without external WebGL dependencies so it also works on Render with existing packages.
const W = 900, H = 510;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const PALETTE = {
  tank: ['#66c6d5', '#3b9eb3', '#278298', '#17677d'],
  pump: ['#f5bc75', '#d79343', '#b97832', '#905b28'],
  control: ['#c3bdfa', '#9188d9', '#6b65ad', '#504b89'],
  frame: ['#a0b7c7', '#718a9f', '#55758e', '#405d73']
};

function facesForBox(x, y, w, d, z, height, kind, id) {
  const p = [
    [x,y,z],[x+w,y,z],[x+w,y+d,z],[x,y+d,z],
    [x,y,z+height],[x+w,y,z+height],[x+w,y+d,z+height],[x,y+d,z+height]
  ];
  const colors = PALETTE[kind] || PALETTE.control;
  return [
    { p:[p[0],p[1],p[5],p[4]], color:colors[2] },
    { p:[p[1],p[2],p[6],p[5]], color:colors[1] },
    { p:[p[2],p[3],p[7],p[6]], color:colors[2] },
    { p:[p[3],p[0],p[4],p[7]], color:colors[3] },
    { p:[p[4],p[5],p[6],p[7]], color:colors[0] },
  ].map((face,i)=>({...face, id:`${id}-${i}`, outline:'#29475e'}));
}

function facesForTank(x, y, w, d, z, height, id) {
  // Cylindrical tank with genuine circular plan in world coordinates.
  const centerX=x+w/2, centerY=y+d/2, radius=Math.min(w,d)*0.46, n=16;
  const ring=(zv)=>Array.from({length:n}, (_,i)=>{
    const a=2*Math.PI*i/n;
    return [centerX+radius*Math.cos(a),centerY+radius*Math.sin(a),zv];
  });
  const bottom=ring(z), top=ring(z+height);
  const sides=bottom.map((p,i)=>({
    id:`${id}-side-${i}`,p:[p,bottom[(i+1)%n],top[(i+1)%n],top[i]],
    color:i%3===0?'#2687a2':i%3===1?'#319ab1':'#55b6c7',outline:'#2c829b'
  }));
  return [...sides,{id:`${id}-lid`,p:top,color:'#89d3df',outline:'#237e96'}];
}

function transform(vertex, azimuth, elevation, distance, cx, cy) {
  // Rotate the world around the orbit target; project using a perspective camera.
  const dx=vertex[0]-cx, dy=vertex[1]-cy, dz=vertex[2]-0.7;
  const ca=Math.cos(azimuth),sa=Math.sin(azimuth),ce=Math.cos(elevation),se=Math.sin(elevation);
  const side=ca*dx-sa*dy;
  const away=sa*dx+ca*dy;
  const up=ce*dz-se*away;
  const depth=se*dz+ce*away;
  const focal=650;
  const scale=focal/(distance*125+depth*120+520);
  return {x:W/2+side*75*scale*1.65,y:H/2-up*75*scale*1.65,depth};
}

export default function Skid3D({layout, values}) {
  const [azimuth,setAzimuth]=useState(-0.72);
  const [elevation,setElevation]=useState(0.64);
  const [distance,setDistance]=useState(2.25);
  const drag=useRef(null);
  const geometry=useMemo(()=>{
    if(!layout) return [];
    const maxH=Number(values.maxSkidHeightM)||2.5;
    const solids=[
      ...facesForBox(0,0,5.9,2.35,-0.12,0.12,'frame','boundary'),
      ...facesForBox(0,0,Math.min(layout.usedLength,5.9),Math.min(layout.usedWidth,2.35),0,0.10,'frame','skid')
    ];
    for(const eq of layout.equipment){
      const h=eq.type==='tank'?Math.min(1.45,maxH):eq.type==='control'?Math.min(1.2,maxH):0.45;
      const w=Number(eq.length),d=Number(eq.width);
      const body=eq.type==='tank'?facesForTank(eq.xM,eq.yM,w,d,0.1,h,eq.id):facesForBox(eq.xM,eq.yM,w,d,0.1,h,eq.type,eq.id);
      solids.push(...body);
    }
    return solids;
  },[layout,values.maxSkidHeightM]);
  const projected=useMemo(()=>geometry.map(face=>{
    const points=face.p.map(v=>transform(v,azimuth,elevation,distance,2.95,1.175));
    return {...face,points,depth:points.reduce((sum,p)=>sum+p.depth,0)/points.length};
  }).sort((a,b)=>b.depth-a.depth),[geometry,azimuth,elevation,distance]);
  const labels=useMemo(()=>layout?.equipment.map(eq=>{
    const h=eq.type==='tank'?1.55:eq.type==='control'?1.3:0.6;
    return {id:eq.id,label:eq.label,at:transform([eq.xM+Number(eq.length)/2,eq.yM+Number(eq.width)/2,h],azimuth,elevation,distance,2.95,1.175)};
  })||[],[layout,azimuth,elevation,distance]);
  if(!layout) return <div className="notice">Calculate the design to generate the interactive 3D schematic.</div>;
  return <div className="threeDPanel">
    <div className="threeDControls">
      <span><strong>Interactive 3D orbit camera</strong> · drag to rotate · scroll to zoom</span>
      <div className="threeDButtons">
        <button type="button" className="secondary" onClick={()=>setDistance(d=>clamp(d-0.25,0.8,5))}>Zoom +</button>
        <button type="button" className="secondary" onClick={()=>setDistance(d=>clamp(d+0.25,0.8,5))}>Zoom −</button>
        <button type="button" className="secondary" onClick={()=>{setAzimuth(-0.72);setElevation(0.64);setDistance(2.25)}}>Reset view</button>
      </div>
    </div>
    <div className="orbitViewport" onPointerDown={e=>{drag.current={x:e.clientX,y:e.clientY,az:azimuth,el:elevation};e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={e=>{
      if(!drag.current) return;
      setAzimuth(drag.current.az+(e.clientX-drag.current.x)*0.009);
      setElevation(clamp(drag.current.el+(e.clientY-drag.current.y)*0.007,0.08,1.5));
    }} onPointerUp={e=>{drag.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)}} onPointerCancel={()=>{drag.current=null}} onWheel={e=>setDistance(d=>clamp(d+Math.sign(e.deltaY)*0.17,0.8,5))}>
      <svg viewBox={`0 0 ${W} ${H}`} className="orbitSvg" role="img" aria-label="Interactive perspective 3D skid with orbit camera and zoom">
        <defs><linearGradient id="orbitBack" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#e8f5fb"/><stop offset="1" stopColor="#f8fbff"/></linearGradient></defs>
        <rect width={W} height={H} fill="url(#orbitBack)"/>
        {projected.map(face=><polygon key={face.id} points={face.points.map(p=>`${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')} fill={face.color} stroke={face.outline} strokeWidth="1.2" strokeLinejoin="round"/>)}
        {labels.map(l=><text key={l.id} x={l.at.x} y={l.at.y} textAnchor="middle" className="orbitLabel">{l.label.replace(' Tank','').replace(' Pump','')}</text>)}
      </svg>
    </div>
    <div className="orbitFootnote">Skid schematic: {layout.usedLength.toFixed(2)} × {layout.usedWidth.toFixed(2)} m · Camera rotates around equipment in 3D, not the page image.</div>
    <p className="muted">Concept visualisation only: equipment footprints and heights are illustrative, not matched vendor dimensions. This is not a fabrication drawing or a structural, clearance, piping or safety assessment.</p>
  </div>;
}
