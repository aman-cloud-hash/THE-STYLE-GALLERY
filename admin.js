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
    let orders = DB.load('orders', []);
    const container = document.getElementById('orders-list-full');
    const summaryStrip = document.getElementById('orders-summary-strip');

    // Summary strip (always shows all orders data)
    const summaryCounts = { confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
    let totalRevenue = 0;
    orders.forEach(o => {
        const s = o.status || 'confirmed';
        if (summaryCounts[s] !== undefined) summaryCounts[s]++;
        if (s !== 'cancelled') totalRevenue += (o.total || 0);
    });

    summaryStrip.innerHTML = `
        <div class="os-item confirmed"><span class="os-count">${summaryCounts.confirmed}</span><span class="os-label">Confirmed</span></div>
        <div class="os-item shipped"><span class="os-count">${summaryCounts.shipped}</span><span class="os-label">Shipped</span></div>
        <div class="os-item delivered"><span class="os-count">${summaryCounts.delivered}</span><span class="os-label">Delivered</span></div>
        <div class="os-item cancelled"><span class="os-count">${summaryCounts.cancelled}</span><span class="os-label">Cancelled</span></div>
        <div class="os-item revenue"><span class="os-count">₹${totalRevenue.toLocaleString()}</span><span class="os-label">Total Revenue</span></div>
    `;

    // Apply Filters
    const searchQuery = document.getElementById('order-search').value.toLowerCase();
    const statusFilter = document.querySelector('.filter-btn.active').dataset.filter;
    const dateFrom = document.getElementById('filter-date-from').value;
    const dateTo = document.getElementById('filter-date-to').value;

    let filteredOrders = orders.filter(o => {
        const cust = o.customer || {};
        const matchesSearch = 
            o.id.toLowerCase().includes(searchQuery) ||
            (cust.name || o.customerName || '').toLowerCase().includes(searchQuery) ||
            (cust.phone || o.phone || '').toLowerCase().includes(searchQuery);
        
        const matchesStatus = statusFilter === 'all' || (o.status || 'confirmed') === statusFilter;
        
        let matchesDate = true;
        if (o.timestamp) {
            const orderDate = new Date(o.timestamp).toISOString().split('T')[0];
            if (dateFrom && orderDate < dateFrom) matchesDate = false;
            if (dateTo && orderDate > dateTo) matchesDate = false;
        } else if (o.date) {
            // Fallback for orders without timestamp
            try {
                // Assuming date is in DD MMM YYYY or similar local format, this is tricky
                // For safety, if no timestamp, we only filter if we can parse it
                const d = new Date(o.date);
                if (!isNaN(d.getTime())) {
                    const orderDate = d.toISOString().split('T')[0];
                    if (dateFrom && orderDate < dateFrom) matchesDate = false;
                    if (dateTo && orderDate > dateTo) matchesDate = false;
                }
            } catch(e) {}
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    if (filteredOrders.length === 0) {
        container.innerHTML = '<p class="empty-msg">No orders match your filters.</p>';
        return;
    }

    container.innerHTML = filteredOrders.slice().reverse().map(o => {
        const cust = o.customer || {};
        const itemsPreview = (o.items || []).slice(0, 3).map(i =>
            `<img src="${i.image}" alt="${i.name}" onerror="this.style.display='none'">`
        ).join('');
        const moreCount = (o.items || []).length > 3 ? `<div class="more-items">+${(o.items || []).length - 3}</div>` : '';

        return `
        <div class="order-card" data-status="${o.status || 'confirmed'}" onclick="viewOrderDetail('${o.id}')">
            <div class="col-select" onclick="event.stopPropagation()"><input type="checkbox" class="order-checkbox" data-id="${o.id}"></div>
            <div class="col-id">${o.id}</div>
            <div class="col-cust">
                <div style="font-weight:600;">${cust.name || o.customerName || 'N/A'}</div>
                <div style="font-size:0.75rem;color:var(--text-2);">${cust.phone || o.phone || 'N/A'}</div>
            </div>
            <div class="col-date">
                <div>${o.date || 'N/A'}</div>
                <div style="font-size:0.75rem;color:var(--text-2);">${o.time || ''}</div>
            </div>
            <div class="col-total">₹${o.total || 0}</div>
            <div class="col-status">
                <span class="order-status-badge s-${o.status || 'confirmed'}">${o.status || 'confirmed'}</span>
            </div>
            <div class="col-actions" onclick="event.stopPropagation()">
                <select class="order-status-select" onchange="updateOrderStatus('${o.id}', this.value)">
                    <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </div>
        </div>`;
    }).join('');

    updateSelectionListeners();
}

function updateSelectionListeners() {
    const checkboxes = document.querySelectorAll('.order-checkbox');
    const selectAllHeader = document.getElementById('select-all-header');
    const selectAllBar = document.getElementById('select-all-orders');
    const bulkBar = document.getElementById('bulk-actions-bar');
    const countLabel = document.getElementById('selected-count');

    const updateBar = () => {
        const checked = document.querySelectorAll('.order-checkbox:checked');
        if (checked.length > 0) {
            bulkBar.style.display = 'flex';
            countLabel.textContent = `${checked.length} Selected`;
        } else {
            bulkBar.style.display = 'none';
        }
        selectAllHeader.checked = checked.length === checkboxes.length && checkboxes.length > 0;
        selectAllBar.checked = selectAllHeader.checked;
    };

    checkboxes.forEach(cb => cb.addEventListener('change', updateBar));

    const toggleAll = (state) => {
        checkboxes.forEach(cb => cb.checked = state);
        updateBar();
    };

    selectAllHeader.onclick = (e) => toggleAll(e.target.checked);
    selectAllBar.onclick = (e) => toggleAll(e.target.checked);
}

window.bulkUpdateStatus = function(status) {
    const checked = document.querySelectorAll('.order-checkbox:checked');
    if (checked.length === 0) return;
    
    if (!confirm(`Update ${checked.length} orders to ${status}?`)) return;

    const orders = DB.load('orders', []);
    const now = new Date().toLocaleString('en-IN');
    
    checked.forEach(cb => {
        const id = cb.dataset.id;
        const o = orders.find(x => x.id === id);
        if (o) {
            o.status = status;
            if (!o.statusHistory) o.statusHistory = [];
            o.statusHistory.push({ status, time: now });
        }
    });

    DB.save('orders', orders);
    toast(`Updated ${checked.length} orders!`);
    loadOrdersList();
    loadDashboard();
};

window.bulkDeleteOrders = function() {
    const checked = document.querySelectorAll('.order-checkbox:checked');
    if (checked.length === 0) return;
    
    if (!confirm(`Permanently delete ${checked.length} orders?`)) return;

    let orders = DB.load('orders', []);
    const idsToDelete = Array.from(checked).map(cb => cb.dataset.id);
    orders = orders.filter(o => !idsToDelete.includes(o.id));

    DB.save('orders', orders);
    toast(`Deleted ${checked.length} orders!`);
    loadOrdersList();
    loadDashboard();
};

// Order Filter Listeners
function initOrderFilters() {
    const search = document.getElementById('order-search');
    const dateFrom = document.getElementById('filter-date-from');
    const dateTo = document.getElementById('filter-date-to');
    const clearDates = document.getElementById('clear-date-filters');

    const triggerUpdate = () => loadOrdersList();

    search.addEventListener('input', triggerUpdate);
    dateFrom.addEventListener('change', triggerUpdate);
    dateTo.addEventListener('change', triggerUpdate);
    
    clearDates.addEventListener('click', () => {
        dateFrom.value = '';
        dateTo.value = '';
        triggerUpdate();
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            triggerUpdate();
        });
    });
}


function updateOrderStatus(orderId, status) {
    const orders = DB.load('orders', []);
    const o = orders.find(x => x.id === orderId);
    if (o) {
        o.status = status;
        // Add status change timestamp
        if (!o.statusHistory) o.statusHistory = [];
        o.statusHistory.push({ status, time: new Date().toLocaleString('en-IN') });
        DB.save('orders', orders);
        toast('Order status updated!');
        loadOrdersList();
        loadDashboard();
    }
}

// View order detail modal
window.viewOrderDetail = function(orderId) {
    const orders = DB.load('orders', []);
    const o = orders.find(x => x.id === orderId);
    if (!o) return;

    const cust = o.customer || {};
    const modal = document.getElementById('order-detail-modal');
    const content = document.getElementById('od-content');
    document.getElementById('od-title').textContent = 'Order ' + o.id;

    // Build timeline
    const statuses = ['confirmed', 'shipped', 'delivered'];
    const statusLabels = { confirmed: 'Order Confirmed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };
    const currentIdx = statuses.indexOf(o.status);
    const history = o.statusHistory || [{ status: 'confirmed', time: `${o.date} ${o.time || ''}` }];

    let timelineHTML = '';
    if (o.status === 'cancelled') {
        timelineHTML = `
            <div class="od-timeline-item"><div class="od-timeline-dot active"></div><div class="od-timeline-text"><div class="od-tl-title">Order Confirmed</div><div class="od-tl-time">${o.date} ${o.time || ''}</div></div></div>
            <div class="od-timeline-item"><div class="od-timeline-dot active" style="background:var(--danger);border-color:var(--danger);"></div><div class="od-timeline-text"><div class="od-tl-title" style="color:var(--danger);">Order Cancelled</div><div class="od-tl-time">${history.length > 1 ? history[history.length-1].time : ''}</div></div></div>
        `;
    } else {
        timelineHTML = statuses.map((s, i) => {
            const isActive = i <= currentIdx;
            const histEntry = history.find(h => h.status === s);
            return `<div class="od-timeline-item"><div class="od-timeline-dot ${isActive ? 'active' : ''}"></div><div class="od-timeline-text"><div class="od-tl-title">${statusLabels[s]}</div><div class="od-tl-time">${histEntry ? histEntry.time : (isActive ? o.date : 'Pending')}</div></div></div>`;
        }).join('');
    }

    // Items HTML
    const itemsHTML = (o.items || []).map(item => `
        <div class="od-item-row">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%231a1a25%22 width=%22100%22 height=%22100%22/></svg>'">
            <div class="od-item-info">
                <div class="od-item-name">${item.name}</div>
                <div class="od-item-meta">Size: ${item.size || 'N/A'} &nbsp;•&nbsp; Qty: ${item.quantity || 1}</div>
            </div>
            <div class="od-item-price">₹${(item.price * (item.quantity || 1)).toLocaleString()}</div>
        </div>
    `).join('');

    content.innerHTML = `
        <div class="od-section">
            <div class="od-section-title"><i class="fa-solid fa-user"></i> Customer Details</div>
            <div class="od-grid">
                <div class="od-field"><div class="od-label">Name</div><div class="od-value">${cust.name || o.customerName || 'N/A'}</div></div>
                <div class="od-field"><div class="od-label">Phone</div><div class="od-value">${cust.phone || o.phone || 'N/A'}</div></div>
                <div class="od-field"><div class="od-label">Email</div><div class="od-value">${cust.email || 'N/A'}</div></div>
                <div class="od-field"><div class="od-label">City</div><div class="od-value">${cust.city || 'N/A'}</div></div>
                <div class="od-field full"><div class="od-label">Full Address</div><div class="od-value">${cust.fullAddress || cust.address || 'N/A'}</div></div>
                <div class="od-field"><div class="od-label">State</div><div class="od-value">${cust.state || 'N/A'}</div></div>
                <div class="od-field"><div class="od-label">PIN Code</div><div class="od-value">${cust.pincode || 'N/A'}</div></div>
            </div>
        </div>

        <div class="od-section">
            <div class="od-section-title"><i class="fa-solid fa-box-open"></i> Order Items (${o.totalQty || (o.items ? o.items.reduce((s,i) => s + (i.quantity||1), 0) : 0)} items)</div>
            ${itemsHTML}
        </div>

        <div class="od-section">
            <div class="od-section-title"><i class="fa-solid fa-receipt"></i> Payment Summary</div>
            <div class="od-total-row"><span>Subtotal</span><span>₹${(o.subtotal || o.total || 0).toLocaleString()}</span></div>
            ${o.discount && o.discount > 0 ? `<div class="od-total-row discount"><span>Discount</span><span>- ₹${o.discount.toLocaleString()}</span></div>` : ''}
            <div class="od-total-row"><span>Shipping</span><span style="color:var(--success);">FREE</span></div>
            <div class="od-total-row grand-total"><span>Total Paid</span><span>₹${(o.total || 0).toLocaleString()}</span></div>
            ${o.appliedOffer && o.appliedOffer !== 'None' ? `<div class="od-offer-badge"><i class="fa-solid fa-tag"></i> Offer Applied: ${o.appliedOffer}</div>` : ''}
            <div style="margin-top:8px;font-size:0.8rem;color:var(--text-2);"><i class="fa-solid fa-truck-fast"></i> Payment: ${o.paymentMethod || 'Cash on Delivery'}</div>
        </div>

        <div class="od-section">
            <div class="od-section-title"><i class="fa-solid fa-clock-rotate-left"></i> Order Timeline</div>
            <div class="od-grid" style="margin-bottom:12px;">
                <div class="od-field"><div class="od-label">Order Date</div><div class="od-value">${o.date || 'N/A'}</div></div>
                <div class="od-field"><div class="od-label">Order Time</div><div class="od-value">${o.time || 'N/A'}</div></div>
            </div>
            <div class="od-timeline">${timelineHTML}</div>
        </div>

        <div style="display:flex;gap:8px;margin-top:15px;">
            <button class="od-print-btn" onclick="printOrder('${o.id}')"><i class="fa-solid fa-print"></i> Print Invoice</button>
            <button class="od-print-btn" onclick="copyOrderToClipboard('${o.id}')"><i class="fa-solid fa-copy"></i> Copy Details</button>
        </div>
    `;

    modal.style.display = 'flex';
};

// Close order detail modal
document.getElementById('close-order-modal').addEventListener('click', () => {
    document.getElementById('order-detail-modal').style.display = 'none';
});

// Print invoice
window.printOrder = function(orderId) {
    const orders = DB.load('orders', []);
    const o = orders.find(x => x.id === orderId);
    if (!o) return;
    const cust = o.customer || {};
    const itemsText = (o.items || []).map(i => `${i.name} (Size: ${i.size || 'N/A'}) x${i.quantity || 1} — ₹${i.price * (i.quantity || 1)}`).join('\n');

    const printWin = window.open('', '_blank');
    printWin.document.write(`<html><head><title>Invoice ${o.id}</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#222;}h1{font-size:22px;}h2{font-size:16px;margin-top:25px;border-bottom:1px solid #ddd;padding-bottom:5px;}.row{display:flex;justify-content:space-between;padding:5px 0;}.total{font-weight:bold;font-size:18px;border-top:2px solid #222;margin-top:10px;padding-top:10px;}.offer{color:#d63031;font-weight:bold;}.items{margin:10px 0;}.item{padding:8px 0;border-bottom:1px solid #eee;}</style></head><body>`);
    printWin.document.write(`<h1>THE STYLE GALLERY — Invoice</h1>`);
    printWin.document.write(`<p>Order: <strong>${o.id}</strong> | Date: ${o.date} ${o.time || ''} | Status: ${o.status}</p>`);
    printWin.document.write(`<h2>Customer</h2><p>${cust.name || 'N/A'}<br>${cust.phone || ''}<br>${cust.email || ''}<br>${cust.fullAddress || ''}</p>`);
    printWin.document.write(`<h2>Items</h2><div class="items">`);
    (o.items || []).forEach(i => {
        printWin.document.write(`<div class="item"><div class="row"><span>${i.name} (Size: ${i.size || 'N/A'}) × ${i.quantity || 1}</span><span>₹${(i.price * (i.quantity || 1)).toLocaleString()}</span></div></div>`);
    });
    printWin.document.write(`</div>`);
    printWin.document.write(`<div class="row"><span>Subtotal</span><span>₹${(o.subtotal || o.total || 0).toLocaleString()}</span></div>`);
    if (o.discount > 0) printWin.document.write(`<div class="row offer"><span>Discount (${o.appliedOffer})</span><span>- ₹${o.discount.toLocaleString()}</span></div>`);
    printWin.document.write(`<div class="row"><span>Shipping</span><span>FREE</span></div>`);
    printWin.document.write(`<div class="row total"><span>Total</span><span>₹${(o.total || 0).toLocaleString()}</span></div>`);
    printWin.document.write(`<p style="margin-top:30px;font-size:12px;color:#999;">Payment: ${o.paymentMethod || 'COD'} | Thank you for shopping with THE STYLE GALLERY!</p>`);
    printWin.document.write(`</body></html>`);
    printWin.document.close();
    printWin.print();
};

// Copy order details to clipboard
window.copyOrderToClipboard = function(orderId) {
    const orders = DB.load('orders', []);
    const o = orders.find(x => x.id === orderId);
    if (!o) return;
    const cust = o.customer || {};
    let text = `Order: ${o.id}\nDate: ${o.date} ${o.time || ''}\nStatus: ${o.status}\n\n`;
    text += `Customer: ${cust.name || 'N/A'}\nPhone: ${cust.phone || 'N/A'}\nEmail: ${cust.email || 'N/A'}\nAddress: ${cust.fullAddress || 'N/A'}\n\n`;
    text += `Items:\n`;
    (o.items || []).forEach(i => { text += `- ${i.name} (Size: ${i.size || 'N/A'}) x${i.quantity || 1} = ₹${i.price * (i.quantity || 1)}\n`; });
    text += `\nSubtotal: ₹${o.subtotal || o.total || 0}`;
    if (o.discount > 0) text += `\nDiscount: -₹${o.discount} (${o.appliedOffer})`;
    text += `\nTotal: ₹${o.total || 0}\nPayment: ${o.paymentMethod || 'COD'}`;
    navigator.clipboard.writeText(text).then(() => toast('Order details copied!')).catch(() => toast('Copy failed', true));
};


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
initOrderFilters();

// ===== REALTIME SYNC =====
try {
    const syncChannel = new BroadcastChannel('tsg_sync');
    syncChannel.onmessage = (e) => {
        const { key } = e.data;
        if (key === 'orders') {
            loadOrdersList();
            loadDashboard();
            loadAnalytics();
            toast('New order received!', false);
        }
    };
} catch(e) {}
