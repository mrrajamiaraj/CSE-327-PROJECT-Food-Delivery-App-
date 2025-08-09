
const RESTS = {
  1: {
    id:1,
    name:'Spicy Restaurant',
    hero:'img/r1.jpg',
    desc:'Maecenas sed diam eget risus varius blandit sit amet non magna. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.',
    rating:4.7, fee:'Free', eta:'20 min',
    categories:['Burger','Sandwich','Pizza','Sandwiches','Drinks'],
    items:[
      {id:'b1',cat:'Burger',name:"Burger Ferguson",sub:"Spicy Restaurant",price:40,img:'img/b1.png'},
      {id:'b2',cat:'Burger',name:"Rockin' Burgers",sub:"Cafecafachino",price:40,img:'img/b2.png'},
      {id:'s1',cat:'Sandwich',name:"Club Sandwich",sub:"Daily Fresh",price:30,img:'img/b3.png'},
      {id:'p1',cat:'Pizza',name:"Cheese Pizza",sub:"Wood Fire",price:55,img:'img/b4.png'},
    ]
  },
  2: {
    id:2,
    name:'Rose Garden Restaurant',
    hero:'img/r2.jpg',
    desc:'Fresh bowls and warm plates for your day.',
    rating:4.6, fee:'৳29', eta:'18 min',
    categories:['Burger','Pizza','Drinks'],
    items:[
      {id:'b3',cat:'Burger',name:"Garden Burger",sub:"Rose Kitchen",price:38,img:'img/b1.png'},
      {id:'p2',cat:'Pizza',name:"Veggie Pizza",sub:"Rose Oven",price:52,img:'img/b4.png'},
    ]
  }
};


const $ = sel => document.querySelector(sel);
const params = new URLSearchParams(location.search);
const id = Number(params.get('id') || 1);
const data = RESTS[id] || RESTS[1];


function hydrate(){
  $('#heroImg').src = data.hero;
  $('#rName').textContent = data.name;
  $('#rDesc').textContent = data.desc;
  $('#rRating').textContent = data.rating;
  $('#rFee').textContent = data.fee;
  $('#rEta').textContent = data.eta;

  
  const catRow = $('#catRow');
  catRow.innerHTML = data.categories.map((c,i)=>
    `<button class="chip ${i===0?'active':''}" data-cat="${c}">${c}</button>`
  ).join('');

  
  renderCategory(data.categories[0]);

  
  [...catRow.querySelectorAll('.chip')].forEach(btn=>{
    btn.onclick = () => {
      catRow.querySelectorAll('.chip').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      renderCategory(btn.dataset.cat);
    };
  });

  $('#loading').classList.add('hidden');
  $('#content').classList.remove('hidden');
}


function renderCategory(cat){
  $('#sectionTitle').textContent = `${cat} (${data.items.filter(i=>i.cat===cat).length})`;
  const grid = $('#menuGrid');
  grid.innerHTML = data.items
    .filter(i=>i.cat===cat)
    .map(i => `
      <article class="card">
        <img class="thumb" src="${i.img}" alt="">
        <p class="cname">${i.name}</p>
        <p class="csub">${i.sub}</p>
        <div class="row">
          <span class="price">$${i.price}</span>
          <button class="add" data-id="${i.id}">＋</button>
        </div>
      </article>
    `).join('');

  
  [...grid.querySelectorAll('.add')].forEach(btn=>{
    btn.onclick = () => addToCart(btn.dataset.id);
  });
}


function addToCart(itemId) {
  const item = data.items.find(i => i.id === itemId);
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');

  
  const existing = cart.find(x => x.item === itemId);

  if (existing) {
    existing.qty += 1; 
    cart.push({
      rid: data.id,
      item: itemId,
      name: item?.name || 'Item',
      price: item?.price || 0,
      img: item?.img || 'img/b1.png',
      size: '14″',
      qty: 1,
      ts: Date.now()
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));

  
  location.href = 'cart.html';
}



function btnFlash(){
  
  const el = document.activeElement;
  if(el && el.classList.contains('add')){
    el.style.transform = 'scale(0.92)';
    setTimeout(()=>{ el.style.transform=''; }, 120);
  }
}


hydrate();
