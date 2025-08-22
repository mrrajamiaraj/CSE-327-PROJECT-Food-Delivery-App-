

(function greet(){
  const nm = (localStorage.getItem('user_name') || '').split(' ')[0];
  const h = new Date().getHours();
  const tod = h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
  document.querySelector('.hello').innerHTML = `Hey ${nm || ''}, <b>Good ${tod}!</b>`;
  const uName = document.getElementById('uName'); if(uName) uName.textContent = nm || 'Hello';
})();

(async function setAddress(){
  const t = document.getElementById('addrText');
  const loc = JSON.parse(localStorage.getItem('user_location')||'null');
  if(!loc){ t.textContent = 'Set location'; return; }
  try{
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lon}`, {headers:{'Accept-Language':'en'}});
    const j = await r.json();
    t.textContent = j.address?.suburb || j.address?.neighbourhood || j.address?.city || 'Current location';
  }catch{ t.textContent = 'Current location'; }
})();


document.getElementById('addrBtn').onclick = () => alert('Change location (to be implemented)');

const drawer = document.getElementById('drawer'), scrim = document.getElementById('scrim');
document.getElementById('menuBtn').onclick = ()=>{ drawer.classList.add('open'); scrim.classList.add('show'); };
document.getElementById('closeDrawer').onclick = ()=>{ drawer.classList.remove('open'); scrim.classList.remove('show'); };
scrim.onclick = ()=>{ drawer.classList.remove('open'); scrim.classList.remove('show'); };

document.getElementById('cartBadge').textContent = (JSON.parse(localStorage.getItem('cart')||'[]').length)||0;
document.getElementById('cartBtn').onclick = ()=> alert('Open cart');


const S = (path) => (window.STATIC_PREFIX || '/static/') + 'home/' + path;

const CATS = [
  {id:'all',     name:'All',        img:S('img/cat-burger.png')},
  {id:'burger',  name:'Burger',     img:S('img/cat-burger.png')},
  {id:'pizza',   name:'Pizza',      img:S('img/cat-pizza.png')},
  {id:'biriyani',name:'Biriyani',   img:S('img/cat-biriyani.png')},
  {id:'desi',    name:'Deshi foods',img:S('img/cat-desi.png')},
];
const catsEl = document.getElementById('cats');
function renderCats(active='all'){
  catsEl.innerHTML = CATS.map(c=>`
    <button class="cat-pill ${c.id===active?'active':''}" data-id="${c.id}">
      <img src="${c.img}" alt=""><span>${c.name}</span>
    </button>`).join('');
  [...catsEl.querySelectorAll('.cat-pill')].forEach(btn=>{
    btn.onclick = ()=>{ renderCats(btn.dataset.id); activeCat = btn.dataset.id; applyFilters(); };
  });
}
renderCats();

const RESTS = [
  {id:1,name:'Rose Garden Restaurant',tags:'Burger • Chicken • Rice • Wings',img:S('img/r1.jpg'),rating:4.7,fee:'Free',eta:'20 min',cats:['burger']},
  {id:2,name:'Green Bowl',tags:'Salad • Deshi',img:S('img/r2.jpg'),rating:4.5,fee:'৳29',eta:'18 min',cats:['desi']},
  {id:3,name:'Slice & Sip',tags:'Pizza • Coffee',img:S('img/r3.jpg'),rating:4.8,fee:'Free',eta:'15 min',cats:['pizza']},
  {id:4,name:'Biryani Point',tags:'Biriyani • Kebab',img:S('img/r2.jpg'),rating:4.6,fee:'৳35',eta:'25 min',cats:['biriyani']},
];

const restContainer = document.getElementById('restSlider') || document.getElementById('restList');
const useSlider = !!document.getElementById('restSlider');

function restCard(r){
  if(useSlider){
    return `
      <article class="rest-card" onclick="openRestaurant(${r.id})">
        <img src="${r.img}" alt="">
        <div class="rest-card-body">
          <div class="rest-card-title">${r.name}</div>
          <div class="rest-card-sub">${r.tags}</div>
          <div class="rest-meta">
            <span>⭐ ${r.rating}</span>
            <span>🛵 ${r.fee}</span>
            <span>⏱ ${r.eta}</span>
          </div>
        </div>
      </article>`;
  }
  return `
    <article class="card" onclick="openRestaurant(${r.id})">
      <img src="${r.img}" alt="">
      <div class="card-body">
        <div class="card-title">${r.name}</div>
        <div class="card-sub">${r.tags}</div>
        <div class="meta">
          <span>⭐ ${r.rating}</span>
          <span>🛵 ${r.fee}</span>
          <span>⏱ ${r.eta}</span>
        </div>
      </div>
    </article>`;
}

function renderRestaurants(items){
  restContainer.innerHTML = items.map(restCard).join('');
}

const prevBtn = document.getElementById('restPrev');
const nextBtn = document.getElementById('restNext');
if (useSlider && prevBtn && nextBtn){
  const step = 260;
  prevBtn.onclick = () => restContainer.scrollBy({left:-step, behavior:'smooth'});
  nextBtn.onclick = () => restContainer.scrollBy({left: step, behavior:'smooth'});
}

let activeCat = 'all';
const searchInput = document.getElementById('search');
function applyFilters(){
  const q = (searchInput?.value || '').trim().toLowerCase();
  let list = RESTS;
  if (activeCat !== 'all') list = list.filter(r => r.cats.includes(activeCat));
  if (q) list = list.filter(r => r.name.toLowerCase().includes(q) || r.tags.toLowerCase().includes(q));
  renderRestaurants(list);
}
if (searchInput){
  searchInput.addEventListener('input', applyFilters);
}

applyFilters();


window.openRestaurant = (id) => {
  alert('Open restaurant ' + id);
};


document.querySelector('.menu a[href="/login/"]')?.addEventListener('click', (e) => {
  e.preventDefault();
  location.href = '/login/';
});
