// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu) {
    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'initial';
    });
}

// Close menu when link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = 'initial';
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// --- Scroll Reveal Animations (Trigger Every Time) ---
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        } else {
            // Remove the active class when element leaves viewport
            // This ensures it animates again when scrolling back
            entry.target.classList.remove('active');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Observe all elements with reveal classes
function initReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    revealElements.forEach(el => revealObserver.observe(el));
}

// Hero Slideshow
const heroImages = document.querySelectorAll('.hero-img');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;

function nextSlide() {
    if (heroImages.length === 0) return;
    heroImages[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % heroImages.length;
    heroImages[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

if (heroImages.length > 0) {
    setInterval(nextSlide, 5000);
}

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        heroImages[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        currentSlide = index;
        heroImages[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    });
});

// Initialize reveal on load
document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initApp();
});
// Also run it immediately in case DOMContentLoaded already fired
initReveal();

// --- App Functionality ---
function initApp() {
    initSearch();
    initCart();
    initProfile();
    initCheckout();
    initAuth();
    initWishlist();
    initProfileDetails();
    initQuickView();
}

// 1. Search Functionality
function initSearch() {
    const searchBtn = document.getElementById('search-btn');
    const closeSearch = document.getElementById('close-search');
    const searchOverlay = document.getElementById('search-overlay');
    const searchInput = document.getElementById('search-input');
    const productCards = document.querySelectorAll('.product-card');

    closeSearch.addEventListener('click', () => {
        searchOverlay.classList.remove('active');
        document.body.style.overflow = 'initial';
    });

    searchBtn.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        searchInput.focus();
        document.body.style.overflow = 'hidden';
    });

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        productCards.forEach(card => {
            const title = card.querySelector('h3').innerText.toLowerCase();
            if (title.includes(term)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });

        // If searching and we are on home page, scroll to shop section to see results
        if (term.length > 0) {
            const shopSection = document.getElementById('shop');
            if (shopSection) {
                shopSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchOverlay.classList.remove('active');
            document.body.style.overflow = 'initial';
        }
    });
}

// 2. Cart Functionality
function initCart() {
    const cartBtn = document.getElementById('cart-btn');
    const closeCart = document.getElementById('close-cart');
    const cartSidebar = document.getElementById('cart-sidebar');
    const addToCartBtns = document.querySelectorAll('.add-to-cart-overlay');
    const cartBadge = document.querySelector('.cart-badge');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalAmount = document.getElementById('cart-total-amount');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    window.updateCartUI = (syncFromStorage = false) => {
        if (syncFromStorage) {
            cart = JSON.parse(localStorage.getItem('cart')) || [];
        }
        // Update Badge
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.innerText = totalItems;

        // Render Items
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-message">Your cart is empty</div>';
            cartTotalAmount.innerText = '₹0';
        } else {
            cartItemsContainer.innerHTML = cart.map((item, index) => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>₹${item.price}</p>
                        <div class="cart-item-controls">
                            <button onclick="changeQty(${index}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="changeQty(${index}, 1)">+</button>
                        </div>
                    </div>
                    <i class="fa-solid fa-trash" onclick="removeFromCart(${index})" style="cursor:pointer; color:#ff4d00; font-size:0.8rem;"></i>
                </div>
            `).join('');

            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotalAmount.innerText = `₹${total}`;
        }

        localStorage.setItem('cart', JSON.stringify(cart));
    };

    // Global functions for cart controls
    window.changeQty = (index, delta) => {
        cart[index].quantity += delta;
        if (cart[index].quantity < 1) cart[index].quantity = 1;
        updateCartUI();
    };

    window.removeFromCart = (index) => {
        cart.splice(index, 1);
        updateCartUI();
        showToast('Item removed from cart');
    };

    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    closeCart.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
        document.body.style.overflow = 'initial';
    });

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart-overlay');
        if (btn) {
            const name = btn.getAttribute('data-name');
            const price = parseInt(btn.getAttribute('data-price'));
            const image = btn.getAttribute('data-image');

            const existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ name, price, image, quantity: 1 });
            }

            updateCartUI();
            showToast(`${name} added to cart!`);
        }
    });

    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('Your cart is empty!');
            return;
        }

        const user = localStorage.getItem('user');
        if (!user) {
            showToast('Please login to checkout');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        cartSidebar.classList.remove('active');
        openCheckout();
    });

    updateCartUI();
}

// 3. Profile Functionality
function initProfile() {
    const profileModal = document.getElementById('profile-modal');
    const profileBtn = document.getElementById('profile-btn');
    const closeProfile = document.getElementById('close-profile');

    closeProfile.addEventListener('click', () => {
        profileModal.classList.remove('active');
        document.body.style.overflow = 'initial';
    });

    profileBtn.addEventListener('click', () => {
        profileModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Close on outside click
    profileModal.addEventListener('click', (e) => {
        if (e.target === profileModal) {
            profileModal.classList.remove('active');
            document.body.style.overflow = 'initial';
        }
    });
}

// 4. Toast Notification
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        toast.style.transition = 'all 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// 5. Checkout Functionality
function initCheckout() {
    const checkoutOverlay = document.getElementById('checkout-overlay');
    const closeCheckout = document.getElementById('close-checkout');
    const shippingForm = document.getElementById('shipping-form');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const continueShopping = document.getElementById('continue-shopping');
    
    closeCheckout.addEventListener('click', () => {
        checkoutOverlay.classList.remove('active');
        document.body.style.overflow = 'initial';
    });
    
    // Step Elements
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.checkout-step-content');

    window.openCheckout = () => {
        // Reset to step 1
        goToStep(1);
        checkoutOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Update summary
        updateSummary();
    };

    function goToStep(stepNumber) {
        steps.forEach(s => s.classList.remove('active'));
        stepContents.forEach(c => c.classList.remove('active'));

        document.querySelector(`.step[data-step="${stepNumber}"]`).classList.add('active');
        document.getElementById(`step-${stepNumber}`).classList.add('active');
    }

    function updateSummary() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = 0; // Prepaid is free
        const total = subtotal + shipping;

        document.getElementById('summary-subtotal').innerText = `₹${subtotal}`;
        document.getElementById('summary-total').innerText = `₹${total}`;
    }

    shippingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        goToStep(2);
    });

    placeOrderBtn.addEventListener('click', () => {
        placeOrderBtn.innerText = 'Processing...';
        placeOrderBtn.disabled = true;

        setTimeout(() => {
            // Generate random order ID
            const orderId = 'TSG-' + Math.floor(1000 + Math.random() * 9000);
            document.getElementById('order-id').innerText = '#' + orderId;
            
            // Save order to history
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const newOrder = {
                id: orderId,
                date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
                status: 'Processing',
                items: [...cart],
                total: `₹${subtotal}`
            };
            
            const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
            orderHistory.unshift(newOrder); // New orders at top
            localStorage.setItem('orderHistory', JSON.stringify(orderHistory));

            // Clear Cart
            localStorage.removeItem('cart');
            
            // Refresh cart UI
            if (window.updateCartUI) window.updateCartUI(true);
            
            goToStep(3);
            placeOrderBtn.innerText = 'Place Order';
            placeOrderBtn.disabled = false;
        }, 2000);
    });

    continueShopping.addEventListener('click', () => {
        checkoutOverlay.classList.remove('active');
        document.body.style.overflow = 'initial';
        window.location.hash = '#shop';
    });

    // Payment Option selection
    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            paymentOptions.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
        });
    });
}

// 6. Auth Functionality
function initAuth() {
    const authOverlay = document.getElementById('auth-overlay');
    const authTriggerBtn = document.getElementById('auth-trigger-btn');
    const closeAuth = document.getElementById('close-auth');
    const loginForm = document.getElementById('login-form');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authFormContents = document.querySelectorAll('.auth-form-content');
    const switchTabs = document.querySelectorAll('.switch-tab');

    const updateProfileUI = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const profileName = document.querySelector('.profile-header h2');
        const authBtn = document.getElementById('auth-trigger-btn');

        if (user) {
            profileName.innerText = user.name;
            authBtn.innerText = 'Log Out';
            authBtn.classList.add('logout-active');
        } else {
            profileName.innerText = 'Guest User';
            authBtn.innerText = 'Log In / Sign Up';
            authBtn.classList.remove('logout-active');
        }
    };

    authTriggerBtn.addEventListener('click', () => {
        const user = localStorage.getItem('user');
        if (user) {
            // Logout
            localStorage.removeItem('user');
            updateProfileUI();
            showToast('Logged out successfully');
        } else {
            // Redirect to dedicated login page
            window.location.href = 'login.html';
        }
    });

    closeAuth.addEventListener('click', () => {
        authOverlay.classList.remove('active');
        document.body.style.overflow = 'initial';
    });

    const switchTab = (tabName) => {
        authTabs.forEach(t => t.classList.remove('active'));
        authFormContents.forEach(c => c.classList.remove('active'));
        document.querySelector(`.auth-tab[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-form-container`).classList.add('active');
    };

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    switchTabs.forEach(st => {
        st.addEventListener('click', () => switchTab(st.dataset.tab));
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = document.getElementById('login-phone').value;
        const pass = document.getElementById('login-password').value;

        // User requested credentials
        if (phone === '9876543210' && pass === 'test@123') {
            const userData = { name: 'Gaurav Goyal', phone: phone };
            localStorage.setItem('user', JSON.stringify(userData));
            updateProfileUI();
            authOverlay.classList.remove('active');
            document.body.style.overflow = 'initial';
            showToast('Welcome back, Gaurav!');
        } else {
            showToast('Invalid credentials. Try 9876543210 / test@123');
        }
    });

    updateProfileUI();
}

// 7. Wishlist Functionality
function initWishlist() {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    // Add heart icons to product cards dynamically if needed, 
    // but for now let's add a global toggle logic
    window.toggleWishlist = (product) => {
        const index = wishlist.findIndex(item => item.name === product.name);
        if (index > -1) {
            wishlist.splice(index, 1);
            showToast('Removed from wishlist');
        } else {
            wishlist.push(product);
            showToast('Added to wishlist');
        }
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        renderWishlist();
    };

    // Add wishlist buttons to product cards
    document.querySelectorAll('.product-card').forEach(card => {
        const name = card.querySelector('h3').innerText;
        const price = card.querySelector('.current-price').innerText;
        const image = card.querySelector('img').src;

        const wishBtn = document.createElement('div');
        wishBtn.className = 'wishlist-btn';
        wishBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
        card.querySelector('.product-image-container').appendChild(wishBtn);

        wishBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const icon = wishBtn.querySelector('i');
            icon.classList.toggle('fa-regular');
            icon.classList.toggle('fa-solid');
            toggleWishlist({ name, price, image });
        });

        // Initial state
        if (wishlist.some(item => item.name === name)) {
            const icon = wishBtn.querySelector('i');
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
        }
    });
}

// 8. Profile Details Overlays
function initProfileDetails() {
    const detailConfigs = [
        { btn: 'view-orders-btn', overlay: 'orders-overlay', close: 'close-orders' },
        { btn: 'view-wishlist-btn', overlay: 'wishlist-overlay', close: 'close-wishlist' },
        { btn: 'view-addresses-btn', overlay: 'addresses-overlay', close: 'close-addresses' },
        { btn: 'view-settings-btn', overlay: 'settings-overlay', close: 'close-settings' }
    ];

    detailConfigs.forEach(config => {
        const btn = document.getElementById(config.btn);
        const overlay = document.getElementById(config.overlay);
        const close = document.getElementById(config.close);

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // Close profile modal first
            document.getElementById('profile-modal').classList.remove('active');
            overlay.classList.add('active');
            
            if (config.overlay === 'wishlist-overlay') renderWishlist();
            if (config.overlay === 'orders-overlay') renderOrders();
        });

        close.addEventListener('click', () => {
            overlay.classList.remove('active');
            document.body.style.overflow = 'initial';
        });
    });

    window.renderWishlist = () => {
        const container = document.getElementById('wishlist-items');
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

        if (wishlist.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-heart"></i><p>Your wishlist is empty</p></div>';
        } else {
            container.innerHTML = wishlist.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.price}</p>
                    </div>
                    <button class="hero-btn" style="padding: 10px; font-size: 0.7rem;" onclick="addToCartFromWishlist('${item.name}')">Add to Cart</button>
                </div>
            `).join('');
        }
    };

    window.renderOrders = () => {
        const container = document.getElementById('orders-list');
        
        // Get user orders from localStorage
        const userOrders = JSON.parse(localStorage.getItem('orderHistory')) || [];
        
        // Hardcoded history for demo
        const demoOrders = [
            {
                id: 'TSG-4421',
                date: '15 April 2026',
                status: 'Delivered',
                items: [
                    { name: 'Blue straight fit baggy', price: '₹700', image: 'assets/product/Blue straight fit baggy.jpeg' }
                ],
                total: '₹700'
            }
        ];

        // Combine (user orders first)
        const allOrders = [...userOrders, ...demoOrders];

        if (allOrders.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-box-open"></i><p>No orders yet</p></div>';
            return;
        }

        container.innerHTML = allOrders.map(order => `
            <div class="order-card">
                <div class="order-card-header">
                    <div class="order-info-main">
                        <span class="order-id-text">Order #${order.id}</span>
                        <span class="order-date-text">Placed on ${order.date}</span>
                    </div>
                    <span class="order-status-badge status-${order.status.toLowerCase()}">${order.status}</span>
                </div>
                <div class="order-items-list">
                    ${order.items.map(item => `
                        <div class="order-product">
                            <img src="${item.image}" alt="${item.name}">
                            <div class="order-product-info">
                                <h4>${item.name}</h4>
                                <p>Qty: ${item.quantity || 1} | Size: 32</p>
                                <p>₹${item.price}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="order-card-footer">
                    <div class="order-total-box">
                        <span>Total Amount</span>
                        <strong>${order.total.startsWith('₹') ? order.total : '₹' + order.total}</strong>
                    </div>
                    <div class="order-actions">
                        <button class="order-action-btn">Help</button>
                        <button class="order-action-btn primary">Track Order</button>
                    </div>
                </div>
            </div>
        `).join('');
    };

    window.addToCartFromWishlist = (name) => {
        const productCard = Array.from(document.querySelectorAll('.product-card')).find(c => c.querySelector('h3').innerText === name);
        if (productCard) {
            productCard.querySelector('.add-to-cart-overlay').click();
        }
    };
}


// 8. Quick View Functionality
function initQuickView() {
    const qvOverlay = document.getElementById('quickview-overlay');
    const closeQV = document.getElementById('close-quickview');
    const productCards = document.querySelectorAll('.product-card');

    // QV Elements
    const qvMainImg = document.getElementById('qv-main-img');
    const qvThumb1 = document.getElementById('qv-thumb-1');
    const qvThumb2 = document.getElementById('qv-thumb-2');
    const qvTitle = document.getElementById('qv-title');
    const qvOldPrice = document.getElementById('qv-old-price');
    const qvNewPrice = document.getElementById('qv-new-price');
    const qvQtyInput = document.getElementById('qv-qty-input');
    const qvQtyMinus = document.getElementById('qv-qty-minus');
    const qvQtyPlus = document.getElementById('qv-qty-plus');
    const qvAddToCart = document.getElementById('qv-add-to-cart');
    const qvBuyNow = document.getElementById('qv-buy-now');
    const sizeBtns = document.querySelectorAll('.size-btn');
    const selectedSizeVal = document.getElementById('selected-size-val');

    let currentProduct = null;

    function openQV(card) {
        const name = card.querySelector('.add-to-cart-overlay').getAttribute('data-name');
        const price = card.querySelector('.add-to-cart-overlay').getAttribute('data-price');
        const image = card.querySelector('.add-to-cart-overlay').getAttribute('data-image');

        currentProduct = { name, price: parseInt(price), image };

        // Populate
        qvTitle.innerText = name;
        qvNewPrice.innerText = `₹${price}`;
        qvOldPrice.innerText = `₹${Math.round(price * 1.5)}`; // Demo old price
        qvMainImg.src = image;
        qvThumb1.src = image;
        qvThumb2.src = image; // For demo, same as main
        qvQtyInput.value = 1;

        // Reset Size Selection to 28
        sizeBtns.forEach(btn => btn.classList.remove('active'));
        const defaultSize = Array.from(sizeBtns).find(btn => btn.innerText === '28');
        if (defaultSize) {
            defaultSize.classList.add('active');
            selectedSizeVal.innerText = '28';
        }

        // Check wishlist status
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const isInWishlist = wishlist.some(item => item.name === name);
        const qvHeart = qvWishlistBtn.querySelector('i');
        if (isInWishlist) {
            qvHeart.classList.replace('fa-regular', 'fa-solid');
        } else {
            qvHeart.classList.replace('fa-solid', 'fa-regular');
        }

        qvOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (card && !e.target.classList.contains('add-to-cart-overlay') && !e.target.closest('.wishlist-btn')) {
            openQV(card);
        }
    });

    // Thumb switching
    const thumbs = [qvThumb1, qvThumb2];
    thumbs.forEach(thumb => {
        thumb.parentElement.addEventListener('click', () => {
            qvMainImg.src = thumb.src;
            // Update active state
            document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
            thumb.parentElement.classList.add('active');
        });
    });

    // Wishlist from QV
    const qvWishlistBtn = document.getElementById('qv-wishlist-btn');
    qvWishlistBtn.addEventListener('click', () => {
        if (!currentProduct) return;
        
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const index = wishlist.findIndex(item => item.name === currentProduct.name);
        
        if (index > -1) {
            wishlist.splice(index, 1);
            qvWishlistBtn.querySelector('i').classList.replace('fa-solid', 'fa-regular');
            showToast('Removed from wishlist');
        } else {
            wishlist.push(currentProduct);
            qvWishlistBtn.querySelector('i').classList.replace('fa-regular', 'fa-solid');
            showToast('Added to wishlist!');
        }
        
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        if (window.renderWishlist) window.renderWishlist();
        
        // Update home page hearts
        updateWishlistHearts();
    });

    closeQV.addEventListener('click', () => {
        qvOverlay.classList.remove('active');
        document.body.style.overflow = 'initial';
    });

    // Qty Logic
    qvQtyMinus.addEventListener('click', () => {
        let val = parseInt(qvQtyInput.value);
        if (val > 1) qvQtyInput.value = val - 1;
    });

    qvQtyPlus.addEventListener('click', () => {
        let val = parseInt(qvQtyInput.value);
        qvQtyInput.value = val + 1;
    });

    // Size Logic
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedSizeVal.innerText = btn.innerText;
        });
    });

    // Add to Cart from QV
    qvAddToCart.addEventListener('click', () => {
        if (!currentProduct) return;
        
        const qty = parseInt(qvQtyInput.value);
        const size = selectedSizeVal.innerText;
        
        // Use existing cart logic
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.name === currentProduct.name && item.size === size);
        
        if (existingItem) {
            existingItem.quantity += qty;
        } else {
            cart.push({ ...currentProduct, quantity: qty, size: size });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        if (window.updateCartUI) window.updateCartUI(true);
        
        qvOverlay.classList.remove('active');
        document.body.style.overflow = 'initial';
        showToast(`${currentProduct.name} (Size ${size}) added to cart!`);
    });

    // Buy Now from QV
    qvBuyNow.addEventListener('click', () => {
        if (!currentProduct) return;
        
        const qty = parseInt(qvQtyInput.value);
        const size = selectedSizeVal.innerText;
        
        // Add to cart first
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.name === currentProduct.name && item.size === size);
        
        if (!existingItem) {
            cart.push({ ...currentProduct, quantity: qty, size: size });
            localStorage.setItem('cart', JSON.stringify(cart));
            if (window.updateCartUI) window.updateCartUI(true);
        }
        
        qvOverlay.classList.remove('active');
        document.body.style.overflow = 'initial';
        
        // Open Cart directly
        document.getElementById('cart-sidebar').classList.add('active');
    });
}

// Initialize on load
window.addEventListener('load', () => {
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);
    // Load admin data on page load
    loadAdminData();
});

// ===== REAL-TIME ADMIN SYNC =====
function loadAdminData() {
    loadAdminHero();
    loadAdminOffers();
    loadAdminProducts();
    trackPageView();
}

function loadAdminHero() {
    const heroData = localStorage.getItem('tsg_hero');
    if (!heroData) return;
    const hero = JSON.parse(heroData);
    const heroSlider = document.querySelector('.hero-slider');
    if (!heroSlider || hero.length === 0) return;

    heroSlider.innerHTML = hero.map((slide, i) =>
        `<img src="${slide.url}" alt="${slide.alt}" class="hero-img ${i === 0 ? 'active' : ''}">`
    ).join('');

    // Re-init slider
    const newImgs = document.querySelectorAll('.hero-img');
    const newDots = document.querySelectorAll('.dot');
    let slideIdx = 0;

    // Update dots count
    const dotsContainer = document.querySelector('.slider-dots');
    if (dotsContainer) {
        dotsContainer.innerHTML = hero.map((_, i) =>
            `<span class="dot ${i === 0 ? 'active' : ''}"></span>`
        ).join('');

        dotsContainer.querySelectorAll('.dot').forEach((dot, idx) => {
            dot.addEventListener('click', () => {
                newImgs[slideIdx].classList.remove('active');
                dotsContainer.querySelectorAll('.dot')[slideIdx].classList.remove('active');
                slideIdx = idx;
                newImgs[slideIdx].classList.add('active');
                dotsContainer.querySelectorAll('.dot')[slideIdx].classList.add('active');
            });
        });
    }

    // Auto-slide
    if (window._heroInterval) clearInterval(window._heroInterval);
    window._heroInterval = setInterval(() => {
        if (newImgs.length === 0) return;
        newImgs[slideIdx].classList.remove('active');
        const allDots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];
        if (allDots[slideIdx]) allDots[slideIdx].classList.remove('active');
        slideIdx = (slideIdx + 1) % newImgs.length;
        newImgs[slideIdx].classList.add('active');
        if (allDots[slideIdx]) allDots[slideIdx].classList.add('active');
    }, 5000);
}

function loadAdminOffers() {
    const offersData = localStorage.getItem('tsg_offers');
    if (!offersData) return;
    const offers = JSON.parse(offersData);

    // Update offer circles
    const offerCards = document.querySelectorAll('.offer-card');
    if (offers.circles) {
        offers.circles.forEach((circle, i) => {
            if (offerCards[i]) {
                const inner = offerCards[i].querySelector('.offer-inner');
                if (inner) {
                    inner.querySelector('.small').textContent = circle.label;
                    inner.querySelector('.big').textContent = circle.title;
                    inner.querySelector('.medium').textContent = circle.subtitle;
                    inner.querySelector('.price-tag').textContent = '₹ ' + circle.price;
                }
                const info = offerCards[i].querySelector('.offer-info h3');
                if (info) info.textContent = circle.title + ' AT ₹' + circle.price;
                // Update link
                offerCards[i].href = 'shop.html?price=' + circle.price;
            }
        });
    }

    // Update marquee
    if (offers.marquee) {
        const marqueeContent = document.querySelector('.marquee-content');
        if (marqueeContent) {
            const icon = '<i class="fa-solid fa-fire" style="color: #ff4d00;"></i>';
            let html = '';
            for (let i = 0; i < 5; i++) {
                html += `<span>${icon} ${offers.marquee}</span>`;
            }
            marqueeContent.innerHTML = html;
        }
    }
}

function loadAdminProducts() {
    const productsData = localStorage.getItem('tsg_products');
    if (!productsData) return;
    const products = JSON.parse(productsData);
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;

    productGrid.innerHTML = products.map((p, i) => {
        const delay = (i % 3) + 1;
        const stockText = p.stock <= 0 ? '<span style="color:#ff4757;font-size:0.75rem;">Out of Stock</span>' : '';
        return `
        <div class="product-card reveal-scale delay-${delay}">
            <div class="product-image-container">
                <img src="${p.image}" alt="${p.name}">
                ${p.stock > 0 ? `<div class="add-to-cart-overlay" data-name="${p.name}" data-price="${p.price}" data-image="${p.image}">Add to Cart</div>` : '<div class="add-to-cart-overlay" style="background:#555;cursor:not-allowed;">Out of Stock</div>'}
            </div>
            <div class="product-info">
                <h3>${p.name}</h3>
                <p class="sizes">Sizes: ${p.sizes}</p>
                <div class="price-container">
                    <span class="current-price">₹${p.price}</span>
                    ${stockText}
                </div>
            </div>
        </div>`;
    }).join('');

    // Re-init reveal & wishlist for new product cards
    initReveal();
    if (typeof initWishlist === 'function') initWishlist();
}

function trackPageView() {
    const analytics = JSON.parse(localStorage.getItem('tsg_analytics') || '{"views":0,"cartAdds":0}');
    analytics.views = (analytics.views || 0) + 1;
    localStorage.setItem('tsg_analytics', JSON.stringify(analytics));
}

// Track cart adds for analytics
const origAddToCart = document.addEventListener;
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart-overlay') && e.target.textContent.trim() === 'Add to Cart') {
        const analytics = JSON.parse(localStorage.getItem('tsg_analytics') || '{"views":0,"cartAdds":0}');
        analytics.cartAdds = (analytics.cartAdds || 0) + 1;
        localStorage.setItem('tsg_analytics', JSON.stringify(analytics));
    }
});

// Save orders to admin panel format when order is placed
const origPlaceOrder = document.getElementById('place-order-btn');
if (origPlaceOrder) {
    origPlaceOrder.addEventListener('click', () => {
        setTimeout(() => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart.length === 0) return;

            // Capture shipping details
            const customerName = document.getElementById('ship-name')?.value || 'N/A';
            const email = document.getElementById('ship-email')?.value || '';
            const phone = document.getElementById('ship-phone')?.value || '';
            const address = document.getElementById('ship-address')?.value || '';
            const city = document.getElementById('ship-city')?.value || '';
            const state = document.getElementById('ship-state')?.value || '';
            const pincode = document.getElementById('ship-pincode')?.value || '';

            const totalQty = cart.reduce((s, item) => s + (item.quantity || 1), 0);
            const subtotal = cart.reduce((s, item) => s + (item.price * (item.quantity || 1)), 0);

            // Detect which combo offer was applied
            const offersData = localStorage.getItem('tsg_offers');
            let appliedOffer = 'None';
            let discount = 0;
            let finalTotal = subtotal;
            if (offersData) {
                const offers = JSON.parse(offersData);
                if (offers.combos && offers.combos.length > 0) {
                    // Sort combos by qty descending to apply best match first
                    const sorted = [...offers.combos].sort((a, b) => b.qty - a.qty);
                    for (const combo of sorted) {
                        if (totalQty >= combo.qty) {
                            appliedOffer = `Buy ${combo.qty} at ₹${combo.price}`;
                            finalTotal = combo.price;
                            discount = subtotal - combo.price;
                            break;
                        }
                    }
                }
            }

            const now = new Date();
            const orderId = 'TSG-' + Math.floor(1000 + Math.random() * 9000);

            const adminOrders = JSON.parse(localStorage.getItem('tsg_orders') || '[]');
            adminOrders.push({
                id: orderId,
                items: cart.map(item => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity || 1,
                    size: item.size || 'N/A',
                    image: item.image
                })),
                subtotal: subtotal,
                discount: discount,
                total: finalTotal,
                appliedOffer: appliedOffer,
                paymentMethod: 'Cash on Delivery',
                status: 'confirmed',
                totalQty: totalQty,
                date: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
                timestamp: now.toISOString(),
                customer: {
                    name: customerName,
                    email: email,
                    phone: phone,
                    address: address,
                    city: city,
                    state: state,
                    pincode: pincode,
                    fullAddress: `${address}, ${city}, ${state} - ${pincode}`
                }
            });
            localStorage.setItem('tsg_orders', JSON.stringify(adminOrders));
        }, 100);
    });
}

// Listen for real-time updates from admin panel
try {
    const channel = new BroadcastChannel('tsg_sync');
    channel.onmessage = (e) => {
        const { key } = e.data;
        if (key === 'hero') loadAdminHero();
        else if (key === 'offers') loadAdminOffers();
        else if (key === 'products') loadAdminProducts();
    };
} catch(e) {}

// Also listen for storage events (cross-tab)
window.addEventListener('storage', (e) => {
    if (e.key === 'tsg_hero') loadAdminHero();
    else if (e.key === 'tsg_offers') loadAdminOffers();
    else if (e.key === 'tsg_products') loadAdminProducts();
});

// Helper to update wishlist hearts after dynamic load
function updateWishlistHearts() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    document.querySelectorAll('.product-card').forEach(card => {
        const name = card.querySelector('h3')?.innerText;
        const btn = card.querySelector('.wishlist-btn i');
        if (btn && name) {
            if (wishlist.some(item => item.name === name)) {
                btn.classList.remove('fa-regular');
                btn.classList.add('fa-solid');
            }
        }
    });
}
