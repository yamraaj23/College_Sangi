// ============================================
// College Sangi - Marketplace Page Controller
// ============================================

        function addEditDeleteButtonsToProducts() {
            // Remove any existing edit/delete buttons first
            document.querySelectorAll('.product-actions-owner').forEach(btn => btn.remove());
            
            // Add edit/delete buttons to user's products
            appState.marketplaceProducts.forEach(product => {
                const currentUserName = appState.currentUser ? 
                    `${appState.currentUser.firstName} ${appState.currentUser.lastName}` : '';
                
                if (product.seller === currentUserName) {
                    const productElement = document.querySelector(`.product-card[data-id="${product.id}"] .product-info`);
                    if (productElement) {
                        // Create owner actions container (includes sold toggle)
                        const ownerActions = document.createElement('div');
                        ownerActions.className = 'product-actions-owner';
                        ownerActions.innerHTML = `
                            <label class="sold-toggle-wrapper" style="display:inline-flex;align-items:center;gap:6px;margin-right:8px;">
                                <input type="checkbox" class="sold-toggle" data-id="${product.id}" ${product.sold ? 'checked' : ''}>
                                <span style="font-size:0.85rem;">Sold</span>
                            </label>
                            <button class="edit-btn" data-id="${product.id}" data-type="product" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-btn" data-id="${product.id}" data-type="product" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        `;
                        
                        // Insert at the end of product info
                        productElement.appendChild(ownerActions);
                    }
                }
            });
            
            // Add event listeners for edit/delete buttons
            document.querySelectorAll('.edit-btn[data-type="product"]').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const productId = parseInt(this.getAttribute('data-id'));
                    editProduct(productId);
                });
            });
            
            document.querySelectorAll('.delete-btn[data-type="product"]').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const productId = parseInt(this.getAttribute('data-id'));
                    deleteProduct(productId);
                });
            });

            // Add sold toggle handlers for owner's products
            document.querySelectorAll('.sold-toggle[data-id]').forEach(toggle => {
                toggle.addEventListener('change', function(e) {
                    e.stopPropagation();
                    const productId = parseInt(this.getAttribute('data-id'));
                    const product = appState.marketplaceProducts.find(p => p.id === productId);
                    if (!product) return;
                    product.sold = !!this.checked;
                    saveProductsToStorage();
                    // Re-render marketplace to update visuals and controls
                    renderMarketplaceProducts();
                });
            });
        }

        // Edit product function
        function editProduct(productId) {
            const product = appState.marketplaceProducts.find(p => p.id === productId);
            if (!product) return;
            
            // Create edit product dialog
            const modal = document.createElement('div');
            modal.className = 'dialog-overlay active';
            modal.id = 'editProductDialog';
            
            // Create image preview HTML
            let imagePreviewHTML = '';
            if (product.imageUrl) {
                if (product.fileType === 'pdf') {
                    imagePreviewHTML = `
                        <div style="text-align: center; padding: 20px;">
                            <i class="fas fa-file-pdf" style="font-size: 4rem; color: #e74c3c;"></i>
                            <p style="margin-top: 10px; font-weight: 500;">PDF Document</p>
                            <p style="font-size: 0.85rem; color: var(--text-light);">Existing file</p>
                        </div>
                    `;
                } else {
                    imagePreviewHTML = `<img src="${product.imageUrl}" alt="Textbook preview">`;
                }
            } else {
                imagePreviewHTML = `
                    <div class="image-preview-placeholder">
                        <i class="fas fa-image"></i>
                        <p>No file selected</p>
                    </div>
                `;
            }
            
            modal.innerHTML = `
                <div class="dialog-box">
                    <div class="dialog-header">
                        <h3 class="dialog-title">Edit Textbook Listing</h3>
                        <button class="dialog-close" id="closeEditProductDialog">&times;</button>
                    </div>
                    <div class="dialog-body">
                        <form id="editProductForm">
                            <div class="form-group">
                                <label for="editProductTitle">Textbook Title</label>
                                <input type="text" id="editProductTitle" class="form-control" value="${product.title}" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editProductCourse">Course</label>
                                    <select id="editProductCourse" class="form-control" required>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="editProductUniversity">University</label>
                                    <select id="editProductUniversity" class="form-control" required>
                                        <option value="Tribhuvan University" ${product.university === 'Tribhuvan University' ? 'selected' : ''}>Tribhuvan University</option>
                                        <option value="Kathmandu University" ${product.university === 'Kathmandu University' ? 'selected' : ''}>Kathmandu University</option>
                                        <option value="Purbanchal University" ${product.university === 'Purbanchal University' ? 'selected' : ''}>Purbanchal University</option>
                                        <option value="Pokhara University" ${product.university === 'Pokhara University' ? 'selected' : ''}>Pokhara University</option>
                                        <option value="Lumbini Buddhist University" ${product.university === 'Lumbini Buddhist University' ? 'selected' : ''}>Lumbini Buddhist University</option>
                                        <option value="Agriculture and Forestry University" ${product.university === 'Agriculture and Forestry University' ? 'selected' : ''}>Agriculture and Forestry University</option>
                                        <option value="Nepal Sanskrit University" ${product.university === 'Nepal Sanskrit University' ? 'selected' : ''}>Nepal Sanskrit University</option>
                                        <option value="Far-Western University" ${product.university === 'Far-Western University' ? 'selected' : ''}>Far-Western University</option>
                                        <option value="Mid Western University" ${product.university === 'Mid Western University' ? 'selected' : ''}>Mid Western University</option>
                                        <option value="Nepal Open University" ${product.university === 'Nepal Open University' ? 'selected' : ''}>Nepal Open University</option>
                                        <option value="Rajarshi Janak University" ${product.university === 'Rajarshi Janak University' ? 'selected' : ''}>Rajarshi Janak University</option>
                                        <option value="Madan Bhandari University" ${product.university === 'Madan Bhandari University' ? 'selected' : ''}>Madan Bhandari University</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editProductPrice">Price (NPR)</label>
                                    <input type="number" id="editProductPrice" class="form-control" value="${product.price}" min="0" required>
                                </div>
                                <div class="form-group">
                                    <label for="editProductCondition">Condition</label>
                                    <select id="editProductCondition" class="form-control" required>
                                        <option value="Like New" ${product.condition === 'Like New' ? 'selected' : ''}>Like New</option>
                                        <option value="Good" ${product.condition === 'Good' ? 'selected' : ''}>Good</option>
                                        <option value="Fair" ${product.condition === 'Fair' ? 'selected' : ''}>Fair</option>
                                        <option value="Poor" ${product.condition === 'Poor' ? 'selected' : ''}>Poor</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Textbook Photo/PDF</label>
                                <div class="image-preview" id="editProductImagePreview">
                                    ${imagePreviewHTML}
                                </div>
                                <div class="file-input-wrapper" style="margin-top: 10px;">
                                    <button type="button" class="btn btn-outline" style="width: 100%;">
                                        <i class="fas fa-upload"></i> Choose New File (Optional)
                                    </button>
                                    <input type="file" id="editProductImage" accept="image/*,.pdf">
                                </div>
                                <small class="password-hint">Leave empty to keep existing file. Maximum file size: 5MB. Supported formats: JPG, PNG, PDF</small>
                            </div>
                            <div class="form-group">
                                <label for="editProductDescription">Description</label>
                                <textarea id="editProductDescription" class="form-control">${product.description || ''}</textarea>
                            </div>
                        </form>
                    </div>
                    <div class="dialog-footer">
                        <button class="btn btn-outline" id="cancelEditProduct">Cancel</button>
                        <button class="btn btn-primary" id="submitEditProduct" data-id="${productId}">Update Listing</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Populate course select based on university
            const editProductUniversitySelect = modal.querySelector('#editProductUniversity');
            const editProductCourseSelect = modal.querySelector('#editProductCourse');
            
            function populateEditProductCourses() {
                const selectedUniversity = editProductUniversitySelect.value;
                const courses = getCoursesForUniversity(selectedUniversity);
                editProductCourseSelect.innerHTML = '';
                courses.forEach(course => {
                    const option = document.createElement('option');
                    option.value = course;
                    option.textContent = course;
                    if (course === product.course) {
                        option.selected = true;
                    }
                    editProductCourseSelect.appendChild(option);
                });
            }
            
            // Initial population
            populateEditProductCourses();
            
            // Update courses when university changes
            editProductUniversitySelect.addEventListener('change', populateEditProductCourses);
            
            // Add event listeners
            modal.querySelector('#closeEditProductDialog').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            modal.querySelector('#cancelEditProduct').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            // Image preview functionality
            const editProductImage = modal.querySelector('#editProductImage');
            const editProductImagePreview = modal.querySelector('#editProductImagePreview');
            
            editProductImage.addEventListener('change', function() {
                const file = this.files[0];
                if (file) {
                    // Check file size (max 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        showToast('File size must be less than 5MB', 'error');
                        this.value = '';
                        return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const isPDF = file.type === 'application/pdf';
                        
                        if (isPDF) {
                            editProductImagePreview.innerHTML = `
                                <div style="text-align: center; padding: 20px;">
                                    <i class="fas fa-file-pdf" style="font-size: 4rem; color: #e74c3c;"></i>
                                    <p style="margin-top: 10px; font-weight: 500;">${file.name}</p>
                                    <p style="font-size: 0.85rem; color: var(--text-light);">PDF Document</p>
                                </div>
                            `;
                        } else {
                            editProductImagePreview.innerHTML = `<img src="${e.target.result}" alt="Textbook preview">`;
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            modal.querySelector('#submitEditProduct').addEventListener('click', () => {
                const title = document.getElementById('editProductTitle').value;
                const course = document.getElementById('editProductCourse').value;
                const university = document.getElementById('editProductUniversity').value;
                const price = parseFloat(document.getElementById('editProductPrice').value);
                const condition = document.getElementById('editProductCondition').value;
                const description = document.getElementById('editProductDescription').value;
                const imageFile = editProductImage.files[0];
                
                if (!title || !course || !university || !price || !condition) {
                    showToast('Please fill in all required fields', 'error');
                    return;
                }
                
                if (price <= 0) {
                    showToast('Price must be greater than 0', 'error');
                    return;
                }
                
                // Update product data
                product.title = title;
                product.course = course;
                product.university = university;
                product.price = price;
                product.priceFormatted = `NPR ${price.toLocaleString()}`;
                product.condition = condition;
                product.description = description;
                product.editDate = new Date().toISOString().split('T')[0];
                product.edited = true;
                
                // Update image if a new one was selected
                if (imageFile) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const isPDF = imageFile.type === 'application/pdf';
                        product.imageUrl = e.target.result;
                        product.fileType = isPDF ? 'pdf' : 'image';
                        
                        saveProductsToStorage();
                        renderMarketplaceProducts();
                        addEditDeleteButtonsToProducts();
                        
                        document.body.removeChild(modal);
                        showToast('Textbook listing updated successfully!');
                    };
                    reader.readAsDataURL(imageFile);
                } else {
                    // Keep existing image
                    saveProductsToStorage();
                    renderMarketplaceProducts();
                    addEditDeleteButtonsToProducts();
                    
                    document.body.removeChild(modal);
                    showToast('Textbook listing updated successfully!');
                }
            });
        }

        // Delete product function
        function deleteProduct(productId) {
            // Show custom confirmation dialog
            const deleteProductDialog = document.getElementById('deleteProductConfirmDialog');
            const deleteProductCancelBtn = document.getElementById('deleteProductCancelBtn');
            const deleteProductConfirmBtn = document.getElementById('deleteProductConfirmBtn');

            if (deleteProductDialog && deleteProductCancelBtn && deleteProductConfirmBtn) {
                // Show dialog
                deleteProductDialog.classList.add('active');

                // Cancel button
                deleteProductCancelBtn.onclick = () => {
                    deleteProductDialog.classList.remove('active');
                };

                // Confirm delete button
                deleteProductConfirmBtn.onclick = () => {
                    deleteProductDialog.classList.remove('active');
                    
                    const productIndex = appState.marketplaceProducts.findIndex(p => p.id === productId);
                    if (productIndex !== -1) {
                        appState.marketplaceProducts.splice(productIndex, 1);
                        saveProductsToStorage();
                        
                        renderMarketplaceProducts();
                        addEditDeleteButtonsToProducts();
                        showToast('Textbook listing deleted successfully!');
                    }
                };

                // Close dialog when clicking outside
                deleteProductDialog.addEventListener('click', (e) => {
                    if (e.target === deleteProductDialog) {
                        deleteProductDialog.classList.remove('active');
                    }
                });
            } else {
                console.warn('Delete product dialog elements not found');
            }
        }

        // NEW: Edit and Delete Functionality for Events

        function formatPriceNPR(price) {
            return `NPR ${price.toLocaleString()}`;
        }

        // Render marketplace products
        function renderMarketplaceProducts() {
            console.log('🛍️ renderMarketplaceProducts called');
            const marketplaceGrid = document.getElementById('marketplaceGrid');
            if (!marketplaceGrid) {
                console.warn('❌ Marketplace grid container not found');
                return;
            }
            console.log('✅ Marketplace grid container found');
            marketplaceGrid.innerHTML = '';
            
            let productsToShow = appState.marketplaceProducts;
            console.log('📦 Total products:', productsToShow.length);
            
            // Get current filter values
            const universityInput = document.getElementById('marketplaceUniversityInput');
            const courseInput = document.getElementById('marketplaceCourseInput');
            const currentUniversityFilter = universityInput ? universityInput.value.trim().toLowerCase() : '';
            const currentCourseFilter = courseInput ? courseInput.value.trim().toLowerCase() : '';
            
            // Check if filters have changed
            const filtersChanged = 
                currentUniversityFilter !== paginationState.lastMarketplaceUniversityFilter ||
                currentCourseFilter !== paginationState.lastMarketplaceCourseFilter;
            
            // Reset pagination only if filters changed
            if (filtersChanged) {
                paginationState.marketplaceProductsLoaded = 15;
                paginationState.lastMarketplaceUniversityFilter = currentUniversityFilter;
                paginationState.lastMarketplaceCourseFilter = currentCourseFilter;
            }
            
            // Category button filters removed — marketplace shows products based on other filters only
            
            // Apply university filter from text input (case-insensitive substring match)
            if (currentUniversityFilter !== '') {
                productsToShow = productsToShow.filter(
                    product => product.university.toLowerCase().includes(currentUniversityFilter)
                );
            }
            
            // Apply course filter from text input (case-insensitive substring match)
            if (currentCourseFilter !== '') {
                productsToShow = productsToShow.filter(
                    product => product.course.toLowerCase().includes(currentCourseFilter)
                );
            }
            
            if (productsToShow.length === 0) {
                marketplaceGrid.innerHTML = `
                    <div style="width: 100%; min-height: 150px; display: flex; align-items: center; justify-content: center; padding: 18px 16px;">
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 auto; max-width: 520px; text-align: center;">
                            <div style="width: 82px; height: 82px; border-radius: 50%; background: #c7ccd0; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: #ffffff; line-height: 1; margin-bottom: 12px;">
                                <i class="fas fa-book"></i>
                            </div>
                            <h3 style="margin: 0 0 8px; color: #1f1f1f; font-weight: 400; font-size: clamp(1.6rem, 2.3vw, 2.2rem); line-height: 1.2; text-align: center;">No Materials Available</h3>
                            <p style="margin: 0; font-size: clamp(1rem, 1.3vw, 1.3rem); color: #5f6a74; font-style: italic; text-align: center;">Be the first to share your notes or reference books!</p>
                        </div>
                    </div>
                `;
                return;
            }
            
            // Store filtered products for pagination
            appState.filteredMarketplaceProducts = productsToShow;
            
            // Display only the first N products based on pagination state
            const productsToDisplay = productsToShow.slice(0, paginationState.marketplaceProductsLoaded);
            
            productsToDisplay.forEach(product => {
                const productElement = document.createElement('div');
                productElement.className = 'product-card' + (product.sold ? ' sold' : '');
                productElement.setAttribute('data-id', product.id);
                
                // Format price
                const formattedPrice = product.priceFormatted || formatPriceNPR(product.price);
                
                // Determine if it's a PDF or image
                const isPDF = product.fileType === 'pdf' || (product.imageUrl && product.imageUrl.includes('application/pdf'));
                
                const dateClass = product.edited ? 'product-date edited' : 'product-date';
                const editedText = product.edited ? ` (edited on ${formatDate(product.editDate)})` : '';
                
                productElement.innerHTML = `
                    <div class="product-image">
                        ${product.imageUrl ? 
                            `<img src="${product.imageUrl}" alt="${product.title}">` : 
                            `<i class="fas fa-book fa-3x"></i>`
                        }
                        ${product.sold ? `<div class="sold-badge">SOLD</div>` : ''}
                        ${isPDF ? `<div class="file-type-badge">PDF</div>` : ''}
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.title}</h3>
                        <div class="product-price">${formattedPrice}</div>
                        <div class="product-meta">
                            <span class="university-tag" style="background-color: #e8f4f8; color: #3498db; padding: 2px 6px; border-radius: 10px; font-size: 0.7rem;">${product.university}</span>
                            <span>${product.course}</span>
                            <span>${product.condition}</span>
                        </div>
                        <div class="product-meta">
                            <span class="profile-link" data-author="${product.seller}">${product.seller}</span>
                            <span class="${dateClass}">${formatDate(product.date)}${editedText}</span>
                        </div>
                    </div>
                `;
                
                marketplaceGrid.appendChild(productElement);
            });
            
            // Add load more button if there are more products
            if (productsToShow.length > paginationState.marketplaceProductsLoaded) {
                const loadMoreDiv = document.createElement('div');
                loadMoreDiv.style.textAlign = 'center';
                loadMoreDiv.style.padding = '12px';
                loadMoreDiv.style.gridColumn = '1 / -1';
                loadMoreDiv.innerHTML = `<button class="load-more-btn" id="loadMoreMarketplaceProducts">Load More Products</button>`;
                marketplaceGrid.appendChild(loadMoreDiv);
                
                document.getElementById('loadMoreMarketplaceProducts').addEventListener('click', function() {
                    paginationState.marketplaceProductsLoaded += 15;
                    renderMarketplaceProducts();
                });
            }
            
            // Add edit/delete buttons to user's products
            addEditDeleteButtonsToProducts();
        }

        // Render events

        function setupMarketplaceFilters() {
            // Setup dropdowns
            setupFilterDropdown('marketplaceUniversityInput', 'marketplaceUniversityDropdown', allUniversities);
            setupFilterDropdown('marketplaceCourseInput', 'marketplaceCourseDropdown', allCourses);

            // Add university change listener to update courses
            const marketplaceUniversityInput = document.getElementById('marketplaceUniversityInput');
            if (marketplaceUniversityInput) {
                marketplaceUniversityInput.addEventListener('change', () => {
                    updateCoursesForUniversity('marketplaceUniversityInput', 'marketplaceCourseInput', 'marketplaceCourseDropdown');
                    renderMarketplaceProducts();
                });
            }

            // Debounce function for filter input
            function createDebouncedRender(renderFunc, delay = 300) {
                let timeout;
                return function(...args) {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => renderFunc(...args), delay);
                };
            }
            
            const universityInput = document.getElementById('marketplaceUniversityInput');
            const courseInput = document.getElementById('marketplaceCourseInput');
            
            if (universityInput) {
                universityInput.addEventListener('input', createDebouncedRender(renderMarketplaceProducts));
            }
            
            if (courseInput) {
                courseInput.addEventListener('input', createDebouncedRender(renderMarketplaceProducts));
            }
        }

        // Setup Events Filters

        function setupAddTextbookDialog() {
            const addProductBtn = document.getElementById('addProductBtn');
            const addTextbookDialog = document.getElementById('addTextbookDialog');
            const closeTextbookDialog = document.getElementById('closeTextbookDialog');
            const cancelTextbook = document.getElementById('cancelTextbook');
            const submitTextbook = document.getElementById('submitTextbook');
            const addTextbookForm = document.getElementById('addTextbookForm');
            const textbookImage = document.getElementById('textbookImage');
            const textbookImagePreview = document.getElementById('textbookImagePreview');

            // Guard clause: return if elements don't exist
            if (!addProductBtn || !addTextbookDialog || !closeTextbookDialog || !cancelTextbook || !submitTextbook || !addTextbookForm || !textbookImage || !textbookImagePreview) {
                return;
            }

            addProductBtn.addEventListener('click', () => {
                showDialog('addTextbookDialog');
            });

            closeTextbookDialog.addEventListener('click', () => {
                hideDialog('addTextbookDialog');
            });

            cancelTextbook.addEventListener('click', () => {
                hideDialog('addTextbookDialog');
            });

            // File upload button click handler
            const uploadBtn = addTextbookDialog.querySelector('.file-input-wrapper button');
            if (uploadBtn) {
                uploadBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    textbookImage.click();
                });
            }

            // Image preview functionality
            textbookImage.addEventListener('change', function() {
                const file = this.files[0];
                if (file) {
                    // Check file size (max 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        showToast('File size must be less than 5MB', 'error');
                        this.value = '';
                        return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const isPDF = file.type === 'application/pdf';
                        
                        if (isPDF) {
                            textbookImagePreview.innerHTML = `
                                <div style="text-align: center; padding: 20px;">
                                    <i class="fas fa-file-pdf" style="font-size: 4rem; color: #e74c3c;"></i>
                                    <p style="margin-top: 10px; font-weight: 500;">${file.name}</p>
                                    <p style="font-size: 0.85rem; color: var(--text-light);">PDF Document</p>
                                </div>
                            `;
                        } else {
                            textbookImagePreview.innerHTML = `<img src="${e.target.result}" alt="Textbook preview">`;
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });

            // Initialize searchable dropdowns for textbook dialog
            try {
                setupFilterDropdown('textbookUniversity', 'textbookUniversityDropdown', allUniversities);
                setupFilterDropdown('textbookCourse', 'textbookCourseDropdown', allCourses);
                
                // Add university change listener to update courses
                const textbookUniversityInput = document.getElementById('textbookUniversity');
                if (textbookUniversityInput) {
                    textbookUniversityInput.addEventListener('change', () => {
                        updateCoursesForUniversity('textbookUniversity', 'textbookCourse', 'textbookCourseDropdown');
                    });
                }
            } catch (err) {
                // helper may not be ready yet
            }

            submitTextbook.addEventListener('click', () => {
                const title = document.getElementById('textbookTitle').value;
                const course = document.getElementById('textbookCourse').value;
                const university = document.getElementById('textbookUniversity').value;
                const price = parseFloat(document.getElementById('textbookPrice').value);
                const condition = document.getElementById('textbookCondition').value;
                const description = document.getElementById('textbookDescription').value;
                const imageFile = textbookImage.files[0];

                if (!title || !course || !university || !price || !condition || !imageFile) {
                    showToast('Please fill in all required fields and select a file', 'error');
                    return;
                }

                if (price <= 0) {
                    showToast('Price must be greater than 0', 'error');
                    return;
                }

                // Create image URL from file
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Create new product
                    const isPDF = imageFile.type === 'application/pdf';
                    const newProduct = {
                        id: Date.now(),
                        title: title,
                        price: price,
                        priceFormatted: `NPR ${price.toLocaleString()}`,
                        university: university,
                        course: course,
                        condition: condition,
                        seller: `${appState.currentUser.firstName} ${appState.currentUser.lastName}`,
                        date: new Date().toISOString().split('T')[0],
                        description: description,
                        imageUrl: e.target.result,
                        fileType: isPDF ? 'pdf' : 'image'
                    };

                    // Add to products array
                    appState.marketplaceProducts.unshift(newProduct);
                    saveProductsToStorage();

                    // Update UI
                    renderMarketplaceProducts();
                    hideDialog('addTextbookDialog');
                    addTextbookForm.reset();
                    textbookImagePreview.innerHTML = `
                        <div class="image-preview-placeholder">
                            <i class="fas fa-image"></i>
                            <p>No file selected</p>
                        </div>
                    `;
                    showToast('Textbook listed successfully!');
                };
                reader.readAsDataURL(imageFile);
            });
        }

        // Add Event Dialog
