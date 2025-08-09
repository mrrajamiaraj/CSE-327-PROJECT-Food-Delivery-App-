
const $$ = s => document.querySelector(s);
const fmt = n => `$${Number(n).toFixed(0)}`;


function loadCart(){
  let c = [];
  try { c = JSON.parse(localStorage.getItem('cart')||'[]'); } catch {}
  
  c.forEach(x=>{ if(typeof x.qty!=='number') x.qty = 1; });
  return c;
}
function saveCart(c){ localStorage.setItem('cart', JSON.stringify(c)); }


function render(){
  const list = loadCart();
  const ul = $$('#list');
  if(!list.length){ ul.innerHTML = `<li style="color:#9aa3b2;padding:24px;text-align:center">Your cart is empty.</li>`; $$('#total').textContent = '$0'; return; }

  ul.innerHTML = list.map((x,i)=>`
    <li class="item" data-i="${i}">
      <img class="thumb" src="${x.img||'img/pizza1.png'}" alt="">
      <div class="infos">
        <p class="name">${x.name||'Item'}</p>
        <p class="price">${fmt(x.price||0)}</p>
        <p class="size">${x.size||'14″'}</p>
      </div>
      <div class="qty">
        <button class="qbtn minus" aria-label="minus">−</button>
        <span>${x.qty}</span>
        <button class="qbtn plus" aria-label="plus">＋</button>
        <button class="remove" aria-label="remove">✕</button>
      </div>
    </li>
  `).join('');

  
  ul.querySelectorAll('.minus').forEach(btn=>{
    btn.onclick = () => { const i = btn.closest('.item').dataset.i; const c = loadCart(); c[i].qty = Math.max(1, c[i].qty-1); saveCart(c); render(); };
  });
  ul.querySelectorAll('.plus').forEach(btn=>{
    btn.onclick = () => { const i = btn.closest('.item').dataset.i; const c = loadCart(); c[i].qty += 1; saveCart(c); render(); };
  });
  ul.querySelectorAll('.remove').forEach(btn=>{
    btn.onclick = () => { const i = btn.closest('.item').dataset.i; const c = loadCart(); c.splice(i,1); saveCart(c); render(); };
  });

  
  const total = list.reduce((s,x)=> s + (x.price||0) * (x.qty||1), 0);
  $$('#total').textContent = fmt(total);

  
  const loc = JSON.parse(localStorage.getItem('user_location')||'null');
  $$('#addrBox').textContent = localStorage.getItem('address_text') || (loc ? 'Using current location' : 'Set your address');
}


$('#editAddr').onclick = () => {
  const v = prompt('Enter delivery address:', localStorage.getItem('address_text') || '');
  if(v!==null){ localStorage.setItem('address_text', v.trim()); render(); }
};


$('#placeBtn').onclick = () => {
  if(!loadCart().length){ alert('Cart is empty'); return; }
  alert('Order placed (demo)');
  localStorage.removeItem('cart');
  render();
};


$('#doneBtn').onclick = () => history.back();


render();
