const IMAGE_FOLDER = 'src/images/';

async function fetchProducts() {
  const res = await fetch('data/products.json');
  return res.json();
}

function getCustom() {
  return JSON.parse(localStorage.getItem('products_custom') || '{}');
}

function setCustom(data) {
  localStorage.setItem('products_custom', JSON.stringify(data));
}

function productImage(src) {
  if (!src || src.startsWith('data:') || src.startsWith('http') || src.startsWith('src/')) return src;
  return IMAGE_FOLDER + src;
}

function renderList(products) {
  const container = document.getElementById('productsList');
  const custom = getCustom();
  container.innerHTML = '';

  products.forEach(p => {
    const item = document.createElement('div');
    item.className = 'admin-item';

    const img = document.createElement('img');
    img.className = 'admin-thumb';
    img.src = productImage((custom[p.sku] && custom[p.sku].image) || p.image);

    const title = document.createElement('div');
    title.innerHTML = `<strong>${p.name}</strong><div class="sku">${p.sku} • ${p.brand}</div>`;

    const row = document.createElement('div');
    row.className = 'admin-row';
    row.append(img, title);

    const btn = document.createElement('button');
    btn.textContent = 'Editar';
    btn.className = 'btn btn-outline';
    btn.addEventListener('click', () => openEditor(p));

    item.append(row, btn);
    container.appendChild(item);
  });
}

function openEditor(p) {
  const editor = document.getElementById('editor');
  editor.style.display = 'block';
  editor.dataset.sku = p.sku;
  document.getElementById('editTitle').textContent = `Editar ${p.name} (${p.sku})`;

  const custom = getCustom();
  const cur = custom[p.sku] || {};
  document.getElementById('imgPreview').src = productImage(cur.image || p.image);

  const stockEditor = document.getElementById('stockEditor');
  stockEditor.innerHTML = '';
  p.sizes.forEach(s => {
    const wrapper = document.createElement('div');
    wrapper.className = 'stock-row';
    wrapper.innerHTML = `<label>${s}</label><input data-size="${s}" class="stockInput" type="number" min="0" value="${(cur.stock && cur.stock[s]) || stockQty(p, s)}" />`;
    stockEditor.appendChild(wrapper);
  });
}

function stockQty(p, size) {
  return (p.stock && p.stock[size]) || 0;
}

function seedAdmin() {
  document.getElementById('imageFile').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { document.getElementById('imgPreview').src = ev.target.result; };
    reader.readAsDataURL(file);
  });

  document.getElementById('cancelEdit').addEventListener('click', () => {
    document.getElementById('editor').style.display = 'none';
  });

  document.getElementById('saveProduct').addEventListener('click', () => {
    const editor = document.getElementById('editor');
    const sku = editor.dataset.sku;
    if (!sku) return;

    const custom = getCustom();
    if (!custom[sku]) custom[sku] = {};
    custom[sku].image = document.getElementById('imgPreview').src;
    custom[sku].stock = {};
    document.querySelectorAll('.stockInput').forEach(input => {
      custom[sku].stock[input.dataset.size] = parseInt(input.value || '0', 10);
    });
    setCustom(custom);

    alert('Cambios guardados localmente.');
    editor.style.display = 'none';
    initAdmin();
  });
}

async function initAdmin() {
  renderList(await fetchProducts());
}

seedAdmin();
initAdmin();
