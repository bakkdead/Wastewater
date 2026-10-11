import React, { useState } from 'react';
const project = (x, y, z) => [120 + x * 76 - y * 48, 300 + x * 26 + y * 25 - z * 70];
const pts = (points) => points.map(([x,y,z]) => project(x,y,z).join(',')).join(' ');
function Box3D({ x, y, w, d, h, type, label }) {
  const top = [[x,y,h],[x+w,y,h],[x+w,y+d,h],[x,y+d,h]];
  const front = [[x,y+d,0],[x+w,y+d,0],[x+w,y+d,h],[x,y+d,h]];
  const side = [[x+w,y,0],[x+w,y+d,0],[x+w,y+d,h],[x+w,y,h]];
  const palette = type === 'tank' ? ['#68c5d2','#247d98','#349eb7'] : type === 'pump' ? ['#ffce91','#c27826','#e6a64c'] : ['#b8bbf5','#505799','#757bd4'];
  const center = project(x + w/2, y + d/2, h);
  return <g><polygon points={pts(front)} fill={palette[1]} stroke="#163347" strokeWidth="1.4"/><polygon points={pts(side)} fill={palette[2]} stroke="#163347" strokeWidth="1.4"/><polygon points={pts(top)} fill={palette[0]} stroke="#163347" strokeWidth="1.4"/><text x={center[0]} y={center[1]-9} className="isoLabel" textAnchor="middle">{label}</text></g>;
}
export default function Skid3D({ layout, values }) {
  const [rotation, setRotation] = useState(0);
  if (!layout) return <div className="notice">Calculate the design to generate the 3D schematic.</div>;
  const length = Math.min(5.9, Math.max(layout.usedLength, 1));
  const width = Math.min(2.35, Math.max(layout.usedWidth, 1));
  const heightMax = Number(values.maxSkidHeightM) || 2.5;
  return <div className="threeDPanel"><div className="threeDControls"><span>Isometric conceptual view · equipment driven by calculated layout</span><button type="button" className="secondary" onClick={() => setRotation(r => (r + 1) % 4)}>Rotate view</button></div>
    <div className="isoScroll"><svg viewBox="-110 -90 870 660" role="img" aria-label="Isometric 3D schematic of wastewater treatment skid" className="isoSvg"><g transform={`rotate(${rotation*90} 390 265)`}>
      <polygon points={pts([[0,0,0],[5.9,0,0],[5.9,2.35,0],[0,2.35,0]])} fill="#dcecf4" fillOpacity="0.35" stroke="#64748b" strokeDasharray="7 5" strokeWidth="2"/>
      <polygon points={pts([[0,0,0.08],[length,0,0.08],[length,width,0.08],[0,width,0.08]])} fill="#7c98aa" stroke="#355269" strokeWidth="3"/>
      {layout.equipment.map(eq => {
        const h = eq.type === 'tank' ? Math.min(heightMax,1.9) : eq.type === 'control' ? Math.min(heightMax,1.3) : 0.5;
        return <Box3D key={eq.id} x={eq.xM} y={eq.yM} w={Number(eq.length)} d={Number(eq.width)} h={h} type={eq.type} label={eq.label.replace(' Tank','').replace(' Pump','')} />;
      })}
      <text x="330" y="485" className="isoCaption">Skid footprint: {layout.usedLength.toFixed(2)} × {layout.usedWidth.toFixed(2)} m</text>
    </g></svg></div>
    <p className="muted">Schematic heights are illustrative, not equipment-vendor dimensions. This view does not validate structural loading, clearances, piping routes, lifting points, hazardous-area zoning or fabrication dimensions.</p>
  </div>;
}
