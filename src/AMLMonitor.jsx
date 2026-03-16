import { useState } from "react";

const ANTHROPIC_API_KEY = "YOUR_GROQ_KEY_HERE";

const CUSTOMER_PROFILES = [
  { id:"CUST-001", name:"Mohammed Al-Rashid", country:"UAE", type:"Individual", riskTier:"HIGH", occupation:"Businessman" },
  { id:"CUST-002", name:"Elena Volkov", country:"Russia", type:"Individual", riskTier:"HIGH", occupation:"Consultant" },
  { id:"CUST-003", name:"James O'Brien", country:"Ireland", type:"Individual", riskTier:"LOW", occupation:"Engineer" },
  { id:"CUST-004", name:"Priya Sharma", country:"India", type:"Individual", riskTier:"MEDIUM", occupation:"Doctor" },
  { id:"CUST-005", name:"Carlos Mendez", country:"Mexico", type:"Individual", riskTier:"HIGH", occupation:"Trader" },
  { id:"CUST-006", name:"Zhang Wei", country:"China", type:"Corporate", riskTier:"MEDIUM", occupation:"Import/Export" },
  { id:"CUST-007", name:"Fatima Al-Hassan", country:"Saudi Arabia", type:"Individual", riskTier:"MEDIUM", occupation:"Investor" },
  { id:"CUST-008", name:"Viktor Petrov", country:"Russia", type:"Corporate", riskTier:"HIGH", occupation:"Shell Company" },
  { id:"CUST-009", name:"Sarah Thompson", country:"UK", type:"Individual", riskTier:"LOW", occupation:"Teacher" },
  { id:"CUST-010", name:"Kwame Osei", country:"Ghana", type:"Individual", riskTier:"MEDIUM", occupation:"Politician" },
  { id:"CUST-011", name:"Isabella Romano", country:"Italy", type:"Corporate", riskTier:"LOW", occupation:"Retail" },
  { id:"CUST-012", name:"Hassan Diallo", country:"Mali", type:"Individual", riskTier:"HIGH", occupation:"Unknown" },
];

const TXN_TYPES = ["WIRE_TRANSFER","CASH_DEPOSIT","CASH_WITHDRAWAL","CRYPTO_EXCHANGE","INTERNATIONAL_TRANSFER","INTERNAL_TRANSFER"];
const CURRENCIES = ["USD","EUR","GBP","AED","RUB","CNY","CHF"];
const COUNTRIES = ["UAE","Russia","Cayman Islands","Switzerland","Panama","UK","USA","China","Cyprus","Malta","Ireland","India","Mexico","Ghana","Mali","Saudi Arabia","Italy"];
const HIGH_RISK_COUNTRIES = new Set(["Cayman Islands","Panama","Cyprus","Malta","Iran","North Korea","Myanmar"]);

function rnd(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function randAmt(lo,hi){ return Math.round((Math.random()*(hi-lo)+lo)*100)/100; }
function txnId(){ return "TXN-"+Math.random().toString(36).substring(2,10).toUpperCase(); }

function scoreTransaction(txn, cust){
  let score=0; const flags=[];
  if(txn.amount>=10000 && ["CASH_DEPOSIT","CASH_WITHDRAWAL"].includes(txn.type)){ score+=20; flags.push("LARGE_CASH"); }
  if(txn.amount>=8000 && txn.amount<10000){ score+=25; flags.push("STRUCTURING"); }
  if(HIGH_RISK_COUNTRIES.has(txn.destCountry)){ score+=20; flags.push("HIGH_RISK_JURISDICTION"); }
  if(cust.riskTier==="HIGH"){ score+=20; flags.push("HIGH_RISK_CUSTOMER"); }
  else if(cust.riskTier==="MEDIUM"){ score+=10; flags.push("MEDIUM_RISK_CUSTOMER"); }
  if(cust.occupation==="Politician"){ score+=15; flags.push("PEP_LINKED"); }
  if(txn.type==="CRYPTO_EXCHANGE"){ score+=15; flags.push("CRYPTO_ACTIVITY"); }
  if(txn.type==="INTERNATIONAL_TRANSFER"&&txn.amount>50000){ score+=15; flags.push("LARGE_INTL_TRANSFER"); }
  if(txn.amount%1000===0&&txn.amount>=5000){ score+=10; flags.push("ROUND_NUMBER"); }
  if(cust.occupation==="Shell Company"){ score+=20; flags.push("SHELL_COMPANY"); }
  score=Math.min(score,100);
  return { score, flags, status: score>=75?"FLAGGED":score>=50?"REVIEW":"CLEAR" };
}

function generateTransactions(n=55){
  const now=new Date();
  return Array.from({length:n},()=>{
    const cust=rnd(CUSTOMER_PROFILES);
    const isHigh=cust.riskTier==="HIGH";
    const amount=isHigh?randAmt(50000,2000000):randAmt(100,50000);
    const type=rnd(TXN_TYPES);
    const destCountry=rnd(COUNTRIES);
    const date=new Date(now-Math.random()*30*24*60*60*1000);
    const txn={id:txnId(), type, amount, currency:rnd(CURRENCIES), originCountry:cust.country, destCountry, date:date.toISOString()};
    const {score,flags,status}=scoreTransaction(txn,cust);
    return {...txn, customerId:cust.id, customerName:cust.name, customerCountry:cust.country, customerRisk:cust.riskTier, occupation:cust.occupation, riskScore:score, flags, status};
  }).sort((a,b)=>b.riskScore-a.riskScore);
}

function formatAmt(n){ if(n>=1e6) return "$"+(n/1e6).toFixed(2)+"M"; if(n>=1e3) return "$"+(n/1e3).toFixed(1)+"K"; return "$"+n.toFixed(2); }
const btn=(v="default")=>({ padding:"4px 12px",fontSize:11,borderRadius:2,cursor:"pointer",fontWeight:600,letterSpacing:0.3,fontFamily:"inherit", background:v==="primary"?"#1a237e":v==="danger"?"#c62828":v==="success"?"#2e7d32":"#e0e0e0", color:v==="default"?"#333":"#fff", border:"1px solid "+(v==="primary"?"#0d1b6e":v==="danger"?"#b71c1c":v==="success"?"#1b5e20":"#bdbdbd") });
const badge=(t)=>({ padding:"1px 7px",borderRadius:2,fontSize:10,fontWeight:700,letterSpacing:0.5,display:"inline-block", background:t==="FLAGGED"||t==="HIGH"?"#ffebee":t==="REVIEW"||t==="MEDIUM"?"#fff8e1":t==="CLEAR"||t==="LOW"?"#e8f5e9":"#e8eaf6", color:t==="FLAGGED"||t==="HIGH"?"#c62828":t==="REVIEW"||t==="MEDIUM"?"#e65100":t==="CLEAR"||t==="LOW"?"#2e7d32":"#3949ab", border:"1px solid "+(t==="FLAGGED"||t==="HIGH"?"#ef9a9a":t==="REVIEW"||t==="MEDIUM"?"#ffcc02":t==="CLEAR"||t==="LOW"?"#a5d6a7":"#9fa8da") });
const inp={padding:"4px 8px",fontSize:11,border:"1px solid #bdbdbd",borderRadius:2,background:"#fff",color:"#333",outline:"none",fontFamily:"inherit"};
const th={background:"#e8eaf6",padding:"6px 10px",textAlign:"left",fontWeight:700,color:"#3949ab",borderBottom:"2px solid #9fa8da",whiteSpace:"nowrap",letterSpacing:0.5,fontSize:11};
const td={padding:"5px 10px",borderBottom:"1px solid #eeeff3",verticalAlign:"middle",fontSize:11};
const rc=(s)=>s>=75?"#c62828":s>=50?"#e65100":"#2e7d32";

async function callAI(prompt) {
  const res = await fetch("https://shortline.proxy.rlwy.net:16708", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey: ANTHROPIC_API_KEY,
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

export default function AMLMonitor(){
  const [transactions, setTransactions] = useState(()=>generateTransactions(55));
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("queue");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [sarText, setSarText] = useState(null);
  const [sarLoading, setSarLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [form, setForm] = useState({ customerName:"", country:"UAE", occupation:"", type:"WIRE_TRANSFER", amount:"", currency:"USD", destCountry:"USA", customerRisk:"LOW" });

  const flagged=transactions.filter(t=>t.status==="FLAGGED").length;
  const review=transactions.filter(t=>t.status==="REVIEW").length;
  const cleared=transactions.filter(t=>t.status==="CLEAR").length;

  const filtered=transactions.filter(t=>{
    const ms=filterStatus==="ALL"||t.status===filterStatus;
    const mq=!search||t.customerName.toLowerCase().includes(search.toLowerCase())||t.id.toLowerCase().includes(search.toLowerCase());
    return ms&&mq;
  });

  function submitManual(){
    if(!form.customerName||!form.amount) return;
    const cust={riskTier:form.customerRisk,occupation:form.occupation||"Unknown",country:form.country};
    const txn={type:form.type,amount:parseFloat(form.amount),destCountry:form.destCountry};
    const {score,flags,status}=scoreTransaction(txn,cust);
    const newTxn={id:txnId(),type:form.type,amount:parseFloat(form.amount),currency:form.currency,originCountry:form.country,destCountry:form.destCountry,date:new Date().toISOString(),customerId:"MANUAL",customerName:form.customerName,customerCountry:form.country,customerRisk:form.customerRisk,occupation:form.occupation||"Unknown",riskScore:score,flags,status};
    setTransactions(prev=>[newTxn,...prev]);
    setSelected(newTxn); setAiResult(null); setSarText(null);
    setShowInput(false);
    setForm({customerName:"",country:"UAE",occupation:"",type:"WIRE_TRANSFER",amount:"",currency:"USD",destCountry:"USA",customerRisk:"LOW"});
  }

  async function runAI(txn){
    setAiLoading(true); setAiResult(null); setSarText(null);
    try{
      const prompt = `You are a senior AML compliance officer. Analyse this transaction.
TXN ID: ${txn.id}
CUSTOMER: ${txn.customerName} | ${txn.customerCountry} | ${txn.occupation}
CUSTOMER RISK: ${txn.customerRisk}
TYPE: ${txn.type} | AMOUNT: ${txn.currency} ${txn.amount.toFixed(2)}
ROUTE: ${txn.originCountry} to ${txn.destCountry}
RISK SCORE: ${txn.riskScore}/100
FLAGS: ${txn.flags.join(", ")||"None"}

Respond ONLY in JSON with these exact keys:
{"verdict":"SUSPICIOUS or REVIEW_REQUIRED or LEGITIMATE","confidence":85,"typology":"Layering","primary_concern":"one sentence","reasoning":"2-3 sentences","recommended_action":"FREEZE or FILE_SAR or ENHANCED_DD or MONITOR or CLEAR","risk_factors":["factor1","factor2"],"mitigating_factors":["factor1"]}`;
      const txt = await callAI(prompt);
      setAiResult(JSON.parse(txt.replace(/```json|```/g,"").trim()));
    }catch(e){
      setAiResult({verdict:"REVIEW_REQUIRED",confidence:0,primary_concern:"Manual review required",reasoning:"AI analysis failed. Please review manually.",recommended_action:"ENHANCED_DD",risk_factors:[],mitigating_factors:[],typology:"Unknown"});
    }
    setAiLoading(false);
  }

  async function genSAR(txn){
    setSarLoading(true);
    try{
      const prompt = `Generate a formal FinCEN SAR narrative for this transaction:
TXN: ${txn.id} | ${txn.type} | ${txn.currency} ${txn.amount.toFixed(2)}
CUSTOMER: ${txn.customerName} | ${txn.customerCountry} | ${txn.occupation}
RISK: ${txn.riskScore}/100 | FLAGS: ${txn.flags.join(", ")}
ROUTE: ${txn.originCountry} to ${txn.destCountry}
DATE: ${new Date(txn.date).toLocaleDateString()}
Write 3-4 paragraphs in standard FinCEN SAR format. Be professional and factual.`;
      const txt = await callAI(prompt);
      setSarText(txt);
    }catch(e){ setSarText("SAR generation failed."); }
    setSarLoading(false);
  }

  const custStats=CUSTOMER_PROFILES.map(c=>{
    const ct=transactions.filter(t=>t.customerId===c.id);
    return {...c,txnCount:ct.length,volume:ct.reduce((s,t)=>s+t.amount,0),avgRisk:ct.length?Math.round(ct.reduce((s,t)=>s+t.riskScore,0)/ct.length):0,flaggedCount:ct.filter(t=>t.status==="FLAGGED").length};
  }).sort((a,b)=>b.avgRisk-a.avgRisk);

  const dv={height:1,background:"#e8eaed",margin:"10px 0"};

  return (
    <div style={{minHeight:"100vh",background:"#e8eaed",fontFamily:"'Segoe UI','Helvetica Neue',sans-serif",fontSize:12,color:"#1a1a2e"}}>
      <div style={{background:"#1a237e",padding:"0 20px",display:"flex",alignItems:"center",height:40,gap:16}}>
        <span style={{color:"#90caf9",fontWeight:900,fontSize:14}}>●</span>
        <span style={{color:"#fff",fontWeight:700,fontSize:13,letterSpacing:1}}>AML TRANSACTION MONITORING SYSTEM</span>
        <span style={{color:"rgba(255,255,255,0.3)"}}>|</span>
        <span style={{color:"rgba(255,255,255,0.5)",fontSize:11}}>FinCEN Compliant · ML Risk Scoring · SAR Generation</span>
        <div style={{marginLeft:"auto",display:"flex",gap:20,alignItems:"center"}}>
          <span style={{color:"rgba(255,255,255,0.6)",fontSize:11}}><span style={{width:7,height:7,borderRadius:"50%",background:"#4caf50",display:"inline-block",marginRight:5}}/>SYSTEM ACTIVE</span>
          <span style={{color:"rgba(255,255,255,0.6)",fontSize:11}}>Analyst: B.Dhanasekar</span>
          <span style={{color:"rgba(255,255,255,0.6)",fontSize:11}}>{new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</span>
        </div>
      </div>
      <div style={{background:"#283593",padding:"0 20px",display:"flex",alignItems:"stretch"}}>
        {[["queue","ALERT QUEUE"],["customers","CUSTOMER PROFILES"],["analytics","ANALYTICS"],["sar","SAR REPORTS"]].map(([id,label])=>(
          <div key={id} onClick={()=>setActiveTab(id)} style={{padding:"7px 18px",fontSize:11,color:activeTab===id?"#fff":"rgba(255,255,255,0.55)",background:activeTab===id?"rgba(255,255,255,0.12)":"transparent",cursor:"pointer",letterSpacing:0.5,borderBottom:activeTab===id?"2px solid #90caf9":"2px solid transparent",userSelect:"none"}}>{label}</div>
        ))}
        <div style={{marginLeft:"auto",display:"flex",gap:14,alignItems:"center",padding:"0 4px"}}>
          {[["FLAGGED",flagged,"#ef9a9a"],["REVIEW",review,"#ffe082"],["CLEAR",cleared,"#a5d6a7"]].map(([l,v,c])=>(
            <span key={l} style={{fontSize:11}}><span style={{color:"rgba(255,255,255,0.45)",fontSize:10}}>{l}: </span><span style={{fontWeight:700,color:c}}>{v}</span></span>
          ))}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:selected?"1fr 340px":"1fr",height:"calc(100vh - 80px)",overflow:"hidden"}}>
        <div style={{overflow:"auto",background:"#f5f6fa"}}>

          {activeTab==="queue" && <>
            <div style={{background:"#fff",borderBottom:"1px solid #dde0e6",padding:"6px 16px",display:"flex",gap:8,alignItems:"center"}}>
              <button style={btn("primary")} onClick={()=>setShowInput(v=>!v)}>+ NEW TRANSACTION</button>
              <span style={{color:"#bdbdbd"}}>|</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name / TXN ID..." style={{...inp,width:200}}/>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{...inp}}>
                {["ALL","FLAGGED","REVIEW","CLEAR"].map(s=><option key={s}>{s}</option>)}
              </select>
              <span style={{color:"#9e9e9e",fontSize:11,marginLeft:"auto"}}>{filtered.length} records</span>
            </div>

            {showInput&&(
              <div style={{margin:"8px 12px",background:"#fff",border:"1px solid #9fa8da",borderRadius:2,overflow:"hidden"}}>
                <div style={{background:"#283593",color:"#fff",padding:"6px 12px",fontSize:11,fontWeight:700,letterSpacing:1}}>NEW TRANSACTION ENTRY</div>
                <div style={{padding:14,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
                  {[{label:"CUSTOMER NAME *",key:"customerName",type:"text",placeholder:"Full name"},{label:"COUNTRY OF ORIGIN",key:"country",type:"select",opts:COUNTRIES},{label:"OCCUPATION",key:"occupation",type:"text",placeholder:"e.g. Businessman"},{label:"CUSTOMER RISK TIER",key:"customerRisk",type:"select",opts:["LOW","MEDIUM","HIGH"]},{label:"TRANSACTION TYPE",key:"type",type:"select",opts:TXN_TYPES},{label:"AMOUNT *",key:"amount",type:"number",placeholder:"e.g. 95000"},{label:"CURRENCY",key:"currency",type:"select",opts:CURRENCIES},{label:"DESTINATION COUNTRY",key:"destCountry",type:"select",opts:COUNTRIES}].map(f=>(
                    <div key={f.key}>
                      <div style={{fontSize:9,color:"#5c6bc0",fontWeight:700,letterSpacing:1,marginBottom:3}}>{f.label}</div>
                      {f.type==="select"?<select value={form[f.key]} onChange={e=>setForm(v=>({...v,[f.key]:e.target.value}))} style={{...inp,width:"100%"}}>{f.opts.map(o=><option key={o}>{o}</option>)}</select>:<input type={f.type} value={form[f.key]} onChange={e=>setForm(v=>({...v,[f.key]:e.target.value}))} placeholder={f.placeholder} style={{...inp,width:"100%",boxSizing:"border-box"}}/>}
                    </div>
                  ))}
                  <div style={{gridColumn:"1/-1",display:"flex",gap:8}}>
                    <button style={btn("primary")} onClick={submitManual}>SUBMIT & SCORE</button>
                    <button style={btn()} onClick={()=>setShowInput(false)}>CANCEL</button>
                  </div>
                </div>
              </div>
            )}

            <div style={{margin:"8px 12px"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                <thead><tr>{["STATUS","TXN ID","DATE","CUSTOMER","COUNTRY","TYPE","AMOUNT","RISK SCORE","FLAGS","ACTION"].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.map(txn=>(
                    <tr key={txn.id} style={{background:selected?.id===txn.id?"#e8eaf6":txn.status==="FLAGGED"?"#fff8f8":txn.status==="REVIEW"?"#fffde7":"#fff",cursor:"pointer"}} onClick={()=>{setSelected(txn===selected?null:txn);setAiResult(null);setSarText(null);}}>
                      <td style={td}><span style={badge(txn.status)}>{txn.status}</span></td>
                      <td style={{...td,fontFamily:"monospace",color:"#3949ab",fontWeight:600}}>{txn.id}</td>
                      <td style={td}>{new Date(txn.date).toLocaleDateString("en-GB")}</td>
                      <td style={{...td,fontWeight:600}}>{txn.customerName}</td>
                      <td style={td}>{txn.customerCountry}</td>
                      <td style={{...td,color:"#555"}}>{txn.type.replace(/_/g," ")}</td>
                      <td style={{...td,fontWeight:700,textAlign:"right"}}>{formatAmt(txn.amount)} <span style={{fontWeight:400,color:"#999",fontSize:10}}>{txn.currency}</span></td>
                      <td style={td}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <div style={{width:48,height:6,background:"#e0e0e0",borderRadius:1,overflow:"hidden"}}><div style={{height:"100%",width:`${txn.riskScore}%`,background:rc(txn.riskScore)}}/></div>
                          <span style={{fontWeight:700,color:rc(txn.riskScore)}}>{txn.riskScore}%</span>
                        </div>
                      </td>
                      <td style={td}>
                        <div style={{display:"flex",flexWrap:"wrap",gap:2}}>
                          {txn.flags.slice(0,2).map(f=><span key={f} style={{fontSize:9,padding:"1px 5px",background:"#ffebee",color:"#c62828",border:"1px solid #ef9a9a",borderRadius:1}}>{f.replace(/_/g," ")}</span>)}
                          {txn.flags.length>2&&<span style={{fontSize:9,color:"#999"}}>+{txn.flags.length-2}</span>}
                        </div>
                      </td>
                      <td style={td}><button style={{...btn("primary"),fontSize:10,padding:"2px 8px"}} onClick={e=>{e.stopPropagation();setSelected(txn);runAI(txn);}}>ANALYSE</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>}

          {activeTab==="customers"&&(
            <div style={{margin:12}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                <thead><tr>{["CUSTOMER ID","NAME","COUNTRY","TYPE","RISK TIER","OCCUPATION","TRANSACTIONS","FLAGGED","AVG RISK","TOTAL VOLUME"].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {custStats.map(c=>(
                    <tr key={c.id} style={{background:c.riskTier==="HIGH"?"#fff8f8":c.riskTier==="MEDIUM"?"#fffde7":"#fff"}}>
                      <td style={{...td,fontFamily:"monospace",color:"#3949ab"}}>{c.id}</td>
                      <td style={{...td,fontWeight:600}}>{c.name}</td>
                      <td style={td}>{c.country}</td>
                      <td style={td}>{c.type}</td>
                      <td style={td}><span style={badge(c.riskTier)}>{c.riskTier}</span></td>
                      <td style={td}>{c.occupation}</td>
                      <td style={{...td,textAlign:"center"}}>{c.txnCount}</td>
                      <td style={{...td,textAlign:"center",color:c.flaggedCount>0?"#c62828":"#2e7d32",fontWeight:700}}>{c.flaggedCount}</td>
                      <td style={td}><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:46,height:5,background:"#e0e0e0",borderRadius:1}}><div style={{height:"100%",width:`${c.avgRisk}%`,background:rc(c.avgRisk)}}/></div><span style={{fontWeight:700,color:rc(c.avgRisk)}}>{c.avgRisk}%</span></div></td>
                      <td style={{...td,fontWeight:600,textAlign:"right"}}>{formatAmt(c.volume)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab==="analytics"&&(
            <div style={{margin:12,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{gridColumn:"1/-1",display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
                {[{label:"TOTAL TRANSACTIONS",value:transactions.length,color:"#3949ab"},{label:"FLAGGED",value:flagged,color:"#c62828"},{label:"UNDER REVIEW",value:review,color:"#e65100"},{label:"CLEARED",value:cleared,color:"#2e7d32"},{label:"TOTAL VOLUME",value:formatAmt(transactions.reduce((s,t)=>s+t.amount,0)),color:"#00695c"}].map(k=>(
                  <div key={k.label} style={{background:"#fff",border:"1px solid #dde0e6",borderTop:`3px solid ${k.color}`,padding:"10px 14px",borderRadius:2}}>
                    <div style={{fontSize:9,color:"#757575",letterSpacing:1,marginBottom:4}}>{k.label}</div>
                    <div style={{fontSize:22,fontWeight:700,color:k.color}}>{k.value}</div>
                  </div>
                ))}
              </div>
              <div style={{background:"#fff",border:"1px solid #dde0e6",borderRadius:2,overflow:"hidden"}}>
                <div style={{background:"#283593",color:"#fff",padding:"6px 12px",fontSize:11,fontWeight:700,letterSpacing:1}}>FLAG DISTRIBUTION</div>
                <div style={{padding:14}}>
                  {Object.entries(transactions.flatMap(t=>t.flags).reduce((a,f)=>({...a,[f]:(a[f]||0)+1}),{})).sort((a,b)=>b[1]-a[1]).map(([flag,count])=>(
                    <div key={flag} style={{marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:11}}>{flag.replace(/_/g," ")}</span><span style={{fontSize:11,fontWeight:700,color:"#c62828"}}>{count}</span></div>
                      <div style={{height:5,background:"#e0e0e0",borderRadius:1}}><div style={{height:"100%",width:`${(count/transactions.length)*100}%`,background:"#3949ab",borderRadius:1}}/></div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{background:"#fff",border:"1px solid #dde0e6",borderRadius:2,overflow:"hidden"}}>
                <div style={{background:"#283593",color:"#fff",padding:"6px 12px",fontSize:11,fontWeight:700,letterSpacing:1}}>RISK BREAKDOWN</div>
                <div style={{padding:14}}>
                  {[{label:"HIGH RISK (75-100)",count:transactions.filter(t=>t.riskScore>=75).length,color:"#c62828"},{label:"MEDIUM RISK (50-74)",count:transactions.filter(t=>t.riskScore>=50&&t.riskScore<75).length,color:"#e65100"},{label:"LOW RISK (0-49)",count:transactions.filter(t=>t.riskScore<50).length,color:"#2e7d32"}].map(r=>(
                    <div key={r.label} style={{marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11}}>{r.label}</span><span style={{fontWeight:700,color:r.color}}>{r.count} ({Math.round(r.count/transactions.length*100)}%)</span></div>
                      <div style={{height:8,background:"#e0e0e0",borderRadius:1}}><div style={{height:"100%",width:`${(r.count/transactions.length)*100}%`,background:r.color,borderRadius:1}}/></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab==="sar"&&(
            <div style={{margin:12}}>
              <div style={{background:"#fff3e0",border:"1px solid #ffcc02",borderRadius:2,padding:"8px 14px",marginBottom:12,fontSize:11,color:"#e65100"}}>
                Warning: SAR Reports are AI-generated. Review all content before official FinCEN filing.
              </div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                <thead><tr>{["TXN ID","CUSTOMER","AMOUNT","FLAGS","RISK","ACTION"].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {transactions.filter(t=>t.status==="FLAGGED").slice(0,15).map(txn=>(
                    <tr key={txn.id} style={{background:"#fff8f8",cursor:"pointer"}}>
                      <td style={{...td,fontFamily:"monospace",color:"#3949ab"}}>{txn.id}</td>
                      <td style={{...td,fontWeight:600}}>{txn.customerName}</td>
                      <td style={{...td,fontWeight:700}}>{formatAmt(txn.amount)} {txn.currency}</td>
                      <td style={td}>{txn.flags.slice(0,2).map(f=><span key={f} style={{fontSize:9,padding:"1px 5px",background:"#ffebee",color:"#c62828",border:"1px solid #ef9a9a",borderRadius:1,marginRight:3}}>{f.replace(/_/g," ")}</span>)}</td>
                      <td style={{...td,color:"#c62828",fontWeight:700}}>{txn.riskScore}%</td>
                      <td style={td}><button style={{...btn("danger"),fontSize:10}} onClick={()=>{setSelected(txn);setActiveTab("queue");runAI(txn);}}>OPEN</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selected&&(
          <div style={{background:"#fff",borderLeft:"1px solid #dde0e6",overflow:"auto",display:"flex",flexDirection:"column"}}>
            <div style={{background:"#1a237e",color:"#fff",padding:"7px 12px",fontSize:11,fontWeight:700,letterSpacing:1,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
              <span>TRANSACTION DETAIL</span>
              <button onClick={()=>{setSelected(null);setAiResult(null);setSarText(null);}} style={{background:"none",border:"none",color:"rgba(255,255,255,0.7)",cursor:"pointer",fontSize:14}}>✕</button>
            </div>
            <div style={{padding:12,flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={badge(selected.status)}>{selected.status}</span>
                <span style={{fontSize:20,fontWeight:700,color:rc(selected.riskScore)}}>{selected.riskScore}%</span>
              </div>
              <div style={{height:6,background:"#e0e0e0",borderRadius:1,marginBottom:12}}><div style={{height:"100%",width:`${selected.riskScore}%`,background:rc(selected.riskScore),borderRadius:1}}/></div>
              {[["TXN ID",selected.id,true],["CUSTOMER",selected.customerName],["COUNTRY",selected.customerCountry],["OCCUPATION",selected.occupation],["CUST RISK",selected.customerRisk],["TXN TYPE",selected.type.replace(/_/g," ")],["AMOUNT",`${selected.currency} ${selected.amount.toLocaleString("en-US",{minimumFractionDigits:2})}`],["ROUTE",`${selected.originCountry} to ${selected.destCountry}`],["DATE",new Date(selected.date).toLocaleDateString("en-GB")]].map(([label,value,mono])=>(
                <div key={label} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #f0f2f5",fontSize:11}}>
                  <span style={{color:"#757575",fontSize:10,letterSpacing:0.5}}>{label}</span>
                  <span style={{fontWeight:600,fontFamily:mono?"monospace":"inherit",color:mono?"#3949ab":"#1a1a2e",textAlign:"right",maxWidth:170}}>{value}</span>
                </div>
              ))}
              {selected.flags.length>0&&(
                <div style={{marginTop:10}}>
                  <div style={{fontSize:9,color:"#5c6bc0",fontWeight:700,letterSpacing:1,marginBottom:5}}>FLAGS TRIGGERED</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                    {selected.flags.map(f=><span key={f} style={{fontSize:9,padding:"2px 7px",background:"#ffebee",color:"#c62828",border:"1px solid #ef9a9a",borderRadius:1}}>flag {f.replace(/_/g," ")}</span>)}
                  </div>
                </div>
              )}
              <div style={dv}/>
              <div style={{fontSize:9,color:"#5c6bc0",fontWeight:700,letterSpacing:1,marginBottom:6}}>AI ANALYST</div>
              {!aiLoading&&!aiResult&&<button style={btn("primary")} onClick={()=>runAI(selected)}>RUN AI ANALYSIS</button>}
              {aiLoading&&(
                <div style={{padding:10,background:"#e8eaf6",border:"1px solid #9fa8da",borderRadius:2,textAlign:"center"}}>
                  <div style={{fontSize:10,color:"#3949ab",letterSpacing:2}}>ANALYSING TRANSACTION...</div>
                  <div style={{height:3,background:"#c5cae9",borderRadius:1,marginTop:8,overflow:"hidden"}}><div style={{height:"100%",background:"#3949ab",width:"60%",animation:"scan 1.2s ease-in-out infinite",borderRadius:1}}/></div>
                </div>
              )}
              {aiResult&&!aiLoading&&(
                <div style={{border:"1px solid #dde0e6",borderRadius:2,overflow:"hidden"}}>
                  <div style={{background:aiResult.verdict==="SUSPICIOUS"?"#c62828":aiResult.verdict==="LEGITIMATE"?"#2e7d32":"#e65100",color:"#fff",padding:"6px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:11,fontWeight:700,letterSpacing:1}}>{aiResult.verdict}</span>
                    <span style={{fontSize:10,padding:"1px 8px",background:"rgba(255,255,255,0.2)",borderRadius:2}}>{aiResult.recommended_action}</span>
                  </div>
                  <div style={{padding:10}}>
                    <div style={{fontSize:11,fontWeight:600,color:"#c62828",marginBottom:6}}>{aiResult.primary_concern}</div>
                    <div style={{fontSize:11,color:"#555",lineHeight:1.6,marginBottom:8,padding:"6px 8px",background:"#f5f6fa",borderRadius:1}}>{aiResult.reasoning}</div>
                    {aiResult.typology&&aiResult.typology!=="None"&&aiResult.typology!=="Unknown"&&<div style={{fontSize:11,marginBottom:8}}><span style={{color:"#757575"}}>ML Typology: </span><span style={{fontWeight:700,color:"#e65100"}}>{aiResult.typology}</span></div>}
                    <div style={{marginBottom:6}}>
                      <div style={{fontSize:9,color:"#757575",letterSpacing:1,marginBottom:2}}>CONFIDENCE: {aiResult.confidence}%</div>
                      <div style={{height:4,background:"#e0e0e0",borderRadius:1}}><div style={{height:"100%",width:`${aiResult.confidence}%`,background:"#3949ab",borderRadius:1}}/></div>
                    </div>
                    {aiResult.risk_factors?.length>0&&<div style={{marginBottom:6}}><div style={{fontSize:9,color:"#757575",letterSpacing:1,marginBottom:2}}>RISK FACTORS</div>{aiResult.risk_factors.map((f,i)=><div key={i} style={{fontSize:10,color:"#c62828",marginBottom:1}}>- {f}</div>)}</div>}
                    {aiResult.mitigating_factors?.length>0&&<div style={{marginBottom:8}}><div style={{fontSize:9,color:"#757575",letterSpacing:1,marginBottom:2}}>MITIGATING FACTORS</div>{aiResult.mitigating_factors.map((f,i)=><div key={i} style={{fontSize:10,color:"#2e7d32",marginBottom:1}}>- {f}</div>)}</div>}
                    {(aiResult.recommended_action==="FILE_SAR"||aiResult.recommended_action==="FREEZE")&&<button style={{...btn("danger"),width:"100%",marginTop:4}} onClick={()=>genSAR(selected)}>{sarLoading?"GENERATING...":"GENERATE SAR REPORT"}</button>}
                  </div>
                </div>
              )}
              {sarText&&(
                <div style={{marginTop:10,border:"1px solid #ef9a9a",borderRadius:2,overflow:"hidden"}}>
                  <div style={{background:"#c62828",color:"#fff",padding:"6px 10px",fontSize:10,fontWeight:700,letterSpacing:1}}>SAR NARRATIVE - FINCEN FORMAT</div>
                  <div style={{padding:10,fontSize:10,color:"#333",lineHeight:1.8,whiteSpace:"pre-wrap",maxHeight:300,overflow:"auto"}}>{sarText}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes scan{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}} tbody tr:hover{filter:brightness(0.97)}`}</style>
    </div>
  );
}