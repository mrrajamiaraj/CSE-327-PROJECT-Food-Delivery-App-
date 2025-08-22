const API_BASE = window.API_BASE || '/api';

const state = {
  restaurants: [],
  categories: [],
  selectedRestaurantId: null,
  selectedCategoryId: null,
  cartId: null,
  cartCount: 0,
  searchQuery: ''
};

function imgForCategory(name) {
  const base = (window.STATIC_PREFIX || '') + 'home/img/';
  const key = (name || '').toLowerCase();
  if (key.includes('burger')) return base + 'burger.png';
  if (key.includes('pizza'))  return base + 'pizza.png';
  if (key.includes('drink'))  return base + 'drink.png';
  if (key.includes('rice'))   return base + 'rice.png';
  if (key.includes('chicken'))return base + 'chicken.png';
  return base + 'food.png';
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

async function ensureCart() {
  let cid = localStorage.getItem('cart_id');
  if (!cid) {
    const data = await fetchJSON(`${API_BASE}/carts/`, { method: 'POST' });
    cid = data.id;
    localStorage.setItem('cart_id', cid);
  }
  state.cartId = cid;
}

async function loadCartCount() {
  if (!state.cartId) return;
  const data = await fetchJSON(`${API_BASE}/carts/${state.cartId}/`);
  const count = (data.items || []).reduce((s, it) => s + it.quantity, 0);
  state.cartCount = count;
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = String(count);
}

async function loadRestaurants() {
  const data = await fetchJSON(`${API_BASE}/restaurants/`);
  state.restaurants = data;
  renderRestaurants();
}

async function loadCategories() {
  const first = state.restaurants[0];
  if (!first) { state.categories = []; renderCategories(); return; }
  const data = await fetchJSON(`${API_BASE}/categories/?restaurant=${first.id}`);
  state.selectedRestaurantId = first.id;
  state.categories = data;
  renderCategories();
}

function makeCatPill(cat, active) {
  const btn = document.createElement('button');
  btn.className = 'cat-pill' + (active ? ' active' : '');
  btn.innerHTML = `<img src="${imgForCategory(cat?.name)}" alt=""><span>${cat?.name}</span>`;
  btn.onclick = () => {
    state.selectedCategoryId = active ? null : cat.id;
    renderCategories();
    renderRestaurants();
  };
  return btn;
}

function renderCategories() {
  const wrap = document.getElementById('cats');
  if (!wrap) return;
  wrap.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.className = 'cat-pill' + (state.selectedCategoryId ? '' : ' active');
  allBtn.innerHTML = `<img src="${imgForCategory('All')}" alt=""><span>All</span>`;
  allBtn.onclick = () => { state.selectedCategoryId = null; renderCategories(); renderRestaurants(); };
  wrap.appendChild(allBtn);
  state.categories.forEach(c => wrap.appendChild(makeCatPill(c, String(state.selectedCategoryId) === String(c.id))));
}

function restMetaHTML() {
  return `
    <div class="meta">
      <span><svg width="16" height="16" viewBox="0 0 24 24"><path fill="#f59e0b" d="m12 17.27l6.18 3.73l-1.64-7.03L21 9.24l-7.19-.62L12 2L10.19 8.62L3 9.24l4.46 4.73L5.82 21z"/></svg> 4.7</span>
      <span><svg width="16" height="16" viewBox="0 0 24 24"><path fill="#f59e0b" d="M12 2a8 8 0 0 0-8 8c0 7 8 12 8 12s8-5 8-12a8 8 0 0 0-8-8m0 11a3 3 0 1 1 0-6a3 3 0 0 1 0 6Z"/></svg> Free</span>
      <span><svg width="16" height="16" viewBox="0 0 24 24"><path fill="#f59e0b" d="M12 3a9 9 0 1 0 9 9a9 9 0 0 0-9-9m.5 4h-1v6l5.25 3.15l.5-.82l-4.75-2.83Z"/></svg> 20 min</span>
    </div>
  `;
}

function restaurantCard(r) {
  const img = r.image_url || `https://picsum.photos/seed/rest${r.id}/800/500`;
  return `
    <div class="card">
      <img src="${img}" alt="${r.name}" />
      <div class="card-body">
        <div class="card-title">${r.name}</div>
        <div class="card-sub">${r.address || ''}</div>
        ${restMetaHTML()}
      </div>
    </div>
  `;
}

function renderRestaurants() {
  const list = document.getElementById('restList');
  if (!list) return;
  const q = (state.searchQuery || '').toLowerCase().trim();
  let rows = state.restaurants;
  if (q) {
    rows = rows.filter(r =>
      (r.name || '').toLowerCase().includes(q) ||
      (r.address || '').toLowerCase().includes(q)
    );
  }
  if (state.selectedCategoryId) {
    const cid = String(state.selectedCategoryId);
    rows = rows.filter(() => true); // category-driven filtering is app-specific; keep all for now
  }
  list.innerHTML = rows.map(restaurantCard).join('');
}

function wireUI() {
  const menuBtn = document.getElementById('menuBtn');
  const drawer = document.getElementById('drawer');
  const scrim = document.getElementById('scrim');
  const closeDrawer = document.getElementById('closeDrawer');
  if (menuBtn && drawer && scrim) {
    menuBtn.onclick = () => { drawer.classList.add('open'); scrim.classList.add('show'); };
    closeDrawer.onclick = () => { drawer.classList.remove('open'); scrim.classList.remove('show'); };
    scrim.onclick = () => { drawer.classList.remove('open'); scrim.classList.remove('show'); };
  }

  const addrBtn = document.getElementById('addrBtn');
  const addrText = document.getElementById('addrText');
  const saved = localStorage.getItem('delivery_addr') || 'Choose location';
  if (addrText) addrText.textContent = saved;
  if (addrBtn) {
    addrBtn.onclick = () => {
      const v = prompt('Delivery address', localStorage.getItem('delivery_addr') || '');
      if (v !== null) {
        localStorage.setItem('delivery_addr', v || 'Choose location');
        if (addrText) addrText.textContent = v || 'Choose location';
      }
    };
  }

  const search = document.getElementById('search');
  if (search) {
    search.oninput = () => {
      state.searchQuery = search.value;
      renderRestaurants();
    };
  }

  const seeAllCats = document.getElementById('seeAllCats');
  if (seeAllCats) seeAllCats.onclick = (e) => { e.preventDefault(); state.selectedCategoryId = null; renderCategories(); renderRestaurants(); };

  const seeAllRests = document.getElementById('seeAllRests');
  if (seeAllRests) seeAllRests.onclick = (e) => { e.preventDefault(); state.searchQuery = ''; if (search) search.value=''; renderRestaurants(); };
}

async function init() {
  wireUI();
  await ensureCart();
  await Promise.all([loadRestaurants(), loadCartCount()]);
  await loadCategories();
}

document.addEventListener('DOMContentLoaded', init);
