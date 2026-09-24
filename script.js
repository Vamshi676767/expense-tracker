const KEY="expenseflow_transactions_v2", THEME="expenseflow_theme_v2";
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
let transactions=JSON.parse(localStorage.getItem(KEY)||"[]");
const now=new Date(); const dateInput=$("#date"); dateInput.value=now.toISOString().slice(0,10);
$("#today").textContent=now.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"});

function money(n){return "₹"+Number(n).toLocaleString("en-IN",{maximumFractionDigits:2})}
function save(){localStorage.setItem(KEY,JSON.stringify(transactions))}
function icon(c){return {Food:"◉",Transport:"↗",Education:"▣",Shopping:"◇",Entertainment:"♪",Salary:"＋",Other:"•"}[c]||"•"}
function esc(v){const d=document.createElement("div");d.textContent=v;return d.innerHTML}
function isThisMonth(date){const d=new Date(date+"T00:00:00"), n=new Date();return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear()}

function updateSummary(){
 const income=transactions.filter(t=>t.type==="income").reduce((s,t)=>s+Number(t.amount),0);
 const expense=transactions.filter(t=>t.type==="expense").reduce((s,t)=>s+Number(t.amount),0);
 const month=transactions.filter(t=>t.type==="expense"&&isThisMonth(t.date)).reduce((s,t)=>s+Number(t.amount),0);
 $("#income").textContent=money(income); $("#expense").textContent=money(expense); $("#balance").textContent=money(income-expense); $("#monthExpense").textContent=money(month);
}
function drawChart(){
 const period=$("#chartPeriod").value; const filtered=transactions.filter(t=>t.type==="expense"&&(period==="all"||isThisMonth(t.date)));
 const totals={}; filtered.forEach(t=>totals[t.category]=(totals[t.category]||0)+Number(t.amount)); const entries=Object.entries(totals); const canvas=$("#chart"),ctx=canvas.getContext("2d"); ctx.clearRect(0,0,canvas.width,canvas.height);
 $("#chartEmpty").style.display=entries.length?"none":"block"; if(!entries.length){$("#legend").innerHTML="";return}
 const total=entries.reduce((s,[,v])=>s+v,0),cx=260,cy=145,r=93; let a=-Math.PI/2; const colors=["#173c35","#b78a4a","#5b806f","#b85d52","#777d75","#8f6d9e","#5b7180"];
 entries.forEach(([name,val],i)=>{const slice=val/total*Math.PI*2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,a,a+slice);ctx.closePath();ctx.fillStyle=colors[i%colors.length];ctx.fill();a+=slice});
 ctx.beginPath();ctx.arc(cx,cy,54,0,Math.PI*2);ctx.fillStyle=getComputedStyle(document.body).getPropertyValue("--surface");ctx.fill();ctx.fillStyle=getComputedStyle(document.body).getPropertyValue("--ink");ctx.textAlign="center";ctx.font="600 17px DM Sans";ctx.fillText(money(total),cx,cy+6);
 $("#legend").innerHTML=entries.map(([n,v],i)=>`<span><b style="color:${colors[i%colors.length]}">●</b> ${esc(n)} ${money(v)}</span>`).join("");
}
function render(){
 updateSummary(); drawChart(); const q=$("#search").value.trim().toLowerCase(), f=$("#filter").value;
 const list=transactions.filter(t=>(f==="all"||t.type===f)&&(!q||t.description.toLowerCase().includes(q)||t.category.toLowerCase().includes(q))).sort((a,b)=>new Date(b.date)-new Date(a.date));
 $("#transactions").innerHTML=list.length?list.map(t=>`<div class="transaction"><div class="transaction-info"><div class="category-icon">${icon(t.category)}</div><div><div class="transaction-title">${esc(t.description)}</div><div class="transaction-meta">${esc(t.category)} · ${new Date(t.date+"T00:00:00").toLocaleDateString("en-IN")}</div></div></div><div><span class="amount ${t.type}">${t.type==="income"?"+":"−"}${money(t.amount)}</span><button class="delete" data-id="${t.id}" aria-label="Delete transaction">×</button></div></div>`).join(""): `<div class="empty">No transactions found.<br>Add your first entry above.</div>`;
}
$$(".type-btn").forEach(btn=>btn.addEventListener("click",()=>{$$(".type-btn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");$("#type").value=btn.dataset.type;$("#category").value=btn.dataset.type==="income"?"Salary":"Food"}));
$("#transactionForm").addEventListener("submit",e=>{e.preventDefault();const amount=Number($("#amount").value);if(!amount||amount<=0)return;transactions.push({id:crypto.randomUUID?crypto.randomUUID():Date.now().toString(),description:$("#description").value.trim(),amount,type:$("#type").value,category:$("#category").value,date:dateInput.value});save();e.target.reset();dateInput.value=new Date().toISOString().slice(0,10);$("#type").value="expense";$$(".type-btn").forEach(b=>b.classList.toggle("active",b.dataset.type==="expense"));$("#category").value="Food";render()});
$("#transactions").addEventListener("click",e=>{const id=e.target.dataset.id;if(!id)return;transactions=transactions.filter(t=>t.id!==id);save();render()});
$("#search").addEventListener("input",render);$("#filter").addEventListener("change",render);$("#chartPeriod").addEventListener("change",drawChart);
$("#themeBtn").addEventListener("click",()=>{document.body.classList.toggle("dark");localStorage.setItem(THEME,document.body.classList.contains("dark")?"dark":"light");$("#themeBtn").textContent=document.body.classList.contains("dark")?"☀":"☾";drawChart()});
if(localStorage.getItem(THEME)==="dark"){$("body").classList.add("dark");$("#themeBtn").textContent="☀"}
render();
