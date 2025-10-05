// STORAGE HELPERS 
function loadData(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}

function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    alert("Storage limit reached. Please delete old data.");
  }
}

// DASHBOARD 
function updateDashboard() {
  const products = loadData("products");
  const sales = loadData("sales");

  let productCount = products.reduce((sum, p) => sum + p.qty, 0);

  let totalSales = 0;
  let totalDebts = 0;
  sales.forEach(s => {
    totalSales += s.paid || 0;
    if (s.debt) totalDebts += s.paid || 0;
  });

  const prodEl = document.getElementById("total-products");
  const salesEl = document.getElementById("total-sales");
  const debtEl = document.getElementById("total-debts");

  if (prodEl) prodEl.textContent = productCount;
  if (salesEl) salesEl.textContent = `$${totalSales.toFixed(2)}`;
  if (debtEl) debtEl.textContent = `$${totalDebts.toFixed(2)}`;
}

//  PRODUCTS STORAGE 
function loadProducts() {
  return JSON.parse(localStorage.getItem("products") || "[]");
}
function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}

//  RENDER PRODUCTS
function renderProducts() {
  const products = loadProducts();
  const tbody = document.getElementById("products-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  products.forEach((product, i) => {
    const tr = document.createElement("tr");

    const imgTd = document.createElement("td");
    if (product.img) {
      imgTd.innerHTML = `<img src="${product.img}" width="50" height="50" style="border-radius:6px;">`;
    } else {
      imgTd.textContent = "—";
    }
    tr.appendChild(imgTd);

    tr.innerHTML += `
      <td>${product.name}</td>
      <td>${product.qty}</td>
      <td>$${product.price}</td>
      <td>
        <button onclick="editProduct(${i})">✏️ Edit</button>
        <button onclick="deleteProduct(${i})">🗑 Delete</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

//  ADD PRODUCT 
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();

  const form = document.getElementById("product-form");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const name = document.getElementById("product-name").value;
      const qty = Number(document.getElementById("product-qty").value);
      const price = Number(document.getElementById("product-price").value);
      const file = document.getElementById("product-img").files[0];

      if (file) {
        compressImage(file, (tiny) => {
          saveNewProduct(name, qty, price, tiny);
          form.reset();
        });
      } else {
        saveNewProduct(name, qty, price, "");
        form.reset();
      }
    });
  }

  // SEARCH
  const search = document.getElementById("search-products");
  if (search) {
    search.addEventListener("input", () => {
      const term = search.value.toLowerCase();
      const rows = document.querySelectorAll("#products-body tr");
      rows.forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(term) ? "" : "none";
      });
    });
  }
});

function saveNewProduct(name, qty, price, img) {
  const products = loadProducts();
  products.push({ name, qty, price, img });
  saveProducts(products);
  renderProducts();
}

// ---- EDIT PRODUCT ----
function editProduct(index) {
  const products = loadProducts();
  const p = products[index];
  document.getElementById("product-name").value = p.name;
  document.getElementById("product-qty").value = p.qty;
  document.getElementById("product-price").value = p.price;

  deleteProduct(index);
}

//  DELETE PRODUCT 
function deleteProduct(index) {
  const products = loadProducts();
  products.splice(index, 1);
  saveProducts(products);
  renderProducts();
}


// SALES
function loadSales() {
  return JSON.parse(localStorage.getItem("sales") || "[]");
}
function saveSales(sales) {
  localStorage.setItem("sales", JSON.stringify(sales));
}

// IMAGE COMPRESSOR
function compressImage(file, callback) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const MAX = 200;
      let w = img.width, h = img.height;
      if (w > h && w > MAX) { h *= MAX / w; w = MAX; }
      else if (h > MAX) { w *= MAX / h; h = MAX; }
      canvas.width = w; canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
// RENDER SALES
function renderSales() {
  const sales = loadSales();
  const tbody = document.getElementById("sales-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  sales.forEach((sale, i) => {
    const tr = document.createElement("tr");

    // image
    const imgTd = document.createElement("td");
    if (sale.img) {
      imgTd.innerHTML = `<img src="${sale.img}" width="50" height="50" style="border-radius:6px;">`;
    } else {
      imgTd.textContent = "—";
    }

    tr.appendChild(imgTd);
    tr.innerHTML += `
      <td>${sale.name}</td>
      <td>${sale.qty}</td>
      <td>$${sale.paid}</td>
      <td>${sale.debt ? "Debt" : "Paid"}</td>
      <td>
        <button onclick="editSale(${i})">✏️ Edit</button>
        <button onclick="deleteSale(${i})">🗑 Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

//  ADD SALE
document.addEventListener("DOMContentLoaded", () => {
  renderSales();

  const form = document.getElementById("sale-form");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const name = document.getElementById("sale-name").value;
      const qty = Number(document.getElementById("sale-qty").value);
      const paid = Number(document.getElementById("sale-paid").value);
      const debt = document.getElementById("sale-debt").checked;
      const file = document.getElementById("sale-img").files[0];

      if (file) {
        compressImage(file, (tiny) => {
          saveNewSale(name, qty, paid, debt, tiny);
          form.reset();
        });
      } else {
        saveNewSale(name, qty, paid, debt, "");
        form.reset();
      }
    });
  }

  // SEARCH
  const search = document.getElementById("search-sales");
  if (search) {
    search.addEventListener("input", () => {
      const term = search.value.toLowerCase();
      const rows = document.querySelectorAll("#sales-body tr");
      rows.forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(term) ? "" : "none";
      });
    });
  }
});

function saveNewSale(name, qty, paid, debt, img) {
  const sales = loadSales();
  sales.push({ name, qty, paid, debt, img });
  saveSales(sales);
  renderSales();
}

// EDIT
function editSale(index) {
  const sales = loadSales();
  const sale = sales[index];
  document.getElementById("sale-name").value = sale.name;
  document.getElementById("sale-qty").value = sale.qty;
  document.getElementById("sale-paid").value = sale.paid;
  document.getElementById("sale-debt").checked = sale.debt;

  deleteSale(index); 
}

//  DELETE
function deleteSale(index) {
  const sales = loadSales();
  sales.splice(index, 1);
  saveSales(sales);
  renderSales();
}


// REPORTS
function renderReport() {
  const sales = loadData("sales");
  const aiBox = document.getElementById("ai-output");
  const ctx = document.getElementById("salesChart");

  if (aiBox) {
    let total = sales.reduce((sum, s) => sum + (s.paid || 0), 0);
    let debts = sales.filter(s => s.debt).length;

    aiBox.textContent = 
     debts > 500 
      ? "⚠️ Too many debts! Consider stricter policies." 
      : total-sales > 1000 
        ? "💰 Great sales performance! Keep up the good work." 
        : "📊 Sales are steady, but there’s room to grow.";
    
  }

  if (ctx && window.Chart) {
    let daily = {};
    sales.forEach(s => {
      let day = new Date().toLocaleDateString();
      daily[day] = (daily[day] || 0) + (s.paid || 0);
    });

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(daily),
        datasets: [{
          label: "Sales ($)",
          data: Object.values(daily),
          backgroundColor: "rgba(0, 123, 255, 0.7)"
        }]
      }
    });
  }
}

// INIT
document.addEventListener("DOMContentLoaded", () => {
  updateDashboard();
  renderProducts();
  renderSales();
  renderReport();
});
