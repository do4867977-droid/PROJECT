const PRICE = 130000;
const USE_BACKEND = true;
const BACKEND_URL = ''; // Deja vacío para usar el mismo origen, o pon la URL de tu backend público
const IMAGE_FOLDER = 'src/images/';

let currentProduct = null;
let allProducts = [];
let currentProducts = [];
let activeBrand = 'all';

async function loadProducts() {
  const res = await fetch('data/products.json');
  const products = await res.json();
  try {
    const custom = JSON.parse(localStorage.getItem('products_custom') || '{}');
    return products.map(p => (custom[p.sku] ? { ...p, ...custom[p.sku] } : p));
  } catch {
    return products;
  }
}

function formatCurrency(v) {
  return new Intl.NumberFormat('es-CO').format(v) + ' $COP';
}

function productImage(p) {
  const src = p.image || '';
  if (!src || src.startsWith('data:') || src.startsWith('http') || src.startsWith('src/')) return src;
  return IMAGE_FOLDER + src;
}

function stockQty(p, size) {
  return (p.stock && p.stock[size]) || 0;
}

function sizePill(p, size) {
  const qty = stockQty(p, size);
  const cls = qty > 0 ? 'size-pill' : 'size-pill out';
  const label = qty === 0 ? `${size} • ${qty} (agotado)` : `${size} • ${qty}`;
  return `<div class="${cls}" title="Stock: ${qty}">${label}</div>`;
}

function createCard(p) {
  const card = document.createElement('article');
  card.className = 'card';
  const imagePath = productImage(p);
  const img = imagePath
    ? `<img class="product-img" src="${imagePath}" alt="${p.name}"/>`
    : `<div class="thumb">${p.name}</div>`;

  card.innerHTML = `
    ${img}
    <div class="meta">
      <div>
        <div class="title">${p.name}</div>
        <div class="sku">${p.sku} • ${p.brand}</div>
        <div class="detail-pill">${p.colors[0] || 'Original'}</div>
      </div>
      <div class="price">${formatCurrency(PRICE)}</div>
    </div>
    <div class="variants">${p.sizes.map(s => sizePill(p, s)).join('')}</div>
    <div class="action-row">
      <button class="btn btn-primary" data-sku="${p.sku}">Reservar</button>
      <button class="btn btn-outline" data-sku="${p.sku}">Detalles</button>
    </div>
  `;
  return card;
}

function setModalOpen(id, open) {
  document.getElementById(id).setAttribute('aria-hidden', open ? 'false' : 'true');
}

function resetReserveModal() {
  document.getElementById('reserveForm').reset();
  currentProduct = null;
}

function bindCatalog(products) {
  const catalog = document.getElementById('catalog');
  catalog.innerHTML = '';
  products.forEach(p => catalog.appendChild(createCard(p)));
}

function showDetails(p) {
  setModalOpen('detailsModal', true);
  document.getElementById('detailsTitle').textContent = p.name;
  document.getElementById('detailsSku').textContent = p.sku;
  document.getElementById('detailsBrand').textContent = p.brand;
  document.getElementById('detailsPrice').textContent = formatCurrency(PRICE);

  const img = document.getElementById('detailsImage');
  img.src = productImage(p);
  img.alt = p.name;

  const sizesWrap = document.getElementById('detailsSizes');
  sizesWrap.innerHTML = '';
  (p.sizes || []).forEach(s => {
    const div = document.createElement('div');
    const qty = stockQty(p, s);
    div.className = 'size-pill' + (qty > 0 ? '' : ' out');
    div.textContent = `${s} • ${qty}`;
    sizesWrap.appendChild(div);
  });

  document.getElementById('btnReserveFromDetails').onclick = () => {
    setModalOpen('detailsModal', false);
    openReservation(p);
  };
}

function openReservation(p) {
  currentProduct = p;
  document.getElementById('productName').value = p.name;
  document.getElementById('productSku').value = p.sku;

  const sizeSel = document.getElementById('size');
  sizeSel.innerHTML = '';
  p.sizes.forEach(s => {
    const qty = stockQty(p, s);
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = qty === 0 ? `${s} • Agotado` : s;
    opt.disabled = qty === 0;
    sizeSel.appendChild(opt);
  });

  const colorSel = document.getElementById('color');
  colorSel.innerHTML = '';
  p.colors.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    colorSel.appendChild(opt);
  });

  document.getElementById('price').value = formatCurrency(PRICE);
  updatePreview();
  setModalOpen('reserveModal', true);
}

function updatePreview() {
  if (!currentProduct) return;
  const preview = document.getElementById('productPreview');
  preview.src = productImage(currentProduct);
  preview.alt = currentProduct.name;
}

function filterByBrand(brand) {
  activeBrand = brand;
  renderProducts();
  document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
}

const WOMPI_PAYMENT_URL = 'https://checkout.wompi.co/l/VPOS_LBTnN9';

async function parseJsonResponse(resp) {
  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      'El servidor no devolvió JSON. Revisa la URL del backend y la configuración del servidor.'
    );
  }
}

async function saveReservation(data) {
  if (USE_BACKEND) {
    const endpoint = (BACKEND_URL ? BACKEND_URL.replace(/\/$/, '') : '') + '/api/reservations';
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await parseJsonResponse(resp);
    if (!resp.ok) throw new Error(json.message || json.error || 'Error');
    return { id: json.id, paymentUrl: json.paymentUrl || WOMPI_PAYMENT_URL };
  }
  const list = JSON.parse(localStorage.getItem('reservas') || '[]');
  list.push(data);
  localStorage.setItem('reservas', JSON.stringify(list));
  return { id: data.id, paymentUrl: WOMPI_PAYMENT_URL };
}

function goToWompiCheckout(paymentUrl) {
  window.location.href = paymentUrl;
}

function exportReservationsCsv() {
  const rows = JSON.parse(localStorage.getItem('reservas') || '[]');
  if (!rows.length) {
    alert('No hay reservas');
    return;
  }
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(',')]
    .concat(rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')))
    .join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'reservas.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function seedListeners() {
  document.getElementById('closeModal').addEventListener('click', () => {
    setModalOpen('reserveModal', false);
    resetReserveModal();
  });
  document.getElementById('reserveModal').addEventListener('click', e => {
    if (e.target.id === 'reserveModal') {
      setModalOpen('reserveModal', false);
      resetReserveModal();
    }
  });
  document.getElementById('closeDetails').addEventListener('click', () => setModalOpen('detailsModal', false));
  document.getElementById('detailsModal').addEventListener('click', e => {
    if (e.target.id === 'detailsModal') setModalOpen('detailsModal', false);
  });

  document.querySelectorAll('.hero-cta').forEach(btn => {
    btn.addEventListener('click', () => filterByBrand(btn.dataset.brand));
  });

  document.getElementById('catalog').addEventListener('click', e => {
    const btn = e.target.closest('button[data-sku]');
    if (!btn) return;
    const product = currentProducts.find(x => x.sku === btn.dataset.sku);
    if (!product) return;
    if (btn.classList.contains('btn-primary')) openReservation(product);
    else showDetails(product);
  });

  document.getElementById('reserveForm').addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    data.price = PRICE;
    data.id = 'R-' + Date.now();
    data.created_at = new Date().toISOString();
    try {
      const { paymentUrl } = await saveReservation(data);
      setModalOpen('reserveModal', false);
      resetReserveModal();
      goToWompiCheckout(paymentUrl);
    } catch (err) {
      alert('Error guardando reserva: ' + err.message);
    }
  });

  document.getElementById('exportCsv').addEventListener('click', exportReservationsCsv);
}

function filterProducts(products) {
  return activeBrand === 'all' ? products : products.filter(p => p.brand === activeBrand);
}

function renderProducts() {
  currentProducts = filterProducts(allProducts);
  bindCatalog(currentProducts);
}

async function init() {
  seedListeners();
  allProducts = await loadProducts();
  renderProducts();
}

init();
