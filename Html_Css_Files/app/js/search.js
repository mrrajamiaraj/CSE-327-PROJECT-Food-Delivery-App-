
const SUGGESTED = [
  {name:'Pansi Restaurant', rating:4.7, img:'img/r1.jpg'},
  {name:'American Spicy Burger Shop', rating:4.3, img:'img/r3.jpg'},
  {name:'Cafenio Coffee Club', rating:4.0, img:'img/r2.jpg'},
];
const POPULAR = [
  {title:'European Pizza', sub:'Uttora Coffee House', img:'img/pizza1.png'},
  {title:'Buffalo Pizza.',  sub:'Cafenio Coffee Club', img:'img/pizza2.png'},
];


document.getElementById('cartBadge').textContent =
  (JSON.parse(localStorage.getItem('cart')||'[]').length)||2;


const params = new URLSearchParams(location.search);
const qInput = document.getElementById('q');
const initQ = params.get('q') ? decodeURIComponent(params.get('q')) : '';
qInput.value = initQ || '';


const KEY = 'recent_keywords';
function getRecent(){ try{ return JSON.parse(localStorage.getItem(KEY)||'[]'); } catch { return []; } }
function saveRecent(list){ localStorage.setItem(KEY, JSON.stringify(list.slice(0,8))); }
function addRecent(term){
  term = term.trim(); if(!term) return;
  const list = getRecent().filter(x => x.toLowerCase() !== term.toLowerCase());
  list.unshift(term); saveRecent(list); renderChips();
}
function renderChips(){
  const wrap = document.getElementById('chips');
  const items = getRecent();
  wrap.innerHTML = items.map(t => `<button class="chip" data-k="${t}">${t}</button>`).join('');
  [...wrap.querySelectorAll('.chip')].forEach(b => {
    b.onclick = ()=> { qInput.value = b.dataset.k; doSearch(); };
  });
}
renderChips();

-
function renderSuggested(list){
  const el = document.getElementById('suggest');
  el.innerHTML = list.map(x => `
    <div class="item">
      <img class="thumb" src="${x.img}" alt="">
      <div>
        <p class="name">${x.name}</p>
        <div class="rating">⭐ ${x.rating}</div>
      </div>
    </div>`).join('') + `<div style="height:6px;background:#fff;border-top:1px solid var(--line)"></div>`;
}
renderSuggested(SUGGESTED);


function renderPopular(list){
  const el = document.getElementById('grid');
  el.innerHTML = list.map(x => `
    <div class="food-card">
      <img src="${x.img}" alt="">
      <p class="food-title">${x.title}</p>
      <p class="food-sub">${x.sub}</p>
    </div>`).join('');
}
renderPopular(POPULAR);


function doSearch(){
  const term = qInput.value.trim();
  addRecent(term);
  const f = term.toLowerCase();
  const filtered = SUGGESTED.filter(s => s.name.toLowerCase().includes(f));
  renderSuggested(filtered.length ? filtered : SUGGESTED);
}
qInput.addEventListener('keydown', e => { if(e.key==='Enter'){ e.preventDefault(); doSearch(); } });
document.getElementById('clear').onclick = ()=>{ qInput.value=''; doSearch(); };


qInput.focus();
