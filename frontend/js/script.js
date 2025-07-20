// Ensure invoiceItems is declared at the top level and only once
let invoiceItems = [];

function showSection(sectionName) {
    console.log('Switching to section:', sectionName);
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the selected section
    document.getElementById(sectionName).classList.add('active');
    
    // If switching to invoices, always initialize the form and list
    if (sectionName === 'invoices') {
        initializeInvoiceForm();
        initializeInvoiceList();
    }
}

window.showSection = showSection;

// Customer form functionality
document.addEventListener('DOMContentLoaded', function() {
    const customerForm = document.getElementById('customerForm');
    
    if (customerForm) {
        customerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.querySelector('#customerForm button[type="submit"]');
            const isEditMode = submitBtn.dataset.editMode === 'true';
            
            // Get form data
            const formData = {
                name: document.getElementById('customerName').value,
                phone: document.getElementById('customerPhone').value,
                address: document.getElementById('customerAddress').value,
                city: document.getElementById('customerCity').value,
                state: document.getElementById('customerState').value,
                zip: parseInt(document.getElementById('customerZip').value) || 0
            };
            
            try {
                let response;
                
                if (isEditMode) {
                    // Update existing customer
                    response = await fetch(`http://localhost:3000/api/customers/phone/${submitBtn.dataset.editPhone}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });
                } else {
                    // Add new customer
                    response = await fetch('http://localhost:3000/api/customers', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });
                }
                
                if (response.ok) {
                    const customer = await response.json();
                    alert(isEditMode ? 'Customer updated successfully!' : 'Customer added successfully!');
                    customerForm.reset();
                    
                    // Reset button to add mode
                    submitBtn.textContent = 'Add Customer';
                    delete submitBtn.dataset.editMode;
                    delete submitBtn.dataset.editPhone;
                    
                    // Reload customer list
                    document.getElementById('loadCustomersBtn').click();
                } else {
                    const error = await response.json();
                    alert('Error: ' + error.message);
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
    }
});

// Load customers functionality
document.addEventListener('DOMContentLoaded', function() {
    const loadCustomersBtn = document.getElementById('loadCustomersBtn');
    const searchCustomerBtn = document.getElementById('searchCustomerBtn');
    const customerSearchInput = document.getElementById('customerSearchInput');
    const customerList = document.getElementById('customerList');
    
    // Function to display customers
    function displayCustomers(customers) {
        customerList.innerHTML = '';
        
        if (customers.length === 0) {
            customerList.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No customers found.</p>';
            return;
        }
        
        customers.forEach(customer => {
            const customerItem = document.createElement('div');
            customerItem.className = 'customer-item';
            customerItem.innerHTML = `
                <h4>${customer.name}</h4>
                <div class="customer-details">
                    <div><span>Phone:</span> ${customer.phone}</div>
                    <div><span>Address:</span> ${customer.address || 'N/A'}</div>
                    <div><span>City:</span> ${customer.city || 'N/A'}</div>
                    <div><span>State:</span> ${customer.state || 'N/A'}</div>
                    <div><span>ZIP:</span> ${customer.zip || 'N/A'}</div>
                </div>
                <div class="customer-actions">
                    <button class="action-btn edit-btn" onclick="editCustomer('${customer.phone}')">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteCustomer('${customer.phone}')">Delete</button>
                </div>
            `;
            customerList.appendChild(customerItem);
        });
    }
    
    // Load all customers
    if (loadCustomersBtn && customerList) {
        loadCustomersBtn.addEventListener('click', async function() {
            try {
                const response = await fetch('http://localhost:3000/api/customers');
                const customers = await response.json();
                displayCustomers(customers);
            } catch (error) {
                alert('Error loading customers: ' + error.message);
            }
        });
    }
    
    // Search customer by phone number
    if (searchCustomerBtn && customerSearchInput && customerList) {
        searchCustomerBtn.addEventListener('click', async function() {
            const phoneNumber = customerSearchInput.value.trim();
            
            if (!phoneNumber) {
                alert('Please enter a phone number to search.');
                return;
            }
            
            try {
                const response = await fetch(`http://localhost:3000/api/customers/phone/${phoneNumber}`);
                
                if (response.ok) {
                    const customer = await response.json();
                    displayCustomers([customer]); // Display single customer
                } else if (response.status === 404) {
                    customerList.innerHTML = '<p style="text-align: center; color: #dc3545; font-style: italic;">Customer not found with this phone number.</p>';
                } else {
                    const error = await response.json();
                    alert('Error: ' + error.message);
                }
            } catch (error) {
                alert('Error searching customer: ' + error.message);
            }
        });
        
        // Allow search on Enter key press
        customerSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchCustomerBtn.click();
            }
        });
    }
});

// Edit customer function
async function editCustomer(phone) {
    try {
        // Get customer data
        const response = await fetch(`http://localhost:3000/api/customers/phone/${phone}`);
        const customer = await response.json();
        
        // Fill the form with customer data
        document.getElementById('customerName').value = customer.name;
        document.getElementById('customerPhone').value = customer.phone;
        document.getElementById('customerAddress').value = customer.address || '';
        document.getElementById('customerCity').value = customer.city || '';
        document.getElementById('customerState').value = customer.state || '';
        document.getElementById('customerZip').value = customer.zip || '';
        
        // Change form button text
        const submitBtn = document.querySelector('#customerForm button[type="submit"]');
        submitBtn.textContent = 'Update Customer';
        submitBtn.dataset.editMode = 'true';
        submitBtn.dataset.editPhone = phone;
        
        // Scroll to form
        document.getElementById('customers').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        alert('Error loading customer data: ' + error.message);
    }
}

// Delete customer function
async function deleteCustomer(phone) {
    if (confirm('Are you sure you want to delete this customer?')) {
        try {
            const response = await fetch(`http://localhost:3000/api/customers/phone/${phone}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                alert('Customer deleted successfully!');
                // Reload the customer list
                document.getElementById('loadCustomersBtn').click();
            } else {
                const error = await response.json();
                alert('Error: ' + error.message);
            }
        } catch (error) {
            alert('Error deleting customer: ' + error.message);
        }
    }
}

// Product form functionality
document.addEventListener('DOMContentLoaded', function() {
    const productForm = document.getElementById('productForm');
    
    if (productForm) {
        productForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.querySelector('#productForm button[type="submit"]');
            const isEditMode = submitBtn.dataset.editMode === 'true';
            
            // Get form data
            const formData = {
                name: document.getElementById('productName').value,
                barcode: document.getElementById('productBarcode').value,
                price: parseFloat(document.getElementById('productPrice').value),
                quantity: parseInt(document.getElementById('productQuantity').value),
                size: document.getElementById('productSize').value,
                category: document.getElementById('productCategory').value,
                supplier: document.getElementById('productSupplier').value
            };
            
            try {
                let response;
                
                if (isEditMode) {
                    // Update existing product
                    response = await fetch(`http://localhost:3000/api/products/barcode/${submitBtn.dataset.editBarcode}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });
                } else {
                    // Add new product
                    response = await fetch('http://localhost:3000/api/products', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });
                }
                
                if (response.ok) {
                    const product = await response.json();
                    alert(isEditMode ? 'Product updated successfully!' : 'Product added successfully!');
                    productForm.reset();
                    
                    // Reset button to add mode
                    submitBtn.textContent = 'Add Product';
                    delete submitBtn.dataset.editMode;
                    delete submitBtn.dataset.editBarcode;
                    
                    // Reload product list
                    document.getElementById('loadProductsBtn').click();
                } else {
                    const error = await response.json();
                    alert('Error: ' + error.message);
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
    }
});

// Load products functionality
document.addEventListener('DOMContentLoaded', function() {
    const loadProductsBtn = document.getElementById('loadProductsBtn');
    const productList = document.getElementById('productList');
    
    if (loadProductsBtn && productList) {
        loadProductsBtn.addEventListener('click', async function() {
            try {
                const response = await fetch('http://localhost:3000/api/products');
                const products = await response.json();
                
                productList.innerHTML = '';
                
                products.forEach(product => {
                    const productItem = document.createElement('div');
                    productItem.className = 'product-item';
                    productItem.innerHTML = `
                        <h4>${product.name}</h4>
                        <div class="product-details">
                            <div><span>Barcode:</span> ${product.barcode}</div>
                            <div><span>Category:</span> ${product.category}</div>
                            <div><span>Size:</span> ${product.size}</div>
                            <div><span>Quantity:</span> ${product.quantity}</div>
                            <div><span>Supplier:</span> ${product.supplier || 'N/A'}</div>
                        </div>
                        <div class="product-price-info">
                            <div class="price-breakdown">
                                <div class="price-item base-price">
                                    <div>Base Price</div>
                                    <div>₹${product.price}</div>
                                </div>
                                <div class="price-item gst-amount">
                                    <div>GST (${product.price < 1000 ? '5%' : '12%'})</div>
                                    <div>₹${product.gstAmount}</div>
                                </div>
                                <div class="price-item total-price">
                                    <div>Total Price</div>
                                    <div>₹${product.priceAfterGST}</div>
                                </div>
                            </div>
                        </div>
                        <div class="customer-actions">
                            <button class="action-btn edit-btn" onclick="editProduct('${product.barcode}')">Edit</button>
                            <button class="action-btn delete-btn" onclick="deleteProduct('${product.barcode}')">Delete</button>
                        </div>
                    `;
                    productList.appendChild(productItem);
                });
            } catch (error) {
                alert('Error loading products: ' + error.message);
            }
        });
    }
});

// Edit product function
async function editProduct(barcode) {
    try {
        // Get product data
        const response = await fetch(`http://localhost:3000/api/products/barcode/${barcode}`);
        const product = await response.json();
        
        // Fill the form with product data
        document.getElementById('productName').value = product.name;
        document.getElementById('productBarcode').value = product.barcode;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productQuantity').value = product.quantity;
        document.getElementById('productSize').value = product.size;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productSupplier').value = product.supplier || '';
        
        // Change form button text
        const submitBtn = document.querySelector('#productForm button[type="submit"]');
        submitBtn.textContent = 'Update Product';
        submitBtn.dataset.editMode = 'true';
        submitBtn.dataset.editBarcode = barcode;
        
        // Scroll to form
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        alert('Error loading product data: ' + error.message);
    }
}

// Delete product function
async function deleteProduct(barcode) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const response = await fetch(`http://localhost:3000/api/products/barcode/${barcode}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                alert('Product deleted successfully!');
                // Reload the product list
                document.getElementById('loadProductsBtn').click();
            } else {
                const error = await response.json();
                alert('Error: ' + error.message);
            }
        } catch (error) {
            alert('Error deleting product: ' + error.message);
        }
    }
}

// Invoice Management JavaScript
// --- Invoice Customer Search & Add Logic ---
let selectedInvoiceCustomer = null;

function renderInvoiceCustomerDetails(customer) {
    const detailsDiv = document.getElementById('invoiceCustomerDetails');
    if (customer) {
        detailsDiv.innerHTML = `<b>Selected Customer:</b><br>Name: ${customer.name}<br>Phone: ${customer.phone}<br>Address: ${customer.address || ''}, ${customer.city || ''}, ${customer.state || ''} ${customer.zip || ''}`;
        detailsDiv.classList.add('active');
    } else {
        detailsDiv.innerHTML = '';
        detailsDiv.classList.remove('active');
    }
}

function renderInvoiceAddCustomerForm(phone) {
    const formDiv = document.getElementById('invoiceAddCustomerForm');
    const addCustomerOnlyBtn = document.getElementById('addCustomerOnlyBtn');
    formDiv.style.display = 'block';
    addCustomerOnlyBtn.style.display = 'block';
    formDiv.innerHTML = `
        <form id="addCustomerInlineForm">
            <label for="addCustomerName">Name:</label>
            <input type="text" id="addCustomerName" name="name" required>
            <label for="addCustomerAddress">Address:</label>
            <input type="text" id="addCustomerAddress" name="address">
            <label for="addCustomerCity">City:</label>
            <input type="text" id="addCustomerCity" name="city">
            <label for="addCustomerState">State:</label>
            <input type="text" id="addCustomerState" name="state">
            <label for="addCustomerZip">ZIP:</label>
            <input type="number" id="addCustomerZip" name="zip">
            <input type="hidden" id="addCustomerPhone" name="phone" value="${phone}">
            <button type="submit">Add Customer</button>
        </form>
        <div id="addCustomerSuccessMsg" style="display:none; color: #388e3c; font-weight: bold; margin-top: 10px;"></div>
        <button id="addAnotherCustomerBtn" style="display:none; margin-top: 10px; background:#007bff; color:white; border:none; border-radius:4px; padding:8px 16px; font-weight:bold; cursor:pointer;">Add Another Customer</button>
    `;
    document.getElementById('invoiceCustomerDetails').classList.remove('active');
    
    // Add submit handler
    document.getElementById('addCustomerInlineForm').onsubmit = async function(e) {
        e.preventDefault();
        await addCustomerFromForm(phone, false); // false = don't create invoice
    };
    
    // Add handler for 'Add Another Customer' button
    document.getElementById('addAnotherCustomerBtn').onclick = function() {
        // Reset phone input and form for new entry
        document.getElementById('invoiceCustomerPhone').value = '';
        formDiv.style.display = 'none';
        addCustomerOnlyBtn.style.display = 'none';
        renderInvoiceCustomerDetails(null);
        selectedInvoiceCustomer = null;
        document.getElementById('invoiceCustomerPhone').focus();
    };
}

// Function to add customer from form (can be used for both invoice and customer-only)
async function addCustomerFromForm(phone, createInvoiceAfter = false) {
    const form = document.getElementById('addCustomerInlineForm');
    const data = {
        name: form.name.value,
        phone: phone,
        address: form.address.value,
        city: form.city.value,
        state: form.state.value,
        zip: form.zip.value
    };
    
    try {
        const response = await fetch('http://localhost:3000/api/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            const newCustomer = await response.json();
            selectedInvoiceCustomer = newCustomer;
            renderInvoiceCustomerDetails(newCustomer);
            
            // Show success message and 'Add Another Customer' button
            document.getElementById('addCustomerSuccessMsg').textContent = 'Customer added successfully!';
            document.getElementById('addCustomerSuccessMsg').style.display = 'block';
            document.getElementById('addAnotherCustomerBtn').style.display = 'inline-block';
            form.style.display = 'none';
            
            if (createInvoiceAfter) {
                // If this was called from invoice creation, continue with invoice
                return true;
            } else {
                // If this was customer-only, show success and reset
                alert('Customer added successfully! You can now create an invoice or add another customer.');
                return true;
            }
        } else {
            const err = await response.json();
            alert('Error: ' + err.message);
            return false;
        }
    } catch (err) {
        alert('Error: ' + err.message);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Add Customer Only button handler
    const addCustomerOnlyBtn = document.getElementById('addCustomerOnlyBtn');
    if (addCustomerOnlyBtn) {
        addCustomerOnlyBtn.addEventListener('click', async function() {
            const phoneInput = document.getElementById('invoiceCustomerPhone');
            const phone = phoneInput.value.trim();
            
            if (!phone) {
                alert('Please enter a phone number first.');
                return;
            }
            
            // Check if customer already exists
            try {
                const response = await fetch(`http://localhost:3000/api/customers/phone/${phone}`);
                if (response.ok) {
                    alert('Customer with this phone number already exists!');
                    return;
                }
            } catch (err) {
                // Customer doesn't exist, proceed with adding
            }
            
            // Show the add customer form
            renderInvoiceAddCustomerForm(phone);
        });
    }
    
    const searchBtn = document.getElementById('searchInvoiceCustomerBtn');
    const phoneInput = document.getElementById('invoiceCustomerPhone');
    if (searchBtn && phoneInput) {
        searchBtn.addEventListener('click', async function() {
            const phone = phoneInput.value.trim();
            if (!phone) {
                alert('Please enter a phone number.');
                return;
            }
            try {
                const response = await fetch(`http://localhost:3000/api/customers/phone/${phone}`);
                if (response.ok) {
                    const customer = await response.json();
                    selectedInvoiceCustomer = customer;
                    renderInvoiceCustomerDetails(customer);
                    document.getElementById('invoiceAddCustomerForm').style.display = 'none';
                    document.getElementById('addCustomerOnlyBtn').style.display = 'none';
                } else {
                    selectedInvoiceCustomer = null;
                    renderInvoiceCustomerDetails(null);
                    renderInvoiceAddCustomerForm(phone);
                }
            } catch (err) {
                selectedInvoiceCustomer = null;
                renderInvoiceCustomerDetails(null);
                renderInvoiceAddCustomerForm(phone);
            }
        });
        // Allow Enter key to trigger search
        phoneInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }
});

// Initialize invoice form
async function initializeInvoiceForm() {
    const invoiceForm = document.getElementById('invoiceForm');
    const addItemBtn = document.getElementById('addItemBtn');
    const addBarcodeItemBtn = document.getElementById('addBarcodeItemBtn');
    const discountPercentInput = document.getElementById('discountPercent');
    
    if (invoiceForm) {
        // Set default date to today
        document.getElementById('invoiceDate').value = new Date().toISOString().split('T')[0];
        
        // Load customers and products for dropdowns
        await loadCustomersForInvoice();
        await loadProductsForInvoice();
        
        // Add item button functionality
        if (addItemBtn) {
            addItemBtn.addEventListener('click', addItemToInvoice);
        }
        
        // Add barcode item button functionality
        if (addBarcodeItemBtn) {
            addBarcodeItemBtn.addEventListener('click', addBarcodeItemToInvoice);
        }
        
        // Barcode input functionality
        const barcodeInput = document.getElementById('barcodeInput');
        if (barcodeInput) {
            barcodeInput.addEventListener('input', searchProductByBarcode);
            barcodeInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addBarcodeItemToInvoice();
                }
            });
        }
        
        // Discount percentage change handler
        if (discountPercentInput) {
            discountPercentInput.addEventListener('input', updateInvoiceTotals);
        }
        
        // Form submit handler
        invoiceForm.addEventListener('submit', createInvoice);
    }
}

// Load customers for invoice dropdown
async function loadCustomersForInvoice() {
    try {
        const response = await fetch('http://localhost:3000/api/customers');
        customers = await response.json();
        
        const customerSelect = document.getElementById('invoiceCustomer');
        customerSelect.innerHTML = '<option value="">Select a customer...</option>';
        
        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer._id;
            option.textContent = `${customer.name} (${customer.phone})`;
            customerSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

// Load products for invoice dropdown
async function loadProductsForInvoice() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        products = await response.json();
        
        const productSelect = document.getElementById('productSelect');
        productSelect.innerHTML = '';
        if (!products || products.length === 0) {
            productSelect.innerHTML = '<option value="">No products available</option>';
            return;
        }
        productSelect.innerHTML = '<option value="">Select a product...</option>';
        
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product._id;
            option.textContent = `${product.name} - ₹${product.priceAfterGST} (${product.barcode})`;
            option.dataset.product = JSON.stringify(product);
            productSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Show stock info when product is selected in dropdown
function updateDropdownStockInfo() {
    const productSelect = document.getElementById('productSelect');
    const stockInfo = document.getElementById('dropdownStockInfo');
    if (!productSelect.value) {
        stockInfo.textContent = '';
        return;
    }
    const selectedProduct = products.find(p => p._id.toString() === productSelect.value.toString());
    if (selectedProduct) {
        stockInfo.textContent = `Stock: ${selectedProduct.quantity}`;
    } else {
        stockInfo.textContent = '';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const productSelect = document.getElementById('productSelect');
    if (productSelect) {
        productSelect.addEventListener('change', updateDropdownStockInfo);
    }
});

function addItemToInvoice() {
    const productSelect = document.getElementById('productSelect');
    const quantityInput = document.getElementById('itemQuantity');
    const messageDiv = document.getElementById('invoiceMessage');
    const debugDiv = document.getElementById('invoiceDebug');
    messageDiv.textContent = '';

    if (!productSelect.value) {
        messageDiv.textContent = 'Please select a product.';
        return;
    }

    const quantity = parseInt(quantityInput.value);
    if (quantity <= 0) {
        messageDiv.textContent = 'Please enter a valid quantity.';
        return;
    }

    const selectedProduct = products.find(p => p._id.toString() === productSelect.value.toString());
    debugDiv.textContent =
      'productSelect.value: ' + productSelect.value +
      ' | products: ' + JSON.stringify(products) +
      ' | selectedProduct: ' + JSON.stringify(selectedProduct);
    if (!selectedProduct) {
        messageDiv.textContent = 'Product not found. Please reload the page.';
        return;
    }
    // Check stock including already added
    const alreadyInInvoice = invoiceItems
      .filter(item => item.productId === selectedProduct._id)
      .reduce((sum, item) => sum + item.quantity, 0);
    if (quantity + alreadyInInvoice > selectedProduct.quantity) {
        messageDiv.textContent = `Only ${selectedProduct.quantity - alreadyInInvoice} more in stock.`;
        return;
    }

    addProductToInvoice(selectedProduct, quantity);

    // Reset form
    productSelect.value = '';
    quantityInput.value = '1';
    updateDropdownStockInfo();
    messageDiv.style.color = '#388e3c';
    messageDiv.textContent = 'Item added!';
    setTimeout(() => { messageDiv.textContent = ''; messageDiv.style.color = '#d32f2f'; }, 1500);
}

function addBarcodeItemToInvoice() {
    const barcodeInput = document.getElementById('barcodeInput');
    const barcodeQuantityInput = document.getElementById('barcodeQuantity');
    const messageDiv = document.getElementById('invoiceMessage');
    
    const barcode = barcodeInput.value.trim();
    
    if (!barcode) {
        messageDiv.textContent = 'Please enter a barcode.';
        return;
    }
    
    const quantity = parseInt(barcodeQuantityInput.value);
    if (quantity <= 0) {
        messageDiv.textContent = 'Please enter a valid quantity.';
        return;
    }
    
    const selectedProduct = products.find(p => p.barcode.toString() === barcode.toString());
    
    if (!selectedProduct) {
        messageDiv.textContent = 'Product with this barcode not found.';
        return;
    }
    // Check stock including already added
    const alreadyInInvoice = invoiceItems
      .filter(item => item.productId === selectedProduct._id)
      .reduce((sum, item) => sum + item.quantity, 0);
    if (quantity + alreadyInInvoice > selectedProduct.quantity) {
        messageDiv.textContent = `Only ${selectedProduct.quantity - alreadyInInvoice} more in stock.`;
        return;
    }
    
    addProductToInvoice(selectedProduct, quantity);
    
    // Reset form
    barcodeInput.value = '';
    barcodeQuantityInput.value = '1';
    document.getElementById('barcodeProductInfo').style.display = 'none';
    messageDiv.style.color = '#388e3c';
    messageDiv.textContent = 'Item added!';
    setTimeout(() => { messageDiv.textContent = ''; messageDiv.style.color = '#d32f2f'; }, 1500);
}

// Common function to add product to invoice
function addProductToInvoice(selectedProduct, quantity) {
    const messageDiv = document.getElementById('invoiceMessage');
    // Check if product already exists in invoice
    const existingItemIndex = invoiceItems.findIndex(item => item.productId === selectedProduct._id);
    
    if (existingItemIndex !== -1) {
        // Update existing item quantity
        invoiceItems[existingItemIndex].quantity += quantity;
        invoiceItems[existingItemIndex].total = invoiceItems[existingItemIndex].quantity * invoiceItems[existingItemIndex].price;
    } else {
        // Add new item
        invoiceItems.push({
            productId: selectedProduct._id,
            productName: selectedProduct.name,
            barcode: selectedProduct.barcode,
            price: selectedProduct.priceAfterGST,
            quantity: quantity,
            total: selectedProduct.priceAfterGST * quantity
        });
    }
    
    // Update display and totals
    displayInvoiceItems();
    updateInvoiceTotals();
}

// Search product by barcode
function searchProductByBarcode() {
    const barcodeInput = document.getElementById('barcodeInput');
    const barcode = barcodeInput.value.trim();
    const productInfoDiv = document.getElementById('barcodeProductInfo');
    
    if (!barcode) {
        productInfoDiv.style.display = 'none';
        return;
    }
    
    const selectedProduct = products.find(p => p.barcode.toString() === barcode.toString());
    
    if (selectedProduct) {
        productInfoDiv.innerHTML = `
            <h5>Product Found:</h5>
            <div class="barcode-product-details">
                <div><span>Name:</span> ${selectedProduct.name}</div>
                <div><span>Price:</span> ₹${selectedProduct.priceAfterGST}</div>
                <div><span>Category:</span> ${selectedProduct.category}</div>
                <div><span>Size:</span> ${selectedProduct.size}</div>
                <div><span>Stock:</span> ${selectedProduct.quantity}</div>
            </div>
        `;
        productInfoDiv.style.display = 'block';
    } else {
        productInfoDiv.innerHTML = `
            <h5>Product Not Found</h5>
            <p>No product found with barcode: ${barcode}</p>
            <p>Available barcodes: ${products.map(p => p.barcode).join(', ')}</p>
        `;
        productInfoDiv.style.display = 'block';
    }
}

// Display invoice items
function displayInvoiceItems() {
    const itemsList = document.getElementById('invoiceItemsList');
    const debugDiv = document.getElementById('invoiceDebug');
    
    // Debug: show invoiceItems array
    debugDiv.textContent = 'invoiceItems: ' + JSON.stringify(invoiceItems);
    
    if (invoiceItems.length === 0) {
        itemsList.innerHTML = '<p style="text-align: center; color: #666; font-style: italic; padding: 20px;">No items added to invoice.</p>';
        return;
    }
    
    let html = `
        <div class="invoice-item invoice-item-header">
            <div>Product</div>
            <div>Price</div>
            <div>Quantity</div>
            <div>Total</div>
            <div>Action</div>
        </div>
    `;
    
    invoiceItems.forEach((item, index) => {
        html += `
            <div class="invoice-item">
                <div class="item-name">${item.productName}</div>
                <div class="item-price">₹${item.price.toFixed(2)}</div>
                <div>${item.quantity}</div>
                <div class="item-total">₹${item.total.toFixed(2)}</div>
                <div>
                    <button type="button" class="remove-item-btn" onclick="removeInvoiceItem(${index})">Remove</button>
                </div>
            </div>
        `;
    });
    
    itemsList.innerHTML = html;
}

// Remove item from invoice
function removeInvoiceItem(index) {
    invoiceItems.splice(index, 1);
    displayInvoiceItems();
    updateInvoiceTotals();
}

// --- Discount Sync Logic ---
let lastDiscountEdited = null;

document.addEventListener('DOMContentLoaded', function() {
    const discountPercentInput = document.getElementById('discountPercent');
    const discountAmountInput = document.getElementById('discountAmount');

    if (discountPercentInput && discountAmountInput) {
        discountPercentInput.addEventListener('input', function() {
            if (lastDiscountEdited === 'amount') return;
            lastDiscountEdited = 'percent';
            updateDiscountAmountFromPercent();
            updateInvoiceTotals();
            lastDiscountEdited = null;
        });
        discountAmountInput.addEventListener('input', function() {
            if (lastDiscountEdited === 'percent') return;
            lastDiscountEdited = 'amount';
            updateDiscountPercentFromAmount();
            updateInvoiceTotals();
            lastDiscountEdited = null;
        });
    }
});

function updateDiscountAmountFromPercent() {
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
    const discountAmount = (subtotal * discountPercent) / 100;
    document.getElementById('discountAmount').value = discountAmount.toFixed(2);
}

function updateDiscountPercentFromAmount() {
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = parseFloat(document.getElementById('discountAmount').value) || 0;
    const discountPercent = subtotal === 0 ? 0 : (discountAmount / subtotal) * 100;
    document.getElementById('discountPercent').value = discountPercent.toFixed(2);
}

// Update updateInvoiceTotals to use the input value for discountAmount
function updateInvoiceTotals() {
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
    const discountAmount = parseFloat(document.getElementById('discountAmount').value) || 0;
    const total = subtotal - discountAmount;
    // Calculate GST (assuming GST is already included in product prices)
    const gstAmount = invoiceItems.reduce((sum, item) => {
        const product = products.find(p => p._id === item.productId);
        return sum + (product ? product.gstAmount * item.quantity : 0);
    }, 0);
    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('gstAmount').textContent = `₹${gstAmount.toFixed(2)}`;
    // Set both fields for clarity
    document.getElementById('discountAmount').value = discountAmount.toFixed(2);
    document.getElementById('totalAmount').textContent = `₹${total.toFixed(2)}`;
}

// Create invoice
async function createInvoice(e) {
    e.preventDefault();
    
    // Check if user is trying to add a customer (phone field has value but no customer selected)
    const phoneInput = document.getElementById('invoiceCustomerPhone');
    const phone = phoneInput.value.trim();
    
    if (phone && !selectedInvoiceCustomer) {
        // User entered a phone number but hasn't searched/added customer yet
        alert('Please search for the customer first or add them if not found.');
        return;
    }
    
    // If no customer is selected and no phone entered, allow form submission (might be just adding customer)
    if (!selectedInvoiceCustomer && !phone) {
        alert('Please enter a customer phone number first.');
        return;
    }
    
    // If customer is selected but no invoice items, ask if they want to create invoice or just add customer
    if (selectedInvoiceCustomer && invoiceItems.length === 0) {
        const choice = confirm('No products added to invoice. Do you want to create an invoice with just the customer, or add more products?');
        if (!choice) {
            return; // User chose to add more products
        }
    }
    
    const date = document.getElementById('invoiceDate').value;
    
    const invoiceData = {
        customer: selectedInvoiceCustomer._id,
        date: date,
        products: invoiceItems.map(item => ({
            product: item.productId,
            quantity: item.quantity,
            price: item.price
        })),
        total: parseFloat(document.getElementById('totalAmount').textContent.replace('₹', '')),
        gstPercent: 0, // Will be calculated on backend
        gstValue: parseFloat(document.getElementById('gstAmount').textContent.replace('₹', '')),
        discountPercent: parseFloat(document.getElementById('discountPercent').value) || 0,
        discountValue: parseFloat(document.getElementById('discountAmount').textContent.replace('₹', ''))
    };
    
    try {
        const response = await fetch('http://localhost:3000/api/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invoiceData)
        });
        
        if (response.ok) {
            const invoice = await response.json();
            alert('Invoice created successfully!');
            
            // Reset form
            document.getElementById('invoiceForm').reset();
            document.getElementById('invoiceDate').value = new Date().toISOString().split('T')[0];
            invoiceItems = [];
            displayInvoiceItems();
            updateInvoiceTotals();
            selectedInvoiceCustomer = null;
            renderInvoiceCustomerDetails(null);
            document.getElementById('invoiceAddCustomerForm').style.display = 'none';
            
            // Reload invoice list
            document.getElementById('loadInvoicesBtn').click();
        } else {
            const error = await response.json();
            alert('Error: ' + error.message);
        }
    } catch (error) {
        alert('Error creating invoice: ' + error.message);
    }
}

// Initialize invoice list
function initializeInvoiceList() {
    const loadInvoicesBtn = document.getElementById('loadInvoicesBtn');
    const searchInvoiceBtn = document.getElementById('searchInvoiceBtn');
    const invoiceSearchInput = document.getElementById('invoiceSearchInput');
    if (loadInvoicesBtn) {
        loadInvoicesBtn.onclick = loadAllInvoices;
    }
    if (searchInvoiceBtn && invoiceSearchInput) {
        searchInvoiceBtn.onclick = searchInvoices;
        invoiceSearchInput.onkeypress = function(e) {
            if (e.key === 'Enter') {
                searchInvoiceBtn.click();
            }
        };
    }
}

// Load all invoices
async function loadAllInvoices() {
    try {
        const response = await fetch('http://localhost:3000/api/invoices');
        const invoices = await response.json();
        displayInvoices(invoices);
    } catch (error) {
        alert('Error loading invoices: ' + error.message);
    }
}

// Search invoices by customer phone
async function searchInvoices() {
    const phoneNumber = document.getElementById('invoiceSearchInput').value.trim();
    
    if (!phoneNumber) {
        alert('Please enter a phone number to search.');
        return;
    }
    
    try {
        // First get customer by phone
        const customerResponse = await fetch(`http://localhost:3000/api/customers/phone/${phoneNumber}`);
        
        if (customerResponse.ok) {
            const customer = await customerResponse.json();
            
            // Then get invoices for this customer
            const invoicesResponse = await fetch(`http://localhost:3000/api/invoices`);
            const allInvoices = await invoicesResponse.json();
            
            const customerInvoices = allInvoices.filter(invoice => invoice.customer._id === customer._id);
            displayInvoices(customerInvoices);
        } else {
            document.getElementById('invoiceList').innerHTML = '<p style="text-align: center; color: #dc3545; font-style: italic;">No invoices found for this customer.</p>';
        }
    } catch (error) {
        alert('Error searching invoices: ' + error.message);
    }
}

// Display invoices
function displayInvoices(invoices) {
    const invoiceList = document.getElementById('invoiceList');
    
    if (invoices.length === 0) {
        invoiceList.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No invoices found.</p>';
        return;
    }
    
    let html = '';
    
    invoices.forEach(invoice => {
        const customer = invoice.customer;
        const itemsCount = invoice.products.length;
        const totalItems = invoice.products.reduce((sum, item) => sum + item.quantity, 0);
        
        html += `
            <div class="invoice-list-item">
                <h4>
                    <span class="invoice-number">Invoice #${invoice._id.slice(-6)}</span>
                    <span class="invoice-date">${new Date(invoice.date).toLocaleDateString()}</span>
                </h4>
                <div class="invoice-customer">
                    <div><span>Customer:</span> ${customer.name}</div>
                    <div><span>Phone:</span> ${customer.phone}</div>
                </div>
                <div class="invoice-items-summary">
                    ${itemsCount} items, ${totalItems} total quantity
                </div>
                <div class="invoice-totals">
                    <div class="total-item subtotal">
                        <div>Subtotal</div>
                        <div>₹${(invoice.total + invoice.discountValue).toFixed(2)}</div>
                    </div>
                    <div class="total-item gst">
                        <div>GST</div>
                        <div>₹${invoice.gstValue.toFixed(2)}</div>
                    </div>
                    <div class="total-item final-total">
                        <div>Total</div>
                        <div>₹${invoice.total.toFixed(2)}</div>
                    </div>
                </div>
                <div class="invoice-actions">
                    <button class="action-btn view-btn" onclick="viewInvoiceDetails('${invoice._id}')">View Details</button>
                    <button class="action-btn edit-btn" onclick="openEditInvoiceModal('${invoice._id}')">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteInvoice('${invoice._id}')">Delete</button>
                </div>
            </div>
        `;
    });
    
    invoiceList.innerHTML = html;
}

// --- Invoice Details Modal Logic ---
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('invoiceDetailsModal');
    const closeModalBtn = document.getElementById('closeInvoiceModal');
    const printBtn = document.getElementById('printInvoiceBtn');
    if (closeModalBtn) {
        closeModalBtn.onclick = function() {
            modal.style.display = 'none';
        };
    }
    if (printBtn) {
        printBtn.onclick = function() {
            window.print();
        };
    }
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
});

function viewInvoiceDetails(invoiceId) {
    // Find the invoice in the currently loaded invoices (or fetch if needed)
    fetch(`http://localhost:3000/api/invoices/${invoiceId}`)
        .then(res => res.json())
        .then(invoice => {
            renderInvoiceDetailsModal(invoice);
        })
        .catch(() => {
            alert('Could not load invoice details.');
        });
}

function renderInvoiceDetailsModal(invoice) {
    const modal = document.getElementById('invoiceDetailsModal');
    const body = document.getElementById('invoiceDetailsBody');
    if (!invoice) {
        body.innerHTML = '<p style="color:#d32f2f;">Invoice not found.</p>';
        modal.style.display = 'block';
        return;
    }
    const customer = invoice.customer;
    const items = invoice.products;
    body.innerHTML = `
        <h2 style="margin-top:0;">Invoice #${invoice._id.slice(-6)}</h2>
        <div style="margin-bottom:12px;">
            <b>Date:</b> ${new Date(invoice.date).toLocaleDateString()}<br>
            <b>Customer:</b> ${customer.name}<br>
            <b>Phone:</b> ${customer.phone}<br>
            <b>Address:</b> ${customer.address || ''}, ${customer.city || ''}, ${customer.state || ''} ${customer.zip || ''}
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <thead>
                <tr style="background:#f8f9fa;">
                    <th style="border:1px solid #ddd;padding:6px;">Product</th>
                    <th style="border:1px solid #ddd;padding:6px;">Price</th>
                    <th style="border:1px solid #ddd;padding:6px;">Qty</th>
                    <th style="border:1px solid #ddd;padding:6px;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td style="border:1px solid #ddd;padding:6px;">${item.product.name}</td>
                        <td style="border:1px solid #ddd;padding:6px;">₹${item.price.toFixed(2)}</td>
                        <td style="border:1px solid #ddd;padding:6px;">${item.quantity}</td>
                        <td style="border:1px solid #ddd;padding:6px;">₹${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div style="margin-bottom:8px;"><b>Subtotal:</b> ₹${(invoice.total + invoice.discountValue).toFixed(2)}</div>
        <div style="margin-bottom:8px;"><b>GST:</b> ₹${invoice.gstValue.toFixed(2)}</div>
        <div style="margin-bottom:8px;"><b>Discount:</b> ₹${invoice.discountValue.toFixed(2)} (${invoice.discountPercent}%)</div>
        <div style="font-size:18px;font-weight:bold;color:#007bff;"><b>Total:</b> ₹${invoice.total.toFixed(2)}</div>
    `;
    modal.style.display = 'block';
}

// Delete invoice and restore stock
async function deleteInvoice(invoiceId) {
    if (!confirm('Are you sure you want to delete this invoice? This will restore product stock.')) return;
    try {
        const response = await fetch(`http://localhost:3000/api/invoices/${invoiceId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (response.ok) {
            alert('Invoice deleted and stock restored.');
            loadAllInvoices();
        } else {
            alert(result.message || 'Failed to delete invoice.');
        }
    } catch (error) {
        alert('Error deleting invoice: ' + error.message);
    }
}

// Switch between product selection tabs
function switchProductTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.product-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    if (tabName === 'dropdown') {
        document.getElementById('dropdownTab').classList.add('active');
    } else if (tabName === 'barcode') {
        document.getElementById('barcodeTab').classList.add('active');
        // Focus on barcode input when switching to barcode tab
        setTimeout(() => {
            document.getElementById('barcodeInput').focus();
        }, 100);
    }
}

// --- Edit Invoice Modal Logic ---
let currentEditInvoiceId = null;

async function openEditInvoiceModal(invoiceId) {
    currentEditInvoiceId = invoiceId;
    // Fetch invoice details
    const res = await fetch(`http://localhost:3000/api/invoices/${invoiceId}`);
    const invoice = await res.json();
    renderEditInvoiceForm(invoice);
    document.getElementById('editInvoiceModal').style.display = 'block';
}

document.getElementById('closeEditInvoiceModal').onclick = function() {
    document.getElementById('editInvoiceModal').style.display = 'none';
};

window.onclick = function(event) {
    if (event.target === document.getElementById('editInvoiceModal')) {
        document.getElementById('editInvoiceModal').style.display = 'none';
    }
};

function renderEditInvoiceForm(invoice) {
    // Calculate subtotal
    const subtotal = invoice.products.reduce((sum, item) => sum + item.price * item.quantity, 0);
    // Calculate GST and Discount percent from values
    let gstPercent = subtotal > 0 ? ((invoice.gstValue || 0) / subtotal * 100) : 0;
    let discountPercent = subtotal > 0 ? ((invoice.discountValue || 0) / subtotal * 100) : 0;
    // Always use decimals, default to 0.00
    gstPercent = isNaN(gstPercent) ? '0.00' : gstPercent.toFixed(2);
    discountPercent = isNaN(discountPercent) ? '0.00' : discountPercent.toFixed(2);
    const fieldsDiv = document.getElementById('editInvoiceFields');
    let html = '';
    html += `<label>Customer Name:<input type=\"text\" id=\"editCustomerName\" value=\"${invoice.customer.name}\" required></label>`;
    html += `<label>Customer Phone:<input type=\"text\" id=\"editCustomerPhone\" value=\"${invoice.customer.phone}\" required></label>`;
    html += `<label>Discount %:<input type=\"number\" step=\"0.01\" id=\"editDiscountPercent\" value=\"${discountPercent}\" min=\"0\" max=\"100\"></label>`;
    html += `<label>Discount Amount:<input type=\"number\" step=\"0.01\" id=\"editDiscountValue\" value=\"${invoice.discountValue != null ? invoice.discountValue : 0}\" min=\"0\"></label>`;
    html += `<label>GST %:<input type=\"number\" step=\"0.01\" id=\"editGstPercent\" value=\"${gstPercent}\" min=\"0\" max=\"100\"></label>`;
    html += `<label>GST Amount:<input type=\"number\" step=\"0.01\" id=\"editGstValue\" value=\"${invoice.gstValue != null ? invoice.gstValue : 0}\" min=\"0\" disabled></label>`;
    html += `<h4>Products</h4>`;
    invoice.products.forEach((item, idx) => {
        html += `<div class='edit-product-block'>`;
        html += `Product: <input type='text' value='${item.product.name}' disabled> `;
        html += `Qty: <input type='number' step='0.01' id='editProductQty${idx}' value='${item.quantity}' min='0.01'> `;
        html += `Price: <input type='number' step='0.01' id='editProductPrice${idx}' value='${item.price}' min='0'>`;
        html += `</div>`;
    });
    fieldsDiv.innerHTML = html;
    // Remove any existing button row
    const oldBtnRow = document.querySelector('#editInvoiceForm .modal-btn-row');
    if (oldBtnRow) oldBtnRow.remove();
    // Add button row
    const btnRow = document.createElement('div');
    btnRow.className = 'modal-btn-row';
    btnRow.innerHTML = `<button type=\"button\" class=\"cancel-btn\" id=\"cancelEditInvoiceBtn\">Cancel</button> <button type=\"submit\" class=\"print-btn\">Save Changes</button>`;
    document.getElementById('editInvoiceForm').appendChild(btnRow);
    document.getElementById('cancelEditInvoiceBtn').onclick = function() {
        document.getElementById('editInvoiceModal').style.display = 'none';
    };
    // --- Dynamic calculation logic ---
    function recalcEditModal() {
        // Get current product values
        let subtotal = 0;
        invoice.products.forEach((item, idx) => {
            const qty = parseFloat(document.getElementById(`editProductQty${idx}`).value) || 0;
            const price = parseFloat(document.getElementById(`editProductPrice${idx}`).value) || 0;
            subtotal += qty * price;
        });
        // Discount and GST amounts
        const discountValue = parseFloat(document.getElementById('editDiscountValue').value) || 0;
        const gstValue = parseFloat(document.getElementById('editGstValue').value) || 0;
        // Update % fields
        document.getElementById('editDiscountPercent').value = subtotal > 0 ? ((discountValue / subtotal) * 100).toFixed(2) : 0;
        document.getElementById('editGstPercent').value = subtotal > 0 ? ((gstValue / subtotal) * 100).toFixed(2) : 0;
    }
    function recalcEditModalFromPercent() {
        // Get current product values
        let subtotal = 0;
        invoice.products.forEach((item, idx) => {
            const qty = parseFloat(document.getElementById(`editProductQty${idx}`).value) || 0;
            const price = parseFloat(document.getElementById(`editProductPrice${idx}`).value) || 0;
            subtotal += qty * price;
        });
        // Discount and GST percent
        const discountPercent = parseFloat(document.getElementById('editDiscountPercent').value) || 0;
        const gstPercent = parseFloat(document.getElementById('editGstPercent').value) || 0;
        // Update amount fields
        document.getElementById('editDiscountValue').value = ((discountPercent / 100) * subtotal).toFixed(2);
        document.getElementById('editGstValue').value = ((gstPercent / 100) * subtotal).toFixed(2);
    }
    // When product qty/price, discount/gst value changes, recalc %
    invoice.products.forEach((item, idx) => {
        document.getElementById(`editProductQty${idx}`).addEventListener('input', recalcEditModal);
        document.getElementById(`editProductPrice${idx}`).addEventListener('input', recalcEditModal);
    });
    document.getElementById('editDiscountValue').addEventListener('input', recalcEditModal);
    document.getElementById('editGstValue').addEventListener('input', recalcEditModal);
    // When discount/gst percent changes, recalc amount
    document.getElementById('editDiscountPercent').addEventListener('input', recalcEditModalFromPercent);
    document.getElementById('editGstPercent').addEventListener('input', recalcEditModalFromPercent);
}

document.getElementById('editInvoiceForm').onsubmit = async function(e) {
    e.preventDefault();
    // Gather updated data
    const name = document.getElementById('editCustomerName').value;
    const phone = document.getElementById('editCustomerPhone').value;
    const discountPercent = parseFloat(document.getElementById('editDiscountPercent').value) || 0;
    const discountValue = parseFloat(document.getElementById('editDiscountValue').value) || 0;
    const gstPercent = parseFloat(document.getElementById('editGstPercent').value) || 0;
    // Get products and quantities
    const invoiceRes = await fetch(`http://localhost:3000/api/invoices/${currentEditInvoiceId}`);
    const invoice = await invoiceRes.json();
    const products = invoice.products.map((item, idx) => ({
        product: item.product._id,
        quantity: parseInt(document.getElementById(`editProductQty${idx}`).value),
        price: parseFloat(document.getElementById(`editProductPrice${idx}`).value)
    }));
    // Calculate totals
    let subtotal = products.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let gstValue = subtotal * (gstPercent / 100);
    let total = subtotal + gstValue - discountValue;
    // Prepare data
    const updatedData = {
        customer: invoice.customer._id,
        products,
        discountPercent,
        discountValue,
        gstPercent,
        gstValue,
        total
    };
    // Send PUT request
    const res = await fetch(`http://localhost:3000/api/invoices/${currentEditInvoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
    });
    if (res.ok) {
        alert('Invoice updated successfully!');
        document.getElementById('editInvoiceModal').style.display = 'none';
        loadAllInvoices();
    } else {
        const result = await res.json();
        alert(result.message || 'Failed to update invoice.');
    }
};