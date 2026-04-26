// ===== DATA MANAGER =====
const DB = {
    save(key, data) {
        localStorage.setItem('tsg_' + key, JSON.stringify(data));
        try { new BroadcastChannel('tsg_sync').postMessage({ key, data }); } catch(e) {}
    },
    load(key, def) {
        const d = localStorage.getItem('tsg_' + key);
        return d ? JSON.parse(d) : def;
    }
};

// ===== DEFAULT DATA =====
const DEFAULTS = {
    hero: [
        { url: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?q=80&w=2070&auto=format&fit=crop', alt: 'Premium Denim Collection' },
        { url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=2070&auto=format&fit=crop', alt: 'Classic Jeans Collection' },
        { url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=2070&auto=format&fit=crop', alt: 'Stacked Premium Denim' }
    ],
    offers: {
        circles: [
            { label: 'PREMIUM', title: 'JEANS', subtitle: 'AT JUST', price: '799' },
            { label: 'PREMIUM', title: 'JEANS', subtitle: 'AT JUST', price: '899' }
        ],
        marquee: 'EXCLUSIVE OFFER: BUY 3 AT ₹2100 • BUY 2 AT ₹1450 • PREMIUM BOTTOM WEAR AT UNBEATABLE PRICES',
        combos: [
            { qty: 3, price: 2100 },
            { qty: 2, price: 1450 }
        ]
    },
    products: [
        { id: 1, name: 'Blue straight fit baggy', price: 799, image: 'assets/product/Blue straight fit baggy.jpeg', sizes: '28, 30, 32, 34', stock: 15, category: 'baggy' },
        { id: 2, name: 'White Wide leg baggy', price: 799, image: 'assets/product/White Wide leg baggy.jpeg', sizes: '28, 30, 32, 34', stock: 12, category: 'wide-leg' },
        { id: 3, name: 'Double shaded blue wide leg baggy', price: 899, image: 'assets/product/Double shaded blue wide leg baggy.jpeg', sizes: '28, 30, 32, 34', stock: 8, category: 'wide-leg' },
        { id: 4, name: 'Dark blue double shaded wide leg', price: 899, image: 'assets/product/Dark blue double shaded wide leg.jpeg', sizes: '28, 30, 32, 34', stock: 10, category: 'wide-leg' },
        { id: 5, name: 'Black double shaded wide leg baggy', price: 899, image: 'assets/product/Black double shaded wide leg baggy.jpeg', sizes: '28, 30, 32, 34', stock: 5, category: 'wide-leg' },
        { id: 6, name: 'Vintage dark blue wide leg baggy', price: 899, image: 'assets/product/Vintage dark blue wide leg baggy.jpeg', sizes: '28, 30, 32, 34', stock: 3, category: 'wide-leg' }
    ],
    orders: [],
    analytics: { views: 0, cartAdds: 0 },
    pin: '1234',
    settings: { storeName: 'THE STYLE GALLERY', whatsapp: '918000150047', instagram: '@_the_stylegallery' }
};

function initData() {
    if (!DB.load('products', null)) DB.save('products', DEFAULTS.products);
    if (!DB.load('hero', null)) DB.save('hero', DEFAULTS.hero);
    if (!DB.load('offers', null)) DB.save('offers', DEFAULTS.offers);
    if (!DB.load('orders', null)) DB.save('orders', DEFAULTS.orders);
    if (!DB.load('analytics', null)) DB.save('analytics', DEFAULTS.analytics);
    if (!DB.load('pin', null)) DB.save('pin', DEFAULTS.pin);
    if (!DB.load('settings', null)) DB.save('settings', DEFAULTS.settings);
}

// ===== TOAST =====
function toast(msg, isError) {
    const t = document.createElement('div');
    t.className = 'toast' + (isError ? ' error' : '');
    t.innerHTML = `<i class="fa-solid ${isError ? 'fa-circle-xmark' : 'fa-circle-check'}"></i> ${msg}`;
    document.getElementById('admin-toast').appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// ===== LOGIN =====
function initLogin() {
    document.getElementById('login-form').addEventListener('submit', e => {
        e.preventDefault();
        const pin = document.getElementById('admin-pin').value;
        if (pin === DB.load('pin', '1234')) {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('admin-panel').style.display = 'flex';
            sessionStorage.setItem('tsg_auth', '1');
            loadDashboard();
        } else {
            toast('Wrong PIN!', true);
        }
    });

    if (sessionStorage.getItem('tsg_auth') === '1') {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'flex';
        loadDashboard();
    }
}

// ===== NAVIGATION =====
function initNav() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    const pageTitle = document.getElementById('page-title');
    const sidebar = document.getElementById('sidebar');

    navItems.forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            const pg = item.dataset.page;
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            pages.forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
            const target = document.getElementById('page-' + pg);
            target.style.display = 'block';
            setTimeout(() => target.classList.add('active'), 10);
            pageTitle.textContent = item.textContent.trim();
            sidebar.classList.remove('open');
            loadPageData(pg);
        });
    });

    document.querySelectorAll('.quick-action-btn[data-goto]').forEach(btn => {
        btn.addEventListener('click', () => {
            const pg = btn.dataset.goto;
            document.querySelector(`.nav-item[data-page="${pg}"]`).click();
        });
    });

    document.getElementById('menu-btn').addEventListener('click', () => sidebar.classList.toggle('open'));
    document.getElementById('sidebar-close').addEventListener('click', () => sidebar.classList.remove('open'));
    document.getElementById('logout-btn').addEventListener('click', e => {
        e.preventDefault();
        sessionStorage.removeItem('tsg_auth');
        location.reload();
    });
}

function loadPageData(pg) {
    if (pg === 'dashboard') loadDashboard();
    else if (pg === 'hero') loadHeroManager();
    else if (pg === 'offers') loadOffersManager();
    else if (pg === 'products') loadProductsTable();
    else if (pg === 'orders') loadOrdersList();
    else if (pg === 'analytics') loadAnalytics();
    else if (pg === 'settings') loadSettings();
}

// ===== DASHBOARD =====
function loadDashboard() {
    const products = DB.load('products', []);
    const orders = DB.load('orders', []);
    const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const lowStock = products.filter(p => p.stock <= 5).length;

    document.getElementById('stat-products').textContent = products.length;
    document.getElementById('stat-orders').textContent = orders.length;
    document.getElementById('stat-revenue').textContent = '₹' + revenue.toLocaleString();
    document.getElementById('stat-lowstock').textContent = lowStock;

    const recentOrders = document.getElementById('recent-orders-list');
    if (orders.length === 0) {
        recentOrders.innerHTML = '<p class="empty-msg">No orders yet</p>';
    } else {
        recentOrders.innerHTML = orders.slice(-5).reverse().map(o => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border);">
                <div><span class="order-id">${o.id}</span><div class="order-detail">${o.items ? o.items.length : 0} items • ${o.date || 'N/A'}</div></div>
                <span style="font-weight:700;">₹${o.total || 0}</span>
            </div>
        `).join('');
    }
}

// ===== HERO MANAGER =====
function loadHeroManager() {
    const hero = DB.load('hero', DEFAULTS.hero);
    const container = document.getElementById('hero-slides-container');
    container.innerHTML = hero.map((slide, i) => `
        <div class="hero-slide-card">
            <div class="hero-slide-preview">
                ${slide.url ? `<img src="${slide.url}" alt="${slide.alt}" onerror="this.parentElement.innerHTML='<div class=placeholder><i class=fa-solid fa-image></i></div>'">` : '<div class="placeholder"><i class="fa-solid fa-image"></i></div>'}
            </div>
            <div class="hero-slide-body">
                <div class="slide-label">Slide ${i + 1}</div>
                <div class="form-group"><label>Image URL</label><input type="text" class="hero-url" data-index="${i}" value="${slide.url}" placeholder="https://images.unsplash.com/..."></div>
                <div class="form-group"><label>Alt Text</label><input type="text" class="hero-alt" data-index="${i}" value="${slide.alt}" placeholder="Description"></div>
            </div>
        </div>
    `).join('');

    // Live preview on URL change
    container.querySelectorAll('.hero-url').forEach(input => {
        input.addEventListener('input', e => {
            const card = e.target.closest('.hero-slide-card');
            const preview = card.querySelector('.hero-slide-preview');
            const url = e.target.value;
            if (url) preview.innerHTML = `<img src="${url}" alt="Preview" onerror="this.parentElement.innerHTML='<div class=placeholder><i class=fa-solid fa-image></i></div>'">`;
            else preview.innerHTML = '<div class="placeholder"><i class="fa-solid fa-image"></i></div>';
        });
    });
}

document.getElementById('save-hero').addEventListener('click', () => {
    const urls = document.querySelectorAll('.hero-url');
    const alts = document.querySelectorAll('.hero-alt');
    const hero = [];
    urls.forEach((u, i) => hero.push({ url: u.value, alt: alts[i].value }));
    DB.save('hero', hero);
    toast('Hero section updated! Website will refresh automatically.');
});

// ===== OFFERS MANAGER =====
function loadOffersManager() {
    const offers = DB.load('offers', DEFAULTS.offers);
    const circlesContainer = document.getElementById('offer-circles-container');
    circlesContainer.innerHTML = offers.circles.map((c, i) => `
        <div class="offer-edit-card">
            <h4>Offer Circle ${i + 1}</h4>
            <div class="form-group"><label>Label</label><input type="text" class="offer-label" value="${c.label}" placeholder="PREMIUM"></div>
            <div class="form-group"><label>Title</label><input type="text" class="offer-title" value="${c.title}" placeholder="JEANS"></div>
            <div class="form-group"><label>Subtitle</label><input type="text" class="offer-subtitle" value="${c.subtitle}" placeholder="AT JUST"></div>
            <div class="form-group"><label>Price</label><input type="text" class="offer-price" value="${c.price}" placeholder="799"></div>
        </div>
    `).join('');

    document.getElementById('marquee-text').value = offers.marquee || '';

    const combosContainer = document.getElementById('combo-offers-container');
    combosContainer.innerHTML = (offers.combos || []).map((c, i) => `
        <div class="combo-row">
            <div class="form-group"><label>Buy Qty</label><input type="number" class="combo-qty" value="${c.qty}" min="1"></div>
            <div class="form-group"><label>At Price (₹)</label><input type="number" class="combo-price" value="${c.price}"></div>
            <button class="combo-delete" onclick="this.closest('.combo-row').remove()"><i class="fa-solid fa-trash"></i></button>
        </div>
    `).join('');
}

document.getElementById('add-combo').addEventListener('click', () => {
    const container = document.getElementById('combo-offers-container');
    container.insertAdjacentHTML('beforeend', `
        <div class="combo-row">
            <div class="form-group"><label>Buy Qty</label><input type="number" class="combo-qty" value="2" min="1"></div>
            <div class="form-group"><label>At Price (₹)</label><input type="number" class="combo-price" value="1000"></div>
            <button class="combo-delete" onclick="this.closest('.combo-row').remove()"><i class="fa-solid fa-trash"></i></button>
        </div>
    `);
});

document.getElementById('save-offers').addEventListener('click', () => {
    const circles = [];
    document.querySelectorAll('.offer-edit-card').forEach(card => {
        circles.push({
            label: card.querySelector('.offer-label').value,
            title: card.querySelector('.offer-title').value,
            subtitle: card.querySelector('.offer-subtitle').value,
            price: card.querySelector('.offer-price').value
        });
    });
    const combos = [];
    document.querySelectorAll('.combo-row').forEach(row => {
        combos.push({ qty: parseInt(row.querySelector('.combo-qty').value), price: parseInt(row.querySelector('.combo-price').value) });
    });
    const offers = { circles, marquee: document.getElementById('marquee-text').value, combos };
    DB.save('offers', offers);
    toast('Offers updated! Website will refresh automatically.');
});

// ===== PRODUCTS MANAGER =====
function loadProductsTable() {
    const products = DB.load('products', []);
    const tbody = document.getElementById('products-tbody');
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7"><p class="empty-msg">No products. Add one!</p></td></tr>';
        return;
    }
    tbody.innerHTML = products.map(p => {
        const statusClass = p.stock <= 0 ? 'out-of-stock' : p.stock <= 5 ? 'low-stock' : 'in-stock';
        const statusText = p.stock <= 0 ? 'Out of Stock' : p.stock <= 5 ? 'Low Stock' : 'In Stock';
        return `<tr>
            <td><img src="${p.image}" class="product-thumb" alt="${p.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%231a1a25%22 width=%22100%22 height=%22100%22/></svg>'"></td>
            <td><strong>${p.name}</strong></td>
            <td>₹${p.price}</td>
            <td>${p.sizes}</td>
            <td><input type="number" value="${p.stock}" min="0" style="width:60px;padding:6px;background:var(--surface-2);border:1px solid var(--border);border-radius:6px;color:#fff;text-align:center;" onchange="updateStock(${p.id}, this.value)"></td>
            <td><span class="stock-badge ${statusClass}">${statusText}</span></td>
            <td><div class="action-btns">
                <button class="action-btn" onclick="editProduct(${p.id})" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn delete" onclick="deleteProduct(${p.id})" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </div></td>
        </tr>`;
    }).join('');
}

function updateStock(id, val) {
    const products = DB.load('products', []);
    const p = products.find(x => x.id === id);
    if (p) { p.stock = parseInt(val); DB.save('products', products); toast('Stock updated!'); loadProductsTable(); loadDashboard(); }
}

function editProduct(id) {
    const products = DB.load('products', []);
    const p = products.find(x => x.id === id);
    if (!p) return;
    document.getElementById('modal-title').textContent = 'Edit Product';
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-stock').value = p.stock;
    document.getElementById('p-image').value = p.image;
    document.getElementById('p-sizes').value = p.sizes;
    document.getElementById('p-category').value = p.category || 'baggy';
    document.getElementById('p-edit-id').value = id;
    document.getElementById('product-modal').style.display = 'flex';
}

function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    let products = DB.load('products', []);
    products = products.filter(x => x.id !== id);
    DB.save('products', products);
    toast('Product deleted!');
    loadProductsTable();
    loadDashboard();
}

// Add product button
document.getElementById('add-product-btn').addEventListener('click', () => {
    document.getElementById('modal-title').textContent = 'Add Product';
    document.getElementById('product-form').reset();
    document.getElementById('p-edit-id').value = '';
    document.getElementById('p-sizes').value = '28, 30, 32, 34';
    document.getElementById('product-modal').style.display = 'flex';
});

document.getElementById('close-product-modal').addEventListener('click', () => { document.getElementById('product-modal').style.display = 'none'; });
document.getElementById('cancel-product').addEventListener('click', () => { document.getElementById('product-modal').style.display = 'none'; });

document.getElementById('product-form').addEventListener('submit', e => {
    e.preventDefault();
    const products = DB.load('products', []);
    const editId = document.getElementById('p-edit-id').value;
    const data = {
        name: document.getElementById('p-name').value,
        price: parseInt(document.getElementById('p-price').value),
        stock: parseInt(document.getElementById('p-stock').value),
        image: document.getElementById('p-image').value,
        sizes: document.getElementById('p-sizes').value,
        category: document.getElementById('p-category').value
    };
    if (editId) {
        const idx = products.findIndex(x => x.id === parseInt(editId));
        if (idx >= 0) { data.id = parseInt(editId); products[idx] = data; }
    } else {
        data.id = Date.now();
        products.push(data);
    }
    DB.save('products', products);
    document.getElementById('product-modal').style.display = 'none';
    toast(editId ? 'Product updated!' : 'Product added!');
    loadProductsTable();
    loadDashboard();
});

// ===== ORDERS =====
function loadOrdersList() {
    const orders = DB.load('orders', []);
    const container = document.getElementById('orders-list-full');
    if (orders.length === 0) {
        container.innerHTML = '<p class="empty-msg">No orders yet. Orders placed on the website will appear here.</p>';
        return;
    }
    container.innerHTML = orders.slice().reverse().map(o => `
        <div class="order-card" data-status="${o.status || 'confirmed'}">
            <div>
                <span class="order-id">${o.id}</span>
                <div class="order-detail">${o.customerName || 'Customer'} • ${o.items ? o.items.map(i => i.name).join(', ') : 'N/A'}</div>
                <div class="order-detail">${o.date || 'N/A'} • ${o.phone || ''}</div>
            </div>
            <span class="order-total">₹${o.total || 0}</span>
            <select class="order-status-select" onchange="updateOrderStatus('${o.id}', this.value)">
                <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
        </div>
    `).join('');

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            document.querySelectorAll('.order-card').forEach(card => {
                card.style.display = (filter === 'all' || card.dataset.status === filter) ? 'grid' : 'none';
            });
        });
    });
}

function updateOrderStatus(orderId, status) {
    const orders = DB.load('orders', []);
    const o = orders.find(x => x.id === orderId);
    if (o) { o.status = status; DB.save('orders', orders); toast('Order status updated!'); }
}

// ===== ANALYTICS =====
function loadAnalytics() {
    const analytics = DB.load('analytics', { views: 0, cartAdds: 0 });
    const orders = DB.load('orders', []);
    const products = DB.load('products', []);

    document.getElementById('stat-views').textContent = analytics.views || 0;
    document.getElementById('stat-cartadds').textContent = analytics.cartAdds || 0;
    const convRate = analytics.views > 0 ? ((orders.length / analytics.views) * 100).toFixed(1) : '0';
    document.getElementById('stat-conversion').textContent = convRate + '%';

    // Top product
    const soldCount = {};
    orders.forEach(o => { (o.items || []).forEach(item => { soldCount[item.name] = (soldCount[item.name] || 0) + (item.qty || 1); }); });
    const topProduct = Object.entries(soldCount).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('stat-top').textContent = topProduct ? topProduct[0].substring(0, 20) : '-';

    // Revenue chart (last 7 days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dayStr = d.toLocaleDateString();
        const dayRevenue = orders.filter(o => o.date === dayStr).reduce((s, o) => s + (o.total || 0), 0);
        chartData.push({ label: days[d.getDay()], value: dayRevenue });
    }
    const maxVal = Math.max(...chartData.map(d => d.value), 1);
    document.getElementById('revenue-chart').innerHTML = chartData.map(d => `
        <div class="chart-bar-wrapper">
            <div class="chart-value">₹${d.value}</div>
            <div class="chart-bar" style="height: ${Math.max((d.value / maxVal) * 150, 4)}px;"></div>
            <div class="chart-label">${d.label}</div>
        </div>
    `).join('');

    // Product performance
    const perfContainer = document.getElementById('product-performance');
    const maxStock = Math.max(...products.map(p => p.stock), 1);
    perfContainer.innerHTML = products.map(p => `
        <div class="perf-bar-container">
            <div class="perf-bar-label"><span>${p.name}</span><span>${p.stock} in stock</span></div>
            <div class="perf-bar-bg"><div class="perf-bar-fill" style="width:${(p.stock / maxStock) * 100}%"></div></div>
        </div>
    `).join('');
}

// ===== SETTINGS =====
function loadSettings() {
    const settings = DB.load('settings', DEFAULTS.settings);
    document.getElementById('store-name').value = settings.storeName || '';
    document.getElementById('store-whatsapp').value = settings.whatsapp || '';
    document.getElementById('store-instagram').value = settings.instagram || '';
}

document.getElementById('save-settings').addEventListener('click', () => {
    DB.save('settings', {
        storeName: document.getElementById('store-name').value,
        whatsapp: document.getElementById('store-whatsapp').value,
        instagram: document.getElementById('store-instagram').value
    });
    toast('Settings saved!');
});

document.getElementById('change-pin-btn').addEventListener('click', () => {
    const current = document.getElementById('current-pin').value;
    const newPin = document.getElementById('new-pin').value;
    if (current !== DB.load('pin', '1234')) { toast('Current PIN is wrong!', true); return; }
    if (newPin.length < 4) { toast('PIN must be at least 4 digits!', true); return; }
    DB.save('pin', newPin);
    toast('PIN changed successfully!');
    document.getElementById('current-pin').value = '';
    document.getElementById('new-pin').value = '';
});

// Export/Import
document.getElementById('export-data').addEventListener('click', () => {
    const data = {};
    ['hero', 'offers', 'products', 'orders', 'analytics', 'settings'].forEach(k => { data[k] = DB.load(k, null); });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tsg_backup_' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    toast('Data exported!');
});

document.getElementById('import-data').addEventListener('click', () => document.getElementById('import-file').click());
document.getElementById('import-file').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        try {
            const data = JSON.parse(ev.target.result);
            Object.keys(data).forEach(k => DB.save(k, data[k]));
            toast('Data imported! Reloading...');
            setTimeout(() => location.reload(), 1500);
        } catch (err) { toast('Invalid file!', true); }
    };
    reader.readAsText(file);
});

document.getElementById('reset-data').addEventListener('click', () => {
    if (!confirm('Are you sure? This will delete ALL data!')) return;
    ['hero', 'offers', 'products', 'orders', 'analytics', 'settings', 'pin'].forEach(k => localStorage.removeItem('tsg_' + k));
    toast('All data reset! Reloading...');
    setTimeout(() => location.reload(), 1500);
});

// ===== INIT =====
initData();
initLogin();
initNav();
