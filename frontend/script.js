const API_URL = "http://127.0.0.1:8000";

let products = [];
let cart = [];

let currentFilter = "all";
let currentSort = "default";


// DOM ELEMENTS

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const filters = document.getElementById("filters");
const sortSelect = document.getElementById("sortSelect");

const cartToggleBtn = document.getElementById("cartToggleBtn");
const cartOverlay = document.getElementById("cartOverlay");
const cartDrawer = document.getElementById("cartDrawer");
const closeCartBtn = document.getElementById("closeCartBtn");

const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navLinks = document.getElementById("navLinks");


// LOAD PRODUCTS

async function loadProducts() {
    try {
        productGrid.innerHTML = `
            <p style="grid-column:1/-1;text-align:center;">
                Loading products...
            </p>
        `;

        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        products = await response.json();

        renderProducts();

    } catch (error) {
        console.error("Error:", error);

        productGrid.innerHTML = `
            <p style="grid-column:1/-1;text-align:center;">
                Unable to load products.
                <br>
                Make sure FastAPI and MCP server are running.
            </p>
        `;
    }
}


// RENDER PRODUCTS

function renderProducts() {

    let result = [...products];

    const search = searchInput.value.trim().toLowerCase();

    if (search) {
        result = result.filter(product =>
            product.product_name.toLowerCase().includes(search) ||
            (product.category || "").toLowerCase().includes(search)
        );
    }

    if (currentFilter === "under-1000") {
        result = result.filter(
            product => Number(product.price) < 1000
        );
    }

    else if (currentFilter === "1000-2000") {
        result = result.filter(
            product =>
                Number(product.price) >= 1000 &&
                Number(product.price) <= 2000
        );
    }

    else if (currentFilter === "above-2000") {
        result = result.filter(
            product => Number(product.price) > 2000
        );
    }

    if (currentSort === "price-asc") {
        result.sort(
            (a, b) => Number(a.price) - Number(b.price)
        );
    }

    else if (currentSort === "price-desc") {
        result.sort(
            (a, b) => Number(b.price) - Number(a.price)
        );
    }

    else if (currentSort === "name-asc") {
        result.sort(
            (a, b) =>
                a.product_name.localeCompare(b.product_name)
        );
    }

    if (result.length === 0) {
        productGrid.innerHTML = `
            <p style="grid-column:1/-1;text-align:center;">
                No products found.
            </p>
        `;
        return;
    }

    productGrid.innerHTML = result
        .map(product => createProductCard(product))
        .join("");
}


// PRODUCT CARD

function createProductCard(product) {

    const price = Number(product.price);
    const stock = Number(product.stock);

    let stockText;
    let stockClass;

    if (stock === 0) {
        stockText = "Out of Stock";
        stockClass = "out-of-stock";
    }

    else if (stock <= 5) {
        stockText = `Only ${stock} left`;
        stockClass = "low-stock";
    }

    else {
        stockText = "In Stock";
        stockClass = "in-stock";
    }

    return `
        <div class="product-card">

            <div class="product-image">

                <i class="${getProductIcon(
                    product.category,
                    product.product_name
                )}"></i>

                <span class="product-status-badge ${stockClass}">
                    ${stockText}
                </span>

            </div>

            <div class="product-info">

                <h3 class="product-name">
                    ${escapeHTML(product.product_name)}
                </h3>

                <p class="product-category">
                    ${escapeHTML(product.category || "General")}
                </p>

                <div class="product-bottom">

                    <span class="product-price">
                        ₹${price.toLocaleString("en-IN")}
                    </span>

                    <button
                        class="add-to-cart-btn"
                        data-product-id="${product.product_id}"
                        ${stock === 0 ? "disabled" : ""}
                    >
                        <i class="fas fa-cart-plus"></i>
                        Add to Cart
                    </button>

                </div>

            </div>

        </div>
    `;
}


// PRODUCT ICON

function getProductIcon(category, name) {

    const text =
        `${category || ""} ${name || ""}`.toLowerCase();

    if (text.includes("earbud") || text.includes("headset")) {
        return "fas fa-headphones";
    }

    if (text.includes("keyboard")) {
        return "fas fa-keyboard";
    }

    if (text.includes("mouse")) {
        return "fas fa-computer-mouse";
    }

    if (text.includes("speaker")) {
        return "fas fa-volume-high";
    }

    if (text.includes("watch")) {
        return "fas fa-clock";
    }

    if (text.includes("charger")) {
        return "fas fa-bolt";
    }

    if (text.includes("power bank")) {
        return "fas fa-battery-full";
    }

    if (text.includes("webcam")) {
        return "fas fa-video";
    }

    if (text.includes("usb")) {
        return "fas fa-usb";
    }

    if (text.includes("backpack")) {
        return "fas fa-bag-shopping";
    }

    if (text.includes("ssd") || text.includes("drive")) {
        return "fas fa-hard-drive";
    }

    if (text.includes("stand")) {
        return "fas fa-laptop";
    }

    return "fas fa-box";
}


// ADD TO CART

function addToCart(productId) {

    const product = products.find(
        product =>
            Number(product.product_id) === Number(productId)
    );

    if (!product) {
        return;
    }

    const stock = Number(product.stock);

    if (stock <= 0) {
        alert("Product is out of stock.");
        return;
    }

    const existingItem = cart.find(
        item =>
            Number(item.product_id) === Number(productId)
    );

    if (existingItem) {

        if (existingItem.quantity >= stock) {
            alert("Maximum stock reached.");
            return;
        }

        existingItem.quantity++;
    }

    else {

        cart.push({
            product_id: product.product_id,
            product_name: product.product_name,
            price: Number(product.price),
            quantity: 1,
            stock: stock
        });
    }

    updateCart();
}


// UPDATE CART

function updateCart() {

    renderCart();

    const itemCount = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const total = cart.reduce(
        (total, item) =>
            total + item.price * item.quantity,
        0
    );

    cartCount.textContent = itemCount;

    cartTotal.textContent =
        `₹${total.toLocaleString("en-IN")}`;
}


// RENDER CART

function renderCart() {

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div style="text-align:center;padding:30px;">
                <i class="fas fa-cart-shopping"
                   style="font-size:40px;margin-bottom:15px;">
                </i>

                <h4>Your cart is empty</h4>

                <p>Add products to your cart.</p>
            </div>
        `;

        return;
    }

    cartItems.innerHTML = cart.map(item => {

        const total = item.price * item.quantity;

        return `
            <div class="cart-item">

                <div class="cart-item-info">

                    <h4>
                        ${escapeHTML(item.product_name)}
                    </h4>

                    <p>
                        ₹${item.price.toLocaleString("en-IN")}
                    </p>

                </div>

                <div class="cart-item-actions">

                    <button
                        class="quantity-btn"
                        data-action="decrease"
                        data-id="${item.product_id}">
                        -
                    </button>

                    <span>${item.quantity}</span>

                    <button
                        class="quantity-btn"
                        data-action="increase"
                        data-id="${item.product_id}">
                        +
                    </button>

                    <button
                        class="remove-btn"
                        data-action="remove"
                        data-id="${item.product_id}">
                        <i class="fas fa-trash"></i>
                    </button>

                </div>

                <div class="cart-item-total">
                    ₹${total.toLocaleString("en-IN")}
                </div>

            </div>
        `;

    }).join("");
}


// CART BUTTON ACTIONS

cartItems.addEventListener("click", event => {

    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    const productId = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === "increase") {
        increaseQuantity(productId);
    }

    else if (action === "decrease") {
        decreaseQuantity(productId);
    }

    else if (action === "remove") {
        removeFromCart(productId);
    }
});


// PRODUCT BUTTON ACTIONS

productGrid.addEventListener("click", event => {

    const button = event.target.closest(".add-to-cart-btn");

    if (!button) {
        return;
    }

    const productId = Number(button.dataset.productId);

    addToCart(productId);
});


// INCREASE QUANTITY

function increaseQuantity(productId) {

    const item = cart.find(
        item =>
            Number(item.product_id) === Number(productId)
    );

    if (!item) {
        return;
    }

    if (item.quantity >= item.stock) {
        alert("Maximum stock reached.");
        return;
    }

    item.quantity++;

    updateCart();
}


// DECREASE QUANTITY

function decreaseQuantity(productId) {

    const item = cart.find(
        item =>
            Number(item.product_id) === Number(productId)
    );

    if (!item) {
        return;
    }

    item.quantity--;

    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    updateCart();
}


// REMOVE FROM CART

function removeFromCart(productId) {

    cart = cart.filter(
        item =>
            Number(item.product_id) !== Number(productId)
    );

    updateCart();
}


// SEARCH

searchInput.addEventListener("input", () => {
    renderProducts();
});


// FILTER

filters.addEventListener("click", event => {

    const button = event.target.closest(".filter-btn");

    if (!button) {
        return;
    }

    document
        .querySelectorAll(".filter-btn")
        .forEach(btn => {
            btn.classList.remove("active");
        });

    button.classList.add("active");

    currentFilter = button.dataset.filter;

    renderProducts();
});


// SORT

sortSelect.addEventListener("change", event => {

    currentSort = event.target.value;

    renderProducts();
});


// OPEN CART

cartToggleBtn.addEventListener("click", () => {

    cartDrawer.classList.add("open");
    cartOverlay.classList.add("open");

    document.body.style.overflow = "hidden";
});


// CLOSE CART

closeCartBtn.addEventListener("click", () => {

    cartDrawer.classList.remove("open");
    cartOverlay.classList.remove("open");

    document.body.style.overflow = "";
});


// CLOSE CART BY OVERLAY

cartOverlay.addEventListener("click", () => {

    cartDrawer.classList.remove("open");
    cartOverlay.classList.remove("open");

    document.body.style.overflow = "";
});


// MOBILE MENU

mobileMenuBtn.addEventListener("click", () => {

    navLinks.classList.toggle("mobile-open");
});


// CLOSE MOBILE MENU

document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", () => {
        navLinks.classList.remove("mobile-open");
    });

});


// CHECKOUT

const checkoutButton =
    document.querySelector(".btn-checkout");

checkoutButton.addEventListener("click", () => {

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    alert("Checkout functionality will be added next.");
});


// ESCAPE HTML

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// START APPLICATION

loadProducts();
updateCart();