// ============================================
// College Sangi - Study Materials Page Controller
// ============================================

// Global variables for material files and upload preview
let selectedMaterialFileBase64 = null;
let selectedMaterialFileName = "";
let selectedMaterialFileType = "";
let selectedMaterialFileSize = 0;

// Filter states
let lastMaterialsSearchFilter = "";
let lastMaterialsUniversityFilter = "";
let lastMaterialsCourseFilter = "";

// Render study materials
function renderMaterials() {
    const container = document.getElementById('materialsContainer');
    const emptyMessage = document.getElementById('emptyMaterialsMessage');
    
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    const materials = appState.materials || [];
    
    // Filter materials
    const filtered = materials.filter(m => {
        // Search filter (title or description)
        if (lastMaterialsSearchFilter) {
            const search = lastMaterialsSearchFilter.toLowerCase();
            const matchesTitle = m.title && m.title.toLowerCase().includes(search);
            const matchesDesc = m.description && m.description.toLowerCase().includes(search);
            if (!matchesTitle && !matchesDesc) return false;
        }
        // University filter
        if (lastMaterialsUniversityFilter) {
            if (m.university !== lastMaterialsUniversityFilter) return false;
        }
        // Course filter
        if (lastMaterialsCourseFilter) {
            if (m.course !== lastMaterialsCourseFilter) return false;
        }
        return true;
    });

    if (filtered.length === 0) {
        container.style.display = 'none';
        if (emptyMessage) emptyMessage.style.display = 'block';
        return;
    }
    
    if (emptyMessage) emptyMessage.style.display = 'none';
    container.style.display = 'grid';
    
    // Render cards
    container.innerHTML = filtered.map(m => {
        const isPdf = m.fileType === 'application/pdf' || (m.fileName && m.fileName.toLowerCase().endsWith('.pdf'));
        const iconClass = isPdf ? 'pdf' : 'image';
        const iconMarkup = isPdf ? '<i class="fas fa-file-pdf"></i>' : '<i class="fas fa-file-image"></i>';
        
        // Size string helper
        let sizeStr = "Unknown size";
        if (m.fileSize) {
            sizeStr = m.fileSize > 1024 * 1024 
                ? (m.fileSize / (1024 * 1024)).toFixed(2) + " MB"
                : (m.fileSize / 1024).toFixed(2) + " KB";
        }
        
        // Owner options
        const isOwner = appState.currentUser && (String(m.uploaderId) === String(appState.currentUser.id));
        const ownerMarkup = isOwner ? `
            <div class="material-actions-owner">
                <button class="delete-btn" onclick="deleteMaterial(${m.id})" title="Delete Material">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        ` : '';

        // Avatar fallback
        const uploaderName = m.uploaderName || "Anonymous";
        const avatarSrc = (appState.userAvatars && appState.userAvatars[m.uploaderId]) 
            ? appState.userAvatars[m.uploaderId] 
            : 'images/default-avatar.svg';

        return `
            <div class="material-card" data-id="${m.id}">
                ${ownerMarkup}
                <div class="material-card-header">
                    <div class="material-card-icon ${iconClass}">
                        ${iconMarkup}
                    </div>
                    <h3 class="material-card-title">${m.title}</h3>
                </div>
                <p class="material-card-desc">${m.description || "No description provided."}</p>
                <div class="material-card-meta">
                    <div class="material-meta-row">
                        <span class="material-badge" title="${m.university}">${m.university}</span>
                        <span class="material-badge" title="${m.course}">${m.course}</span>
                    </div>
                    <div class="material-meta-row">
                        <div class="material-uploader">
                            <img class="material-uploader-avatar" src="${avatarSrc}" alt="Avatar" />
                            <span>${uploaderName}</span>
                        </div>
                        <span>${sizeStr}</span>
                    </div>
                </div>
                <div class="material-card-actions">
                    <button class="btn btn-outline" onclick="viewMaterial(${m.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-primary" onclick="downloadMaterial(${m.id})">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Setup Filters
function setupMaterialsFilters() {
    const searchInput = document.getElementById('materialsSearchInput');
    const uniInput = document.getElementById('materialsUniversityInput');
    const courseInput = document.getElementById('materialsCourseInput');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            lastMaterialsSearchFilter = this.value.trim();
            renderMaterials();
        }, 300));
    }
    
    if (uniInput) {
        setupFilterDropdown('materialsUniversityInput', 'materialsUniversityDropdown', allUniversities);
        uniInput.addEventListener('change', function() {
            lastMaterialsUniversityFilter = this.value;
            renderMaterials();
        });
        uniInput.addEventListener('input', function() {
            if (this.value === "") {
                lastMaterialsUniversityFilter = "";
                renderMaterials();
            }
        });
    }
    
    if (courseInput) {
        setupFilterDropdown('materialsCourseInput', 'materialsCourseDropdown', allCourses);
        courseInput.addEventListener('change', function() {
            lastMaterialsCourseFilter = this.value;
            renderMaterials();
        });
        courseInput.addEventListener('input', function() {
            if (this.value === "") {
                lastMaterialsCourseFilter = "";
                renderMaterials();
            }
        });
    }

    // Dropzone Events
    const dropzone = document.getElementById('fileDropzone');
    const fileInput = document.getElementById('materialFile');
    
    if (dropzone && fileInput) {
        dropzone.addEventListener('click', () => fileInput.click());
        
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });
        
        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });
        
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                handleMaterialFileSelect(e.dataTransfer.files[0]);
            }
        });
        
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                handleMaterialFileSelect(this.files[0]);
            }
        });
    }
    
    // Remove button
    const removeBtn = document.getElementById('removeFileBtn');
    if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            resetMaterialUploadPreview();
        });
    }
}

// Handle File selection
function handleMaterialFileSelect(file) {
    if (!file) return;
    
    const fileType = file.type;
    const isImage = fileType.startsWith('image/');
    const isPdf = fileType === 'application/pdf';
    
    if (!isImage && !isPdf) {
        showToast('Invalid file format. Please upload PDF or image.', 'error');
        return;
    }
    
    // Read file as base64
    const reader = new FileReader();
    reader.onload = function(e) {
        selectedMaterialFileBase64 = e.target.result;
        selectedMaterialFileName = file.name;
        selectedMaterialFileType = fileType;
        selectedMaterialFileSize = file.size;
        
        // Show file preview
        const dropzoneContent = document.getElementById('dropzoneContent');
        const filePreview = document.getElementById('filePreview');
        const previewIcon = document.getElementById('previewIcon');
        const previewName = document.getElementById('previewName');
        const previewSize = document.getElementById('previewSize');
        
        if (dropzoneContent && filePreview && previewIcon && previewName && previewSize) {
            dropzoneContent.style.display = 'none';
            filePreview.style.display = 'flex';
            previewName.textContent = file.name;
            
            let sizeText = (file.size / 1024).toFixed(2) + " KB";
            if (file.size > 1024 * 1024) {
                sizeText = (file.size / (1024 * 1024)).toFixed(2) + " MB";
            }
            previewSize.textContent = sizeText;
            
            if (isPdf) {
                previewIcon.className = 'fas fa-file-pdf';
                previewIcon.style.color = '#e74c3c';
            } else {
                previewIcon.className = 'fas fa-file-image';
                previewIcon.style.color = '#3498db';
            }
        }
    };
    reader.onerror = function() {
        showToast('Error reading file.', 'error');
    };
    reader.readAsDataURL(file);
}

// Reset preview
function resetMaterialUploadPreview() {
    selectedMaterialFileBase64 = null;
    selectedMaterialFileName = "";
    selectedMaterialFileType = "";
    selectedMaterialFileSize = 0;
    
    const fileInput = document.getElementById('materialFile');
    if (fileInput) fileInput.value = '';
    
    const dropzoneContent = document.getElementById('dropzoneContent');
    const filePreview = document.getElementById('filePreview');
    if (dropzoneContent && filePreview) {
        dropzoneContent.style.display = 'block';
        filePreview.style.display = 'none';
    }
}

// View material (opens Base64 PDF in a new tab, or displays image in viewer)
function viewMaterial(id) {
    const materials = appState.materials || [];
    const item = materials.find(m => m.id === id);
    if (!item || !item.fileBase64) {
        showToast('Material file not found.', 'error');
        return;
    }
    
    const isPdf = item.fileType === 'application/pdf' || (item.fileName && item.fileName.toLowerCase().endsWith('.pdf'));
    
    if (isPdf) {
        // Open PDF in a new tab
        const win = window.open();
        if (win) {
            win.document.write(`
                <iframe src="${item.fileBase64}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>
            `);
            win.document.title = item.title;
        } else {
            showToast('Popup blocked. Please allow popups.', 'info');
        }
    } else {
        // Show Image in Photo viewer modal
        const photoModal = document.getElementById('photoViewModal');
        if (photoModal) {
            photoModal.innerHTML = `
                <div class="photo-view-content">
                    <span class="photo-view-close" onclick="document.getElementById('photoViewModal').classList.remove('active')">&times;</span>
                    <img src="${item.fileBase64}" alt="${item.title}" style="max-width: 90vw; max-height: 90vh; border-radius: 8px;" />
                    <h3 style="color: white; margin-top: 10px; text-align: center;">${item.title}</h3>
                </div>
            `;
            photoModal.classList.add('active');
        }
    }
}

// Download file
function downloadMaterial(id) {
    const materials = appState.materials || [];
    const item = materials.find(m => m.id === id);
    if (!item || !item.fileBase64) {
        showToast('Material file not found.', 'error');
        return;
    }
    
    const link = document.createElement('a');
    link.href = item.fileBase64;
    link.download = item.fileName || "material";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Delete Material
async function deleteMaterial(id) {
    if (!confirm('Are you sure you want to delete this study material?')) return;
    
    appState.materials = appState.materials.filter(m => m.id !== id);
    renderMaterials();
    await saveMaterialsToStorage();
    showToast('Study material deleted successfully!');
}

// Setup Upload Material Dialog
function setupUploadMaterialDialog() {
    const uploadBtn = document.getElementById('uploadMaterialBtn');
    const emptyUploadBtn = document.getElementById('emptyMaterialsUploadBtn');
    const dialog = document.getElementById('uploadMaterialDialog');
    const closeBtn = document.getElementById('closeMaterialDialog');
    const cancelBtn = document.getElementById('cancelMaterialUpload');
    const form = document.getElementById('uploadMaterialForm');

    if (!dialog || !form) return;

    const openDialog = () => {
        if (!appState.currentUser) {
            showToast('Please log in to upload materials.', 'error');
            return;
        }
        resetMaterialUploadPreview();
        form.reset();
        // pre-fill university and course if available from user profile
        const uniInput = document.getElementById('materialUniversity');
        const courseInput = document.getElementById('materialCourse');
        if (uniInput && appState.currentUser.university) {
            uniInput.value = appState.currentUser.university;
        }
        if (courseInput && appState.currentUser.course) {
            courseInput.value = appState.currentUser.course;
        }
        showDialog('uploadMaterialDialog');
    };

    if (uploadBtn) {
        uploadBtn.addEventListener('click', openDialog);
    }
    if (emptyUploadBtn) {
        emptyUploadBtn.addEventListener('click', openDialog);
    }

    const closeDialog = () => {
        hideDialog('uploadMaterialDialog');
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', closeDialog);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeDialog);
    }

    // Set up dropdowns for university and course inside upload dialog
    setupFilterDropdown('materialUniversity', 'materialUniversityDropdown', allUniversities);
    setupFilterDropdown('materialCourse', 'materialCourseDropdown', allCourses);

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!appState.currentUser) {
            showToast('Please log in to upload materials.', 'error');
            return;
        }

        const title = document.getElementById('materialTitle').value.trim();
        const description = document.getElementById('materialDescription').value.trim();
        const university = document.getElementById('materialUniversity').value.trim();
        const course = document.getElementById('materialCourse').value.trim();

        if (!title || !university || !course) {
            showToast('Please fill all required fields.', 'error');
            return;
        }

        if (!selectedMaterialFileBase64) {
            showToast('Please select a PDF or image file to upload.', 'error');
            return;
        }

        const newMaterial = {
            id: Date.now(),
            title: title,
            description: description,
            university: university,
            course: course,
            fileName: selectedMaterialFileName,
            fileType: selectedMaterialFileType,
            fileSize: selectedMaterialFileSize,
            fileBase64: selectedMaterialFileBase64,
            uploaderId: appState.currentUser.id,
            uploaderName: `${appState.currentUser.firstName} ${appState.currentUser.lastName}`.trim(),
            createdAt: new Date().toISOString()
        };

        if (!appState.materials) {
            appState.materials = [];
        }

        appState.materials.push(newMaterial);
        
        // Show loading state
        const submitBtn = document.getElementById('submitMaterialUpload');
        let originalText = 'Upload';
        if (submitBtn) {
            originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        }

        try {
            await saveMaterialsToStorage();
            renderMaterials();
            showToast('Study material uploaded successfully!');
            closeDialog();
        } catch (error) {
            console.error('Error saving material:', error);
            showToast('Failed to upload material.', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        }
    });
}

