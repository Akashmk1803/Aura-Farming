(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---------- product data ---------- */
  var runeUse = '<svg x="{x}" y="{y}" width="{w}" height="{h}" viewBox="0 0 100 140" style="color:#e10600"><use href="#rune"/></svg>';
  var SVGS = {
    hoodie:'<svg viewBox="0 0 200 220"><path d="M62 52 Q58 30 78 22 Q100 12 122 22 Q142 30 138 52 L162 62 Q176 68 178 84 L186 150 Q187 160 177 162 L156 166 Q149 167 148 158 L144 120 L144 196 Q144 206 134 206 L66 206 Q56 206 56 196 L56 120 L52 158 Q51 167 44 166 L23 162 Q13 160 14 150 L22 84 Q24 68 38 62 Z" fill="#17171a" stroke="#2c2c31" stroke-width="2"/><path d="M74 40 Q100 62 126 40 Q120 66 100 66 Q80 66 74 40Z" fill="#0d0d0f" stroke="#2c2c31" stroke-width="2"/><path d="M92 66 V96 M108 66 V96" stroke="#3a1214" stroke-width="4" stroke-linecap="round"/><rect x="70" y="176" width="60" height="14" rx="4" fill="#0f0f11" stroke="#2c2c31"/><svg x="72" y="92" width="56" height="76" viewBox="0 0 100 140" style="color:#e10600"><use href="#rune"/></svg></svg>',
    tee:'<svg viewBox="0 0 200 220"><path d="M70 34 Q84 26 100 26 Q116 26 130 34 L168 52 Q176 56 173 65 L162 90 Q159 97 151 94 L138 88 L140 192 Q140 202 130 202 L70 202 Q60 202 60 192 L62 88 L49 94 Q41 97 38 90 L27 65 Q24 56 32 52 Z" fill="#18181b" stroke="#2c2c31" stroke-width="2"/><path d="M84 32 Q100 44 116 32" fill="none" stroke="#2c2c31" stroke-width="2"/><svg x="70" y="74" width="60" height="82" viewBox="0 0 100 140" style="color:#e10600"><use href="#rune"/></svg><text x="100" y="184" text-anchor="middle" fill="#7c7872" font-size="10" font-family="Anton" letter-spacing="4">AURA FARMING</text></svg>',
    jacket:'<svg viewBox="0 0 200 220"><path d="M64 44 L88 30 Q100 24 112 30 L136 44 L164 58 Q174 63 175 74 L180 148 Q181 158 171 159 L152 162 Q145 163 144 154 L142 118 L142 194 Q142 204 132 204 L68 204 Q58 204 58 194 L58 118 L56 154 Q55 163 48 162 L29 159 Q19 158 20 148 L25 74 Q26 63 36 58 Z" fill="#121215" stroke="#2c2c31" stroke-width="2"/><path d="M88 30 L100 58 L112 30" fill="#0b0b0d" stroke="#2c2c31" stroke-width="2"/><path d="M100 58 V204" stroke="#2c2c31" stroke-width="3"/><path d="M58 150 H142" stroke="#e10600" stroke-width="3"/><path d="M58 158 H142" stroke="#8f0400" stroke-width="1.5"/><rect x="64" y="96" width="14" height="20" fill="#0b0b0d" stroke="#2c2c31"/><rect x="122" y="96" width="14" height="20" fill="#0b0b0d" stroke="#2c2c31"/><svg x="106" y="74" width="26" height="36" viewBox="0 0 100 140" style="color:#e10600"><use href="#rune"/></svg></svg>',
    cargo:'<svg viewBox="0 0 200 220"><path d="M66 22 L134 22 Q140 22 140 30 L146 196 Q146 204 138 204 L116 204 Q108 204 108 196 L102 96 L98 96 L92 196 Q92 204 84 204 L62 204 Q54 204 54 196 L60 30 Q60 22 66 22Z" fill="#17171a" stroke="#2c2c31" stroke-width="2"/><rect x="60" y="30" width="80" height="10" fill="#0d0d0f" stroke="#2c2c31"/><path d="M58 108 L90 106 L88 138 L58 140 Z" fill="#0f0f11" stroke="#2c2c31" stroke-width="2"/><path d="M110 106 L142 108 L142 140 L112 138 Z" fill="#0f0f11" stroke="#2c2c31" stroke-width="2"/><path d="M58 122 H90 M110 122 H142" stroke="#e10600" stroke-width="2"/><svg x="120" y="160" width="18" height="26" viewBox="0 0 100 140" style="color:#e10600"><use href="#rune"/></svg></svg>',
    cap:'<svg viewBox="0 0 200 220"><path d="M46 118 Q46 58 100 58 Q154 58 154 118 L154 128 L46 128 Z" fill="#17171a" stroke="#2c2c31" stroke-width="2"/><path d="M46 128 Q100 112 154 128 L188 140 Q196 143 190 150 Q160 168 100 150 Q70 142 46 128Z" fill="#0f0f11" stroke="#2c2c31" stroke-width="2"/><path d="M100 58 Q96 90 96 122 M100 58 Q126 76 138 118" fill="none" stroke="#232327" stroke-width="2"/><svg x="84" y="78" width="30" height="42" viewBox="0 0 100 140" style="color:#e10600"><use href="#rune"/></svg></svg>',
    longsleeve:'<svg viewBox="0 0 200 220"><path d="M72 34 Q86 26 100 26 Q114 26 128 34 L158 48 Q168 53 169 64 L176 168 Q177 178 167 179 L150 181 Q142 182 141 173 L138 96 L138 194 Q138 202 130 202 L70 202 Q62 202 62 194 L62 96 L59 173 Q58 182 50 181 L33 179 Q23 178 24 168 L31 64 Q32 53 42 48 Z" fill="#18181b" stroke="#2c2c31" stroke-width="2"/><path d="M86 32 Q100 42 114 32" fill="none" stroke="#2c2c31" stroke-width="2"/><path d="M24 168 L59 166 M141 166 L176 168" stroke="#e10600" stroke-width="2.5"/><circle cx="100" cy="112" r="34" fill="none" stroke="#e10600" stroke-width="2.5"/><svg x="78" y="84" width="44" height="58" viewBox="0 0 100 140" style="color:#e10600"><use href="#rune"/></svg></svg>'
  };
  var PRODUCTS = [];
  var SIZES = {default:['S','M','L','XL'], headwear:['OS']};
  function money(n){ return '\u20B9' + n.toLocaleString('en-IN'); }

  /* ---------- build product grid ---------- */
  var grid = document.getElementById('grid');
  var empty = document.createElement('div');
  empty.className='empty'; empty.id='empty'; empty.textContent='Nothing here yet. The archive stays closed.';
  grid.appendChild(empty);

  function loadCatalog() {
    fetch('/api/products')
      .then(function(res) {
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .then(function(data) {
        PRODUCTS = data.map(function(item) {
          return {
            id: item.id,
            name: item.name,
            desc: item.description,
            price: item.price,
            cat: item.category,
            catLabel: item.category_label,
            art: item.art_svg_key,
            stock: item.stock
          };
        });
        
        PRODUCTS.forEach(function(p, i){
          var sizes = (p.cat==='headwear'?SIZES.headwear:SIZES.default);
          var defSize = sizes[sizes.length>1?1:0];
          var sizeHtml = sizes.map(function(s){ return '<button class="size'+(s===defSize?' sel':'')+'" data-size="'+s+'">'+s+'</button>'; }).join('');
          var card = document.createElement('article');
          card.className = 'card reveal';
          card.setAttribute('data-cat', p.cat);
          card.setAttribute('tabindex','0');
          card.dataset.size = defSize;
          card.dataset.pid = p.id;
          card.innerHTML =
            '<div class="card-media">'+
              '<span class="tag">001 / '+p.id+'</span><span class="cat-tag">'+p.catLabel+'</span>'+
              '<div class="fig"><div class="shadow"></div><div class="lift"><div class="spin">'+SVGS[p.art]+'</div></div></div>'+
            '</div>'+
            '<div class="card-body">'+
              '<div class="top"><div class="meta"><h3>'+p.name+'</h3><div class="desc">'+p.desc+'</div></div><div class="price">'+money(p.price)+'</div></div>'+
              '<div class="sizes">'+sizeHtml+'</div>'+
              '<button class="add" type="button"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Add to Cart</button>'+
            '</div>';
          grid.insertBefore(card, empty);
        });

        // Update category count badges
        var counts = { all: PRODUCTS.length };
        PRODUCTS.forEach(function(p) {
          counts[p.cat] = (counts[p.cat] || 0) + 1;
        });
        
        var catNames = {
          all: 'All',
          hoodies: 'Hoodies',
          tees: 'Tees',
          outerwear: 'Outerwear',
          bottoms: 'Bottoms',
          headwear: 'Headwear'
        };
        
        document.querySelectorAll('#cats .cat').forEach(function(btn) {
          var cat = btn.getAttribute('data-cat');
          var count = counts[cat] || 0;
          btn.innerHTML = catNames[cat] + '<sup>' + count + '</sup>';
        });

        // Apply current active category filter (in case catalog was reloaded)
        if (typeof filterGrid === 'function') {
          filterGrid();
        }

        if (typeof io !== 'undefined') {
          document.querySelectorAll('.card.reveal').forEach(function(el){ io.observe(el); });
        }
        
        if (typeof initCards === 'function') {
          initCards();
        }

        setTimeout(buildThread, 300);
      })
      .catch(function(err) {
        console.error('Failed to load dynamic catalog:', err);
        fly('Offline mode: Could not fetch catalog');
      });
  }

  loadCatalog();

  /* size selection */
  grid.addEventListener('click', function(e){
    var sz = e.target.closest('.size');
    if(sz){
      var card = sz.closest('.card');
      card.querySelectorAll('.size').forEach(function(s){ s.classList.remove('sel'); });
      sz.classList.add('sel');
      card.dataset.size = sz.getAttribute('data-size');
    }
  });

  /* ---------- COMBINED SEARCH & CATEGORY FILTERING ---------- */
  function filterGrid() {
    var activeBtn = document.querySelector('#cats .cat.on') || document.querySelector('#cats .cat[data-cat="all"]');
    var targetCat = activeBtn ? activeBtn.getAttribute('data-cat') : 'all';
    
    var searchInput = document.getElementById('searchInput');
    var query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    var cards = grid.querySelectorAll('.card');
    var visibleCount = 0;
    
    cards.forEach(function(card) {
      var cardCat = card.getAttribute('data-cat');
      var cardId = card.getAttribute('data-pid');
      var p = PRODUCTS.find(function(x) { return x.id === cardId; });
      
      var matchesCat = (targetCat === 'all' || cardCat === targetCat);
      var matchesSearch = true;
      if (query && p) {
        matchesSearch = (p.name.toLowerCase().indexOf(query) !== -1 || p.desc.toLowerCase().indexOf(query) !== -1);
      }
      
      if (matchesCat && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
    var emptyEl = document.getElementById('empty');
    if (emptyEl) {
      emptyEl.style.display = visibleCount === 0 ? 'block' : 'none';
    }
    
    if (typeof buildThread === 'function') {
      setTimeout(buildThread, 50);
    }
  }

  /* category filtering click handler */
  var catsContainer = document.getElementById('cats');
  if (catsContainer) {
    catsContainer.addEventListener('click', function(e) {
      var btn = e.target.closest('.cat');
      if (!btn) return;
      
      catsContainer.querySelectorAll('.cat').forEach(function(b) {
        b.classList.remove('on');
      });
      btn.classList.add('on');
      
      filterGrid();
    });
  }

  /* search input and button click handlers */
  var searchBtn = document.getElementById('searchBtn');
  var searchInput = document.getElementById('searchInput');
  
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', function() {
      if (searchInput.classList.contains('open')) {
        if (searchInput.value.trim() !== '') {
          // Clear input and reload
          searchInput.value = '';
          filterGrid();
        } else {
          // Collapse if empty
          searchInput.classList.remove('open');
        }
      } else {
        // Slide out and focus
        searchInput.classList.add('open');
        searchInput.focus();
      }
    });
    
    searchInput.addEventListener('input', function() {
      filterGrid();
    });
  }

  /* ---------- CART ---------- */
  var cart = [];
  try {
    var storedCart = localStorage.getItem('aura_cart');
    if (storedCart) {
      cart = JSON.parse(storedCart);
    }
  } catch (_) {
    cart = [];
  }
  var cartEl = document.getElementById('cart');
  var overlay = document.getElementById('overlay');
  var itemsEl = document.getElementById('cartItems');
  var countEl = document.getElementById('cartCount');
  var qtyLabel = document.getElementById('cartQtyLabel');

  function cartQty(){ return cart.reduce(function(a,c){ return a+c.qty; },0); }
  function subtotal(){ return cart.reduce(function(a,c){ return a+c.price*c.qty; },0); }

  function renderCart(){
    var q = cartQty();
    countEl.textContent = q;
    countEl.classList.toggle('show', q>0);
    qtyLabel.textContent = q>0 ? '('+q+')' : '';
    if(cart.length===0){
      itemsEl.innerHTML = '<div class="cart-empty"><img src="data:image/png;base64,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" alt=""><p>Your cart is empty</p><small>The mark is waiting. Add a piece to begin.</small></div>';
    } else {
      itemsEl.innerHTML = cart.map(function(c, idx){
        return '<div class="citem">'+
          '<div class="citem-fig">'+SVGS[c.art]+'</div>'+
          '<div class="citem-info"><h4>'+c.name+'</h4><div class="sz">Size '+c.size+'</div><button class="rm" data-idx="'+idx+'">Remove</button></div>'+
          '<div class="citem-right"><div class="citem-price">'+money(c.price*c.qty)+'</div>'+
            '<div class="qty"><button data-dec="'+idx+'">&minus;</button><span>'+c.qty+'</span><button data-inc="'+idx+'">+</button></div>'+
          '</div>'+
        '</div>';
      }).join('');
    }
    var sub = subtotal();
    document.getElementById('subtotal').textContent = money(sub);
    document.getElementById('shipping').textContent = (sub>=4999||sub===0)?'Free':money(199);
    var ship = (sub>=4999||sub===0)?0:199;
    document.getElementById('total').textContent = money(sub+ship);
    try {
      localStorage.setItem('aura_cart', JSON.stringify(cart));
    } catch (_) {}
    document.getElementById('checkoutBtn').disabled = cart.length===0;
  }

  function addToCart(p, size){
    var found = cart.find(function(c){ return c.pid===p.id && c.size===size; });
    if(found){ found.qty++; } else { cart.push({pid:p.id,name:p.name,price:p.price,art:p.art,size:size,qty:1}); }
    renderCart();
    navHold=Date.now()+900; nav.classList.remove('hidden');
    countEl.classList.remove('bump'); void countEl.offsetWidth; countEl.classList.add('bump');
    fly(p.name + ' added');
  }

  itemsEl.addEventListener('click', function(e){
    var t = e.target;
    if(t.dataset.inc!==undefined){ cart[+t.dataset.inc].qty++; renderCart(); }
    else if(t.dataset.dec!==undefined){ var i=+t.dataset.dec; cart[i].qty--; if(cart[i].qty<=0) cart.splice(i,1); renderCart(); }
    else if(t.dataset.idx!==undefined){ cart.splice(+t.dataset.idx,1); renderCart(); }
  });

  /* add buttons */
  grid.addEventListener('click', function(e){
    var btn = e.target.closest('.add');
    if(!btn) return;
    var card = btn.closest('.card');
    var p = PRODUCTS.find(function(x){ return x.id===card.dataset.pid; });
    addToCart(p, card.dataset.size);
    btn.classList.add('added');
    var orig = btn.innerHTML;
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>Added';
    setTimeout(function(){ btn.classList.remove('added'); btn.innerHTML = orig; }, 1300);
  });

  /* open product detail modal on card click */
  grid.addEventListener('click', function(e) {
    if (e.target.closest('.size') || e.target.closest('.add')) return;
    
    var card = e.target.closest('.card');
    if (!card) return;
    
    var pid = card.dataset.pid;
    openProductDetail(pid);
  });

  /* ---------- PRODUCT DETAIL MODAL CONTROLLERS ---------- */
  var pdetailModal = document.getElementById('pdetailModal');
  var pdetailOverlay = document.getElementById('pdetailOverlay');
  var pdetailClose = document.getElementById('pdetailClose');
  var pdetailAddBtn = document.getElementById('pdetailAddBtn');
  var pdetailSizes = document.getElementById('pdetailSizes');
  
  var activeDetailProduct = null;
  var selectedDetailSize = null;

  function openProductDetail(pid) {
    var p = PRODUCTS.find(function(x) { return x.id === pid; });
    if (!p) return;

    activeDetailProduct = p;
    var sizes = (p.cat === 'headwear' ? SIZES.headwear : SIZES.default);
    selectedDetailSize = sizes[sizes.length > 1 ? 1 : 0]; // Default to second size (e.g. M)

    document.getElementById('pdetailName').textContent = p.name;
    document.getElementById('pdetailCat').textContent = p.catLabel;
    document.getElementById('pdetailPrice').textContent = money(p.price);
    document.getElementById('pdetailDesc').textContent = p.desc;
    
    // Inject dynamic SVG with float shadow
    document.getElementById('pdetailMedia').innerHTML = 
      '<div class="fig" style="width: 220px; aspect-ratio: 200/220; position: relative;">'+
        '<div class="shadow" style="transform: translateX(-50%) scale(1.3); opacity: 0.45; bottom: -6px;"></div>'+
        '<div class="lift" style="transform: translateY(-20px) scale(1.15);"><div class="spin">'+SVGS[p.art]+'</div></div>'+
      '</div>';

    // Render sizes buttons
    pdetailSizes.innerHTML = sizes.map(function(s) {
      return '<button class="size' + (s === selectedDetailSize ? ' sel' : '') + '" data-size="' + s + '">' + s + '</button>';
    }).join('');

    // Reset Add button label
    pdetailAddBtn.className = 'pdetail-add-btn';
    pdetailAddBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Add to Cart';

    // Open modal
    pdetailModal.classList.add('open');
    document.body.classList.add('lock');
  }

  function closeProductDetail() {
    pdetailModal.classList.remove('open');
    // Release lock only if drawers are not open
    if (!cartEl.classList.contains('open') && !document.getElementById('authDrawer').classList.contains('open') && !document.getElementById('adminDrawer').classList.contains('open')) {
      document.body.classList.remove('lock');
    }
    activeDetailProduct = null;
    selectedDetailSize = null;
  }

  if (pdetailClose) pdetailClose.addEventListener('click', closeProductDetail);
  if (pdetailOverlay) pdetailOverlay.addEventListener('click', closeProductDetail);

  // Close modal on Escape key
  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeProductDetail();
    }
  });

  // Size selection inside details modal
  if (pdetailSizes) {
    pdetailSizes.addEventListener('click', function(e) {
      var sz = e.target.closest('.size');
      if (sz) {
        pdetailSizes.querySelectorAll('.size').forEach(function(s) { s.classList.remove('sel'); });
        sz.classList.add('sel');
        selectedDetailSize = sz.getAttribute('data-size');
      }
    });
  }

  // Add to cart inside details modal
  if (pdetailAddBtn) {
    pdetailAddBtn.addEventListener('click', function() {
      if (!activeDetailProduct || !selectedDetailSize) return;
      
      addToCart(activeDetailProduct, selectedDetailSize);
      
      pdetailAddBtn.classList.add('added');
      pdetailAddBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>Added';
      
      setTimeout(function() {
        pdetailAddBtn.classList.remove('added');
        pdetailAddBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Add to Cart';
      }, 1300);
    });
  }

  function openCart(){ cartEl.classList.add('open'); overlay.classList.add('open'); document.body.classList.add('lock'); }
  function closeCart(){ cartEl.classList.remove('open'); overlay.classList.remove('open'); document.body.classList.remove('lock'); }
  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  
  /* ---------- CHECKOUT WIZARD FLOW & 3D CARD ANIMATIONS ---------- */
  var cartHeader = document.getElementById('cartHeader');
  var checkoutHeader = document.getElementById('checkoutHeader');
  var cartFoot = document.getElementById('cartFoot');
  var checkoutFormContainer = document.getElementById('checkoutFormContainer');

  var checkoutClose = document.getElementById('checkoutClose');
  var goToPaymentBtn = document.getElementById('goToPaymentBtn');
  var backToShippingBtn = document.getElementById('backToShippingBtn');
  var submitPaymentBtn = document.getElementById('submitPaymentBtn');

  var checkoutStepShipping = document.getElementById('checkoutStepShipping');
  var checkoutStepPayment = document.getElementById('checkoutStepPayment');

  var checkoutNameInput = document.getElementById('checkoutName');
  var checkoutAddressInput = document.getElementById('checkoutAddress');

  function showCartView() {
    checkoutHeader.style.display = 'none';
    checkoutFormContainer.style.display = 'none';
    cartHeader.style.display = 'flex';
    itemsEl.style.display = 'block';
    cartFoot.style.display = 'block';
  }

  function showCheckoutView() {
    cartHeader.style.display = 'none';
    itemsEl.style.display = 'none';
    cartFoot.style.display = 'none';
    checkoutHeader.style.display = 'flex';
    checkoutFormContainer.style.display = 'flex';

    // Prefill coordinates if logged in
    if (currentUser) {
      checkoutNameInput.value = currentUser.full_name || '';
      checkoutAddressInput.value = currentUser.shipping_address || '';
    } else {
      checkoutNameInput.value = '';
      checkoutAddressInput.value = '';
    }

    // Default to shipping coordinates step
    checkoutStepShipping.style.display = 'flex';
    checkoutStepPayment.style.display = 'none';
  }

  // Trigger checkout view opening from cart drawer
  document.getElementById('checkoutBtn').addEventListener('click', function(){
    if(cart.length===0) return;
    
    if (!currentUser) {
      closeCart();
      openAuth();
      fly('Please login or register to complete your checkout');
      return;
    }
    
    showCheckoutView();
  });

  // Back to cart
  checkoutClose.addEventListener('click', showCartView);

  // Proceed to payment coordinates step
  goToPaymentBtn.addEventListener('click', function() {
    var name = checkoutNameInput.value;
    var address = checkoutAddressInput.value;

    if (!name || !address) {
      fly('Recipient name and address coordinates are required.');
      return;
    }

    // Autofill card name with shipping recipient
    document.getElementById('cardName').value = name;
    document.getElementById('cardDisplayName').textContent = name.toUpperCase();

    // Transition panels
    checkoutStepShipping.style.display = 'none';
    checkoutStepPayment.style.display = 'flex';
  });

  // Back to shipping
  backToShippingBtn.addEventListener('click', function() {
    checkoutStepPayment.style.display = 'none';
    checkoutStepShipping.style.display = 'flex';
  });

  /* 3D Card Animation & Logic */
  var creditCard3D = document.getElementById('creditCard3D');
  var cardNumInput = document.getElementById('cardNum');
  var cardNameInput = document.getElementById('cardName');
  var cardExpiryInput = document.getElementById('cardExpiry');
  var cardCVVInput = document.getElementById('cardCVV');

  var cardDisplayNum = document.getElementById('cardDisplayNum');
  var cardDisplayName = document.getElementById('cardDisplayName');
  var cardDisplayExpiry = document.getElementById('cardDisplayExpiry');
  var cardDisplayCVV = document.getElementById('cardDisplayCVV');
  var cardBrandLogo = document.getElementById('cardBrandLogo');

  // Flip card on CVV focus
  cardCVVInput.addEventListener('focus', function() {
    creditCard3D.style.transform = 'rotateY(180deg)';
  });
  cardCVVInput.addEventListener('blur', function() {
    creditCard3D.style.transform = 'rotateY(0deg)';
  });

  // Format Card Number (Spaces) & Detect brand
  cardNumInput.addEventListener('input', function(e) {
    var val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    var parts = [];
    for (var i = 0, len = val.length; i < len; i += 4) {
      parts.push(val.substring(i, i + 4));
    }
    var formatted = parts.join(' ');
    e.target.value = formatted;

    cardDisplayNum.textContent = formatted || '•••• •••• •••• ••••';

    // Detect card prefix
    if (val.startsWith('4')) {
      cardBrandLogo.textContent = 'VISA';
    } else if (val.startsWith('5')) {
      cardBrandLogo.textContent = 'MASTERCARD';
    } else if (val.startsWith('6')) {
      cardBrandLogo.textContent = 'RUPAY';
    } else {
      cardBrandLogo.textContent = 'AURA CARD';
    }
  });

  // Sync Card Name
  cardNameInput.addEventListener('input', function(e) {
    cardDisplayName.textContent = e.target.value.toUpperCase() || 'AURA INITIATE';
  });

  // Format Expiry (MM/YY)
  cardExpiryInput.addEventListener('input', function(e) {
    var val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (val.length >= 2) {
      e.target.value = val.substring(0, 2) + '/' + val.substring(2, 4);
    } else {
      e.target.value = val;
    }
    cardDisplayExpiry.textContent = e.target.value || 'MM/YY';
  });

  // Sync CVV
  cardCVVInput.addEventListener('input', function(e) {
    var val = e.target.value.replace(/[^0-9]/gi, '');
    e.target.value = val;
    cardDisplayCVV.textContent = val || '•••';
  });

  // Process order and payment simulation
  submitPaymentBtn.addEventListener('click', function() {
    var cardNum = cardNumInput.value.replace(/\s+/g, '');
    var cardName = cardNameInput.value;
    var expiry = cardExpiryInput.value;
    var cvv = cardCVVInput.value;

    if (cardNum.length < 16 || !cardName || expiry.length < 5 || cvv.length < 3) {
      fly('Please fill in correct payment credentials.');
      return;
    }

    // Disable and show loader
    submitPaymentBtn.disabled = true;
    submitPaymentBtn.textContent = 'Processing initiation details...';

    // 1. Submit Order to database
    var orderPayload = {
      shipping_name: checkoutNameInput.value,
      shipping_address: checkoutAddressInput.value,
      items: cart.map(function(item) {
        return {
          productId: item.pid,
          size: item.size,
          quantity: item.qty
        };
      })
    };

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    })
    .then(function(res) {
      return res.json().then(function(data) {
        if (!res.ok) throw new Error(data.error || 'Failed to initialize order');
        return data;
      });
    })
    .then(function(order) {
      // 2. Order created. Trigger simulated payment gateway checkout pay
      return fetch('/api/checkout/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.orderId,
          cardNum: cardNum,
          cardName: cardName,
          cvv: cvv,
          expiry: expiry
        })
      })
      .then(function(res) {
        return res.json().then(function(payData) {
          if (!res.ok) throw new Error(payData.error || 'Payment transaction failed');
          return payData;
        });
      });
    })
    .then(function(payResult) {
      // 3. Payment succeeded! Clear cart and close drawer
      cart = [];
      try { localStorage.removeItem('aura_cart'); } catch (_) {}
      renderCart();
      closeCart();
      showCartView(); // Reset view back to cart
      
      // Clear inputs
      cardNumInput.value = '';
      cardNameInput.value = '';
      cardExpiryInput.value = '';
      cardCVVInput.value = '';
      cardDisplayNum.textContent = '•••• •••• •••• ••••';
      cardDisplayName.textContent = 'AURA INITIATE';
      cardDisplayExpiry.textContent = 'MM/YY';
      cardDisplayCVV.textContent = '•••';

      fly('Payment coordinates authenticated! Order ID: ' + payResult.orderId);

      // Force update orders history list
      if (typeof fetchMyOrders === 'function') {
        fetchMyOrders();
      }

      // Open profile to view checkout orders history
      setTimeout(function() {
        openAuth();
      }, 1500);
    })
    .catch(function(err) {
      fly(err.message);
    })
    .finally(function() {
      submitPaymentBtn.disabled = false;
      submitPaymentBtn.textContent = 'Verify Initiation';
    });
  });
  
  /* ---------- AUTH DRAWER & STATE ---------- */
  var currentUser = null;
  var authDrawer = document.getElementById('authDrawer');
  var loginForm = document.getElementById('loginFormContainer');
  var registerForm = document.getElementById('registerFormContainer');
  var profileContainer = document.getElementById('profileContainer');

  var authNavBtn = document.getElementById('authNavBtn');
  var authNavText = document.getElementById('authNavText');
  var authClose = document.getElementById('authClose');

  function openAuth(){ authDrawer.classList.add('open'); overlay.classList.add('open'); document.body.classList.add('lock'); }
  function closeAuth(){ authDrawer.classList.remove('open'); overlay.classList.remove('open'); document.body.classList.remove('lock'); }

  authNavBtn.addEventListener('click', openAuth);
  authClose.addEventListener('click', closeAuth);
  overlay.addEventListener('click', function() { closeCart(); closeAuth(); });
  
  // Toggles inside auth drawer
  document.getElementById('toggleRegisterLink').addEventListener('click', function(e){
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'flex';
  });
  
  document.getElementById('toggleLoginLink').addEventListener('click', function(e){
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'flex';
  });

  function updateAuthUI() {
    if (currentUser) {
      authNavText.textContent = currentUser.full_name.split(' ')[0]; // Show first name
      loginForm.style.display = 'none';
      registerForm.style.display = 'none';
      document.getElementById('trackingPortalContainer').style.display = 'none';
      document.getElementById('authTitle').textContent = 'Wear The Mark';
      profileContainer.style.display = 'flex';
      document.getElementById('profileName').textContent = currentUser.full_name;
      document.getElementById('profileEmail').textContent = currentUser.email;
      document.getElementById('profileAddress').value = currentUser.shipping_address || '';
      
      // Toggle admin console footer button visibility
      if (currentUser.role === 'admin') {
        document.getElementById('adminPortalBtn').style.display = 'inline';
      } else {
        document.getElementById('adminPortalBtn').style.display = 'none';
      }
      
      if (typeof fetchMyOrders === 'function') {
        fetchMyOrders();
      }
    } else {
      authNavText.textContent = 'Login';
      profileContainer.style.display = 'none';
      document.getElementById('adminPortalBtn').style.display = 'none'; // Hide if logged out
      document.getElementById('trackingPortalContainer').style.display = 'none';
      document.getElementById('authTitle').textContent = 'Wear The Mark';
      registerForm.style.display = 'none';
      loginForm.style.display = 'flex';
    }
  }

  // Fetch Order History for Profile
  function fetchMyOrders() {
    var list = document.getElementById('profileOrdersList');
    fetch('/api/orders/my-orders')
      .then(function(res) {
        if (!res.ok) throw new Error('Failed to fetch orders');
        return res.json();
      })
      .then(function(orders) {
        if (orders.length === 0) {
          list.innerHTML = '<p style="font-style:italic; font-family:var(--serif);">No marks retrieved yet.</p>';
          return;
        }
        list.innerHTML = orders.map(function(order) {
          var itemsHtml = order.items.map(function(item) {
            return item.name + ' (' + item.size + ') x' + item.quantity;
          }).join(', ');
          
          return '<div class="order-card-link" data-order-id="'+order.id+'" style="background:rgba(236,232,225,.03); border:1px solid var(--hair2); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:4px; margin-bottom: 8px; cursor:pointer; transition:border-color 0.2s, background 0.2s;">'+
            '<div style="display:flex; justify-content:space-between; font-weight:600; font-size:0.75rem;"><span>'+order.id+'</span><span style="color:var(--red);">'+order.status.toUpperCase()+'</span></div>'+
            '<div style="font-size:0.7rem; color:var(--dim2); line-height: 1.3;">'+itemsHtml+'</div>'+
            '<div style="font-weight:600; font-size:0.75rem; margin-top:2px;">'+money(order.total)+'</div>'+
          '</div>';
        }).join('');
      })
      .catch(function(err) {
        list.innerHTML = '<p style="color:var(--red); font-size:0.7rem;">Failed to fetch history</p>';
      });
  }

  // Open Tracking Details Portal View
  function trackOrderDetails(orderId) {
    document.getElementById('authTitle').textContent = 'Tracking Portal';
    document.getElementById('profileContainer').style.display = 'none';
    
    var trackingPortalContainer = document.getElementById('trackingPortalContainer');
    trackingPortalContainer.style.display = 'flex';

    var trackingOrderId = document.getElementById('trackingOrderId');
    var trackingStatusLabel = document.getElementById('trackingStatusLabel');
    var trackingRecipient = document.getElementById('trackingRecipient');
    var trackingAddress = document.getElementById('trackingAddress');
    var trackingItemsList = document.getElementById('trackingItemsList');
    var trackingTotalCost = document.getElementById('trackingTotalCost');

    var trackingActiveBar = document.getElementById('trackingActiveBar');
    var nodeShipped = document.getElementById('nodeShipped');
    var nodeOut = document.getElementById('nodeOut');
    var nodeDelivered = document.getElementById('nodeDelivered');

    // Display loading states
    trackingOrderId.textContent = orderId;
    trackingStatusLabel.textContent = 'Loading...';
    trackingItemsList.innerHTML = '<div>Fetching coordinates...</div>';

    fetch('/api/orders/track/' + orderId)
      .then(function(res) {
        if (!res.ok) throw new Error('Tracking failed');
        return res.json();
      })
      .then(function(order) {
        trackingStatusLabel.textContent = order.status.replace(/_/g, ' ').toUpperCase();
        trackingRecipient.textContent = order.shipping_name;
        trackingAddress.textContent = order.shipping_address;
        trackingTotalCost.textContent = money(order.total);
        
        trackingItemsList.innerHTML = order.items.map(function(item) {
          return '<div>' + item.name + ' (' + item.size + ') &times; ' + item.quantity + '<span style="float:right;">' + money(item.price * item.quantity) + '</span></div>';
        }).join('');

        // Stepper Progress Calculations: Placed -> Forged -> En Route -> Delivered
        var status = order.status.toLowerCase();
        
        // Reset nodes
        nodeShipped.style.background = 'var(--hair2)';
        nodeShipped.style.outline = 'none';
        nodeShipped.querySelector('span').style.color = 'var(--dim2)';
        
        nodeOut.style.background = 'var(--hair2)';
        nodeOut.style.outline = 'none';
        nodeOut.querySelector('span').style.color = 'var(--dim2)';
        
        nodeDelivered.style.background = 'var(--hair2)';
        nodeDelivered.style.outline = 'none';
        nodeDelivered.querySelector('span').style.color = 'var(--dim2)';

        if (status === 'paid' || status === 'pending') {
          trackingActiveBar.style.width = '0%';
        } else if (status === 'shipped') {
          trackingActiveBar.style.width = '33%';
          nodeShipped.style.background = 'var(--red)';
          nodeShipped.style.outline = '4px solid rgba(225,6,0,0.15)';
          nodeShipped.querySelector('span').style.color = 'var(--bone)';
        } else if (status === 'out_for_delivery') {
          trackingActiveBar.style.width = '66%';
          nodeShipped.style.background = 'var(--red)';
          nodeShipped.querySelector('span').style.color = 'var(--bone)';
          
          nodeOut.style.background = 'var(--red)';
          nodeOut.style.outline = '4px solid rgba(225,6,0,0.15)';
          nodeOut.querySelector('span').style.color = 'var(--bone)';
        } else if (status === 'delivered') {
          trackingActiveBar.style.width = '100%';
          nodeShipped.style.background = 'var(--red)';
          nodeShipped.querySelector('span').style.color = 'var(--bone)';
          
          nodeOut.style.background = 'var(--red)';
          nodeOut.querySelector('span').style.color = 'var(--bone)';
          
          nodeDelivered.style.background = 'var(--red)';
          nodeDelivered.style.outline = '4px solid rgba(225,6,0,0.15)';
          nodeDelivered.querySelector('span').style.color = 'var(--bone)';
        }
      })
      .catch(function(err) {
        trackingStatusLabel.textContent = 'ERROR';
        trackingItemsList.innerHTML = '<div style="color:var(--red);">' + err.message + '</div>';
      });
  }

  // Click handler delegation for order history items
  document.getElementById('profileOrdersList').addEventListener('click', function(e) {
    var card = e.target.closest('.order-card-link');
    if (!card) return;
    var orderId = card.getAttribute('data-order-id');
    trackOrderDetails(orderId);
  });

  // Back button in tracking portal
  document.getElementById('backToProfileBtn').addEventListener('click', function() {
    document.getElementById('trackingPortalContainer').style.display = 'none';
    document.getElementById('profileContainer').style.display = 'flex';
    document.getElementById('authTitle').textContent = 'Wear The Mark';
  });

  /* ---------- ADMIN DRAWER HANDLERS & APIS ---------- */
  var adminDrawer = document.getElementById('adminDrawer');
  var adminPortalBtn = document.getElementById('adminPortalBtn');
  var adminClose = document.getElementById('adminClose');

  function openAdmin() {
    adminDrawer.classList.add('open');
    overlay.classList.add('open');
    document.body.classList.add('lock');
    fetchAdminStats();
  }

  function closeAdmin() {
    adminDrawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.classList.remove('lock');
  }

  adminPortalBtn.addEventListener('click', function(e) {
    e.preventDefault();
    closeCart();
    closeAuth();
    openAdmin();
  });

  adminClose.addEventListener('click', closeAdmin);

  // Extend overlay click listener to close admin drawer too
  overlay.addEventListener('click', function() {
    closeCart();
    closeAuth();
    closeAdmin();
  });

  function fetchAdminStats() {
    var invList = document.getElementById('adminInventoryList');
    var orderList = document.getElementById('adminOrdersList');
    
    invList.innerHTML = '<div style="font-size:0.75rem; color:var(--dim2);">Querying database inventory catalog...</div>';
    orderList.innerHTML = '<div style="font-size:0.75rem; color:var(--dim2);">Querying database orders registry...</div>';

    fetch('/api/admin/stats')
      .then(function(res) {
        if (!res.ok) throw new Error('Failed to load admin stats');
        return res.json();
      })
      .then(function(data) {
        document.getElementById('adminRevenue').textContent = money(data.totalSales);
        document.getElementById('adminOrdersCount').textContent = data.totalOrders;

        // Render inventory Restock Console list
        invList.innerHTML = data.products.map(function(p) {
          return '<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(236,232,225,.01); border:1px solid var(--hair2); border-radius:12px; padding:12px; gap: 10px;">'+
            '<div style="font-size:0.75rem; min-width: 0; flex: 1;">'+
              '<div style="font-weight:600; color:var(--bone); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-bottom:2px;">'+p.name+'</div>'+
              '<div style="font-size:0.68rem; color:var(--dim2);">Stock: <span id="stock-val-'+p.id+'" style="color:var(--bone); font-weight:600;">'+p.stock+'</span></div>'+
            '</div>'+
            '<div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">'+
              '<input type="number" id="input-stock-'+p.id+'" value="'+p.stock+'" style="width:56px; background:var(--ink); border:1px solid var(--hair2); border-radius:8px; color:var(--bone); padding:6px; font-size:0.75rem; text-align:center; outline:none;">'+
              '<button class="foot-chip" onclick="restockProduct(\''+p.id+'\')" style="font-size:0.65rem; height:32px; padding:0 12px; margin:0; border-radius:8px;">Update</button>'+
            '</div>'+
          '</div>';
        }).join('');

        // Render orders manifest status overrides list
        if (data.orders.length === 0) {
          orderList.innerHTML = '<p style="font-style:italic; font-family:var(--serif); font-size:0.75rem;">No orders registered in the system database.</p>';
          return;
        }
        orderList.innerHTML = data.orders.map(function(o) {
          var statuses = ['pending', 'paid', 'shipped', 'out_for_delivery', 'delivered'];
          var selectHtml = '<select onchange="overrideOrderStatus(\''+o.id+'\', this.value)" style="background:var(--ink); border:1px solid var(--hair2); border-radius:8px; color:var(--bone); font-size:0.7rem; padding:6px 10px; outline:none; cursor:pointer;">' +
            statuses.map(function(s) {
              return '<option value="'+s+'"'+(o.status===s?' selected':'')+'>'+s.replace(/_/g, ' ').toUpperCase()+'</option>';
            }).join('') +
            '</select>';

          return '<div style="background:rgba(236,232,225,.02); border:1px solid var(--hair2); border-radius:12px; padding:12px; display:flex; justify-content:space-between; align-items:center; gap: 10px;">'+
            '<div style="font-size:0.72rem; min-width: 0; flex: 1;">'+
              '<div style="font-weight:600; color:var(--bone); font-family:monospace; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-bottom:2px;">'+o.id+'</div>'+
              '<div style="font-size:0.68rem; color:var(--dim2);">Recipient: '+o.shipping_name+' &middot; '+money(o.total)+'</div>'+
            '</div>'+
            '<div style="flex-shrink:0;">'+selectHtml+'</div>'+
          '</div>';
        }).join('');
      })
      .catch(function(err) {
        fly(err.message);
      });
  }

  // Global functions attached to window context
  window.restockProduct = function(productId) {
    var input = document.getElementById('input-stock-' + productId);
    var val = parseInt(input.value);
    if (isNaN(val) || val < 0) {
      fly('Invalid stock coordinates');
      return;
    }
    fetch('/api/admin/restock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: productId, newStock: val })
    })
    .then(function(res) {
      if (!res.ok) throw new Error('Restock request failed');
      return res.json();
    })
    .then(function() {
      document.getElementById('stock-val-' + productId).textContent = val;
      fly('Stock updated successfully');
      // Reload products grid to update stock status in store view
      loadCatalog();
    })
    .catch(function(err) {
      fly(err.message);
    });
  };

  window.overrideOrderStatus = function(orderId, status) {
    fetch('/api/admin/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: orderId, status: status })
    })
    .then(function(res) {
      if (!res.ok) throw new Error('Status override request failed');
      return res.json();
    })
    .then(function() {
      fly('Order status overridden to: ' + status.replace(/_/g, ' ').toUpperCase());
      // Refresh order history inside profile panel if logged in
      if (typeof fetchMyOrders === 'function') {
        fetchMyOrders();
      }
    })
    .catch(function(err) {
      fly(err.message);
    });
  };

  // Session Check on Load
  function checkSession() {
    fetch('/api/auth/me')
      .then(function(res) {
        if (!res.ok) throw new Error('No session');
        return res.json();
      })
      .then(function(user) {
        currentUser = user;
        updateAuthUI();
      })
      .catch(function(err) {
        currentUser = null;
        updateAuthUI();
      });
  }
  
  // Login Submit
  document.getElementById('submitLoginBtn').addEventListener('click', function() {
    var email = document.getElementById('loginEmail').value;
    var password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
      fly('Email and password required');
      return;
    }
    
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    })
    .then(function(res) {
      return res.json().then(function(data) {
        if (!res.ok) throw new Error(data.error || 'Login failed');
        return data;
      });
    })
    .then(function(user) {
      currentUser = user;
      updateAuthUI();
      fly('Welcome back, ' + user.full_name);
      closeAuth();
    })
    .catch(function(err) {
      fly(err.message);
    });
  });

  // Register Submit
  document.getElementById('submitRegisterBtn').addEventListener('click', function() {
    var name = document.getElementById('registerName').value;
    var email = document.getElementById('registerEmail').value;
    var password = document.getElementById('registerPassword').value;
    
    if (!name || !email || !password) {
      fly('All fields are required');
      return;
    }
    
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: name, email: email, password: password })
    })
    .then(function(res) {
      return res.json().then(function(data) {
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        return data;
      });
    })
    .then(function(user) {
      currentUser = user;
      updateAuthUI();
      fly('Mark claimed! Initiation complete.');
      closeAuth();
    })
    .catch(function(err) {
      fly(err.message);
    });
  });

  // Save Shipping Coordinates
  document.getElementById('saveAddressBtn').addEventListener('click', function() {
    var address = document.getElementById('profileAddress').value;
    if (!currentUser) return;
    
    fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: currentUser.full_name, shipping_address: address })
    })
    .then(function(res) {
      return res.json().then(function(data) {
        if (!res.ok) throw new Error(data.error || 'Failed to update coordinates');
        return data;
      });
    })
    .then(function(user) {
      currentUser = user;
      fly('Coordinates saved');
    })
    .catch(function(err) {
      fly(err.message);
    });
  });

  // Settings Panel Toggle
  var toggleSettingsBtn = document.getElementById('toggleSettingsBtn');
  var settingsPanel = document.getElementById('settingsPanel');
  if (toggleSettingsBtn && settingsPanel) {
    toggleSettingsBtn.addEventListener('click', function() {
      var isHidden = settingsPanel.style.display === 'none';
      settingsPanel.style.display = isHidden ? 'flex' : 'none';
      if (isHidden && currentUser) {
        document.getElementById('updateNameInput').value = currentUser.full_name;
      }
    });
  }

  // Profile Name Update Submit
  var submitProfileUpdateBtn = document.getElementById('submitProfileUpdateBtn');
  if (submitProfileUpdateBtn) {
    submitProfileUpdateBtn.addEventListener('click', function() {
      var newName = document.getElementById('updateNameInput').value.trim();
      var address = document.getElementById('profileAddress').value;
      if (!newName) {
        fly('Name is required');
        return;
      }
      
      submitProfileUpdateBtn.disabled = true;
      submitProfileUpdateBtn.textContent = 'Updating...';
      
      fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: newName, shipping_address: address })
      })
      .then(function(res) {
        return res.json().then(function(data) {
          if (!res.ok) throw new Error(data.error || 'Failed to update profile');
          return data;
        });
      })
      .then(function(user) {
        currentUser = user;
        updateAuthUI();
        fly('Profile updated successfully');
        settingsPanel.style.display = 'none';
      })
      .catch(function(err) {
        fly(err.message);
      })
      .finally(function() {
        submitProfileUpdateBtn.disabled = false;
        submitProfileUpdateBtn.textContent = 'Update Profile Name';
      });
    });
  }

  // Password Update Submit
  var submitPasswordUpdateBtn = document.getElementById('submitPasswordUpdateBtn');
  if (submitPasswordUpdateBtn) {
    submitPasswordUpdateBtn.addEventListener('click', function() {
      var curPass = document.getElementById('updateCurrentPassword').value;
      var newPass = document.getElementById('updateNewPassword').value;
      if (!curPass || !newPass) {
        fly('Current and new passwords are required.');
        return;
      }
      
      submitPasswordUpdateBtn.disabled = true;
      submitPasswordUpdateBtn.textContent = 'Changing...';
      
      fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: curPass, new_password: newPass })
      })
      .then(function(res) {
        return res.json().then(function(data) {
          if (!res.ok) throw new Error(data.error || 'Failed to update password');
          return data;
        });
      })
      .then(function(data) {
        fly('Password updated successfully!');
        document.getElementById('updateCurrentPassword').value = '';
        document.getElementById('updateNewPassword').value = '';
        settingsPanel.style.display = 'none';
      })
      .catch(function(err) {
        fly(err.message);
      })
      .finally(function() {
        submitPasswordUpdateBtn.disabled = false;
        submitPasswordUpdateBtn.textContent = 'Change Password';
      });
    });
  }

  // Logout Submit
  document.getElementById('logoutBtn').addEventListener('click', function() {
    fetch('/api/auth/logout', { method: 'POST' })
      .then(function() {
        currentUser = null;
        updateAuthUI();
        fly('Initiation cleared. Logged out.');
        closeAuth();
      });
  });

  // Run session check
  checkSession();

  addEventListener('keydown', function(e){ if(e.key==='Escape') { closeCart(); closeAuth(); } });
  renderCart();

  /* ---------- links: nothing ever leaves this page ----------
     Every anchor is intercepted; in-page targets are reached with a manual
     smooth scroll and the URL hash is never touched, so nothing can look
     like a redirect (important inside an embedded/iframe preview). */
  function smoothTo(y){ try{ scrollTo({top:y,behavior:reduced?'auto':'smooth'}); }catch(_){ scrollTo(0,y); } }
  function scrollToId(id){
    var t=document.getElementById(id);
    if(!t) return;
    navHold=Date.now()+1400; nav.classList.remove('hidden');
    var y=t.getBoundingClientRect().top+scrollY-70;
    smoothTo(Math.max(0,y));
  }
  function handleNav(el){
    if(el.hasAttribute('data-top')){ smoothTo(0); return true; }
    if(el.hasAttribute('data-nolink')){ fly('Coming with Drop 001'); return true; }
    var sc=el.getAttribute('data-scroll'); if(sc){ scrollToId(sc); return true; }
    return false;
  }
  document.addEventListener('click', function(e){
    var el = e.target.closest('[data-scroll],[data-nolink],[data-top]');
    if(el){ e.preventDefault(); handleNav(el); return; }
    var a = e.target.closest('a');            // safety net: any stray anchor
    if(a){ e.preventDefault(); }
  });
  document.addEventListener('keydown', function(e){
    if(e.key!=='Enter' && e.key!==' ' && e.key!=='Spacebar') return;
    var el = e.target.closest('[data-scroll],[data-nolink],[data-top]');
    if(el){ e.preventDefault(); handleNav(el); }
  });
  var searchBtn=document.querySelector('.search-btn');
  if(searchBtn) searchBtn.addEventListener('click', function(){ fly('Search lands with Drop 001'); });
  var footIg=document.getElementById('footIg');
  if(footIg) footIg.addEventListener('click', function(){ fly('Instagram coming with Drop 001'); });
  var trackBtn=document.getElementById('trackBtn');
  if(trackBtn) trackBtn.addEventListener('click', function(){ fly('Order tracking opens with Drop 001'); });
  var miniMap=document.getElementById('miniMap');
  if(miniMap) miniMap.addEventListener('click', function(){ fly('Map is a preview for now'); });

  /* ---------- mobile menu ---------- */
  var mm = document.getElementById('mobileMenu');
  document.getElementById('burger').addEventListener('click', function(){ mm.classList.add('open'); document.body.classList.add('lock'); });
  document.getElementById('mmClose').addEventListener('click', function(){ mm.classList.remove('open'); document.body.classList.remove('lock'); });
  mm.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ mm.classList.remove('open'); document.body.classList.remove('lock'); }); });
  // (navigation itself is handled by the global interceptor above; no hash change)

  /* ---------- hero letters ---------- */
  document.querySelectorAll('#heroTitle .row').forEach(function(row, ri){
    row.getAttribute('data-text').split('').forEach(function(ch, ci){
      var s = document.createElement('span'); s.className='ch'; s.textContent=ch;
      s.style.animationDelay = (0.12 + ri*0.13 + ci*0.035) + 's'; row.appendChild(s);
    });
  });

  /* ---------- embers ---------- */
  var cv = document.getElementById('embers');
  if(cv && !reduced){
    var ctx = cv.getContext('2d'), parts=[], W,H, DPR=Math.min(devicePixelRatio||1,2);
    function size(){ var hd=document.querySelector('header'); W=hd.clientWidth; H=hd.clientHeight; cv.width=W*DPR; cv.height=H*DPR; ctx.setTransform(DPR,0,0,DPR,0,0); }
    function seed(){ parts=[]; var n=Math.min(44,Math.floor(W/28)); for(var i=0;i<n;i++) parts.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.8+.5,s:Math.random()*.35+.12,d:Math.random()*.4-.2,a:Math.random()*.5+.2,t:Math.random()*6}); }
    var emberOn=true;
    new IntersectionObserver(function(es){ emberOn=es[0].isIntersecting; },{threshold:0}).observe(document.querySelector('header'));
    ctx.shadowColor='rgba(225,6,0,.55)'; function loop(){ if(!emberOn||document.hidden){ requestAnimationFrame(loop); return; } ctx.clearRect(0,0,W,H); ctx.shadowBlur=6; for(var i=0;i<parts.length;i++){ var p=parts[i]; p.y-=p.s; p.x+=Math.sin((p.t+=0.01))*0.2+p.d*0.3; if(p.y<-6){p.y=H+6;p.x=Math.random()*W;} var fl=0.6+Math.sin(p.t*3)*0.4; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.28); ctx.fillStyle='rgba(225,'+Math.floor(20+fl*40)+',0,'+(p.a*fl)+')'; ctx.fill(); } requestAnimationFrame(loop); }
    size(); seed(); loop(); addEventListener('resize', function(){ size(); seed(); });
  }

  /* ---------- nav ---------- */
  var nav = document.getElementById('nav'), navTick=false, lastY=scrollY, navHold=0;
  addEventListener('scroll', function(){ if(navTick) return; navTick=true; requestAnimationFrame(function(){
    var y=scrollY;
    nav.classList.toggle('scrolled', y>40);
    if(!document.body.classList.contains('lock')){
      if(y>lastY+6 && y>260 && Date.now()>navHold) nav.classList.add('hidden');
      else if(y<lastY-6 || y<=260) nav.classList.remove('hidden');
    }
    lastY=y; navTick=false;
  }); }, {passive:true});

  /* ---------- reveal ---------- */
  var io = new IntersectionObserver(function(es){ var i=0; es.forEach(function(e){ if(e.isIntersecting){ e.target.style.setProperty('--rd', (Math.min(i++,5)*80)+'ms'); e.target.classList.add('in'); io.unobserve(e.target); } }); }, {threshold:.12, rootMargin:'0px 0px -6% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  /* ---------- thread ---------- */
  var threadSvg=document.getElementById('thread'), line=document.getElementById('threadLine'), ghost=document.getElementById('threadGhost'), bloom=document.getElementById('threadBloom'), flow=document.getElementById('threadFlow'), tip=document.getElementById('threadTip'), tipGlow=document.getElementById('threadTipGlow');
  var total=0, drawn=0, flowOff=0;
  var siteFoot=document.querySelector('footer');
  function buildThread(){
    threadSvg.style.height='0px';
    threadSvg.setAttribute('height','0');
    var Ht=Math.ceil(siteFoot.getBoundingClientRect().bottom+scrollY), Wt=innerWidth;
    threadSvg.setAttribute('width',Wt); threadSvg.setAttribute('height',Ht); threadSvg.setAttribute('viewBox','0 0 '+Wt+' '+Ht); threadSvg.style.height=Ht+'px';
    // gentle weave: stay well inside the viewport so the line reads as a
    // continuous spine that flows THROUGH every section (incl. The Mark) to the footer.
    var cx=Wt/2, amp=Math.min(Wt*0.20, 260);
    var lx=cx-amp, rx=cx+amp;
    var header=document.querySelector('header');
    var hr=header.getBoundingClientRect();
    var pts=[[cx,(hr.top+scrollY)+hr.height*0.86]];
    document.querySelectorAll('[data-thread]').forEach(function(el){
      var side=el.getAttribute('data-thread'), r=el.getBoundingClientRect(), y=r.top+scrollY, h=r.height;
      if(side==='end'){
        var node=document.getElementById('footNode');
        var ny, ncx=cx;
        if(node){ var nb=node.getBoundingClientRect(); ny=nb.top+scrollY+nb.height/2; ncx=nb.left+nb.width/2; }
        else { ny=y+Math.min(h*0.5,120); }
        // approach, then trace a small loop around the node (line "circles" it)
        pts.push([ncx, ny-70]);
        var R=26;
        pts.push([ncx,        ny-R]);
        pts.push([ncx+R*0.92,  ny]);
        pts.push([ncx,        ny+R]);
        pts.push([ncx-R*0.92,  ny]);
        pts.push([ncx,        ny-R*0.6]);
      }
      else if(side==='left'){ pts.push([lx,y+h*0.32]); pts.push([cx,y+h*0.72]); }   // 2 nodes so tall shop section flows
      else if(side==='right'){ pts.push([rx,y+h*0.42]); pts.push([cx,y+h*0.86]); }  // pass THROUGH the mark section, don't stop
      else { pts.push([cx,y+h*0.5]); }
    });
    if(pts.length<2){ requestAnimationFrame(function(){}); return; }
    // Catmull-Rom -> cubic bezier for a smooth, natural, continuous curve
    function d3(a){ return Math.round(a*10)/10; }
    var d='M '+d3(pts[0][0])+' '+d3(pts[0][1]);
    for(var i=0;i<pts.length-1;i++){
      var p0=pts[i-1]||pts[i], p1=pts[i], p2=pts[i+1], p3=pts[i+2]||p2;
      var c1x=p1[0]+(p2[0]-p0[0])/6, c1y=p1[1]+(p2[1]-p0[1])/6;
      var c2x=p2[0]-(p3[0]-p1[0])/6, c2y=p2[1]-(p3[1]-p1[1])/6;
      d+=' C '+d3(c1x)+' '+d3(c1y)+', '+d3(c2x)+' '+d3(c2y)+', '+d3(p2[0])+' '+d3(p2[1]);
    }
    line.setAttribute('d',d); ghost.setAttribute('d',d); bloom.setAttribute('d',d); flow.setAttribute('d',d);
    total=line.getTotalLength();
    line.style.strokeDasharray=total; line.style.strokeDashoffset=total-drawn;
    bloom.style.strokeDasharray=total; bloom.style.strokeDashoffset=total-drawn;
  }
  function threadTarget(){ var doc=document.documentElement, max=doc.scrollHeight-innerHeight; var p=max>0?Math.min(1,Math.max(0,(scrollY+innerHeight*0.22)/(max+innerHeight*0.22))):1; return total*p; }
  var FLOWLEN=150, lastTipY=-1, flowTick=0;
  function tickThread(){
    var target=threadTarget();
    var moving=Math.abs(target-drawn)>=0.5;
    drawn+=(target-drawn)*(reduced?1:0.09);
    if(!moving) drawn=target;
    var tipVisible = lastTipY<0 || (lastTipY>scrollY-260 && lastTipY<scrollY+innerHeight+260);
    // Only touch the full-height thread SVG when it needs to change: while the
    // draw is catching up (moving) or while the glowing tip/flow is on screen.
    if(total>0 && (moving || (tipVisible && !reduced))){
      var off=Math.max(0,total-drawn); line.style.strokeDashoffset=off; bloom.style.strokeDashoffset=off;
      var dd=Math.min(drawn,total);
      var pt=line.getPointAtLength(dd);
      lastTipY=pt.y;
      tip.setAttribute('cx',pt.x); tip.setAttribute('cy',pt.y);
      tipGlow.setAttribute('cx',pt.x); tipGlow.setAttribute('cy',pt.y);
      if(!reduced && dd>40 && tipVisible){
        flowTick=(flowTick+1)&1;               // throttle flow to ~30fps
        if(flowTick===0){
          flowOff=(flowOff+4.4)%(FLOWLEN*2);
          flow.style.strokeDasharray=(FLOWLEN*0.5)+' '+(FLOWLEN*1.5);
          flow.style.strokeDashoffset=(total-dd)+flowOff;
          flow.style.opacity='.9';
        }
      } else { flow.style.opacity='0'; }
    }
    requestAnimationFrame(tickThread);
  }
  var rsz; addEventListener('resize', function(){ clearTimeout(rsz); rsz=setTimeout(buildThread,160); }, {passive:true});
  addEventListener('load', buildThread); if(document.fonts&&document.fonts.ready) document.fonts.ready.then(buildThread);
  buildThread(); requestAnimationFrame(tickThread);

  /* ---------- cards: cloth rotates on hover (fine) and tap (touch) ---------- */
  var cards = [];
  function initCards() {
    cards = document.querySelectorAll('.card');
    if(!fine && !reduced){
      // touch devices: a subtle one-time rotate hint as each card appears,
      // so users discover the garment spins, then tap toggles the full spin.
      var hintIO=new IntersectionObserver(function(es){
        es.forEach(function(e){
          if(e.isIntersecting){
            var sp=e.target.querySelector('.spin');
            if(sp){ sp.style.animation='hintSpin 1.5s cubic-bezier(.4,0,.2,1) both'; sp.addEventListener('animationend',function h(){ sp.style.animation=''; sp.removeEventListener('animationend',h); }); }
            hintIO.unobserve(e.target);
          }
        });
      },{threshold:.55});
      cards.forEach(function(c){ hintIO.observe(c); });
    }
    cards.forEach(function(card){
      function toggle(){ var was=card.classList.contains('popped'); cards.forEach(function(c){ c.classList.remove('popped'); var s=c.querySelector('.spin'); if(s) s.style.animation=''; }); if(!was){ card.classList.add('popped'); var sp=card.querySelector('.spin'); if(sp) sp.style.animation=''; } }
      card.addEventListener('click', function(e){ if(e.target.closest('.add')||e.target.closest('.size')) return; if(!fine) toggle(); });
      card.addEventListener('keydown', function(e){ if(e.key==='Enter'){ if(e.target.closest('.add,.size')) return; e.preventDefault(); toggle(); } });
    });
  }
  addEventListener('keydown', function(e){ if(e.key==='Escape') cards.forEach(function(c){ c.classList.remove('popped'); }); });

  /* ---------- category filter ---------- */
  var catBtns=document.querySelectorAll('.cat'), emptyEl=document.getElementById('empty');
  catBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      catBtns.forEach(function(b){ b.classList.remove('on'); }); btn.classList.add('on');
      var cat=btn.getAttribute('data-cat'), shown=0;
      cards.forEach(function(card){
        card.classList.remove('popped','fly');
        var match=(cat==='all')||(card.getAttribute('data-cat')===cat);
        if(match){ card.classList.remove('hide'); void card.offsetWidth; card.style.animationDelay=(shown*70)+'ms'; card.classList.add('fly'); shown++; }
        else card.classList.add('hide');
      });
      emptyEl.style.display=shown?'none':'block';
      setTimeout(buildThread,620);
    });
  });

  /* ---------- hero parallax ---------- */
  var heroEl=document.querySelector('header'), heroMark=document.querySelector('.hero-mark'), heroGlow=document.querySelector('.hero-glow'), heroInner=document.querySelector('.hero-inner');
  var heroVis=true, mx=0, my=0, tmx=0, tmy=0;
  new IntersectionObserver(function(es){ heroVis=es[0].isIntersecting; },{threshold:0}).observe(heroEl);
  if(fine && !reduced){
    heroEl.addEventListener('pointermove', function(e){
      var r=heroEl.getBoundingClientRect();
      tmx=((e.clientX-r.left)/r.width-.5)*2; tmy=((e.clientY-r.top)/r.height-.5)*2;
    }, {passive:true});
    heroEl.addEventListener('pointerleave', function(){ tmx=0; tmy=0; }, {passive:true});
  }
  if(!reduced){
    var lastY=-1, settled=false;
    (function heroLoop(){
      if(heroVis){
        var y=scrollY, hh=heroEl.offsetHeight||1, p=Math.min(1, y/hh);
        var pdx=tmx-mx, pdy=tmy-my;
        mx+=pdx*.06; my+=pdy*.06;
        // only touch the DOM when scroll moved or the pointer lerp is still settling
        var pointerActive=Math.abs(pdx)>0.001||Math.abs(pdy)>0.001;
        if(y!==lastY || pointerActive || !settled){
          heroMark.style.marginLeft=(mx*16)+'px';
          heroMark.style.marginTop=(y*.16 + my*12 - 8)+'px';
          heroGlow.style.marginTop=(y*.10)+'px';
          heroInner.style.transform='translateY('+(y*.22)+'px)';
          heroInner.style.opacity=Math.max(0, 1 - p*1.15);
          lastY=y; settled=!pointerActive && y===lastY;
        }
      }
      requestAnimationFrame(heroLoop);
    })();
  }

  /* ---------- magnetic buttons ---------- */
  if(fine && !reduced){
    document.querySelectorAll('.btn, .checkout').forEach(function(b){
      b.addEventListener('pointermove', function(e){
        var r=b.getBoundingClientRect();
        var dx=(e.clientX-r.left-r.width/2)/(r.width/2), dy=(e.clientY-r.top-r.height/2)/(r.height/2);
        b.style.transform='translate('+(dx*5)+'px,'+(dy*4)+'px)';
      }, {passive:true});
      b.addEventListener('pointerleave', function(){ b.style.transform=''; }, {passive:true});
    });
  }

  /* ---------- card 3D tilt ---------- */
  if(fine && !reduced){
    grid.addEventListener('pointermove', function(e){
      var card=e.target.closest('.card'); if(!card) return;
      var r=card.getBoundingClientRect();
      var px=(e.clientX-r.left)/r.width-.5, py=(e.clientY-r.top)/r.height-.5;
      card.classList.add('tilting');
      card.style.setProperty('--ry',(px*7)+'deg');
      card.style.setProperty('--rx',(-py*6)+'deg');
    }, {passive:true});
    grid.addEventListener('pointerout', function(e){
      var card=e.target.closest('.card'); if(!card || card.contains(e.relatedTarget)) return;
      card.classList.remove('tilting');
      card.style.setProperty('--ry','0deg'); card.style.setProperty('--rx','0deg');
    }, {passive:true});
  }

  /* ---------- marquees pause offscreen ---------- */
  var mio=new IntersectionObserver(function(es){ es.forEach(function(e){ e.target.classList.toggle('paused', !e.isIntersecting); }); },{threshold:0});
  document.querySelectorAll('.marquee').forEach(function(m){ mio.observe(m); });

  /* ---------- toast ---------- */
  var toast=document.getElementById('toast'), toastMsg=document.getElementById('toastMsg'), toastT;
  function fly(msg){ toastMsg.textContent=msg; toast.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(function(){ toast.classList.remove('show'); },2200); }

  /* ---------- notify ---------- */
  var box=document.getElementById('notifyBox');
  document.getElementById('notifyBtn').addEventListener('click', function(){ var input=box.querySelector('input'); if(input.value&&input.value.indexOf('@')>0){ fly('You are on the list'); input.value=''; } else input.focus(); });

  /* ---------- adaptive quality guard ---------- */
  if(!reduced){
    var qFrames=0, qStart=0;
    function qProbe(t){
      if(!qStart){ qStart=t; requestAnimationFrame(qProbe); return; }
      qFrames++;
      if(t-qStart < 1400){ requestAnimationFrame(qProbe); return; }
      var qfps = qFrames/((t-qStart)/1000);
      if(qfps < 34){ document.body.classList.add('lite'); }   // conservative: real GPU devices sail past this
    }
    requestAnimationFrame(qProbe);
  }

  /* ---------- countdown ---------- */
  var dropAt=Date.now()+14*86400e3+8*3600e3+42*60e3;
  function pad(n){ return String(n).padStart(2,'0'); }
  function setCd(id,v){ var el=document.getElementById(id); if(el.textContent!==v){ el.textContent=v; if(!reduced){ el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); } } }
  function cd(){ var s=Math.max(0,Math.floor((dropAt-Date.now())/1000)); setCd('cd-d',pad(Math.floor(s/86400))); setCd('cd-h',pad(Math.floor(s%86400/3600))); setCd('cd-m',pad(Math.floor(s%3600/60))); setCd('cd-s',pad(s%60)); }
  cd(); setInterval(cd,1000);
})();