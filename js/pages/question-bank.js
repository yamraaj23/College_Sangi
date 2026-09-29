// ============================================
// College Sangi - Question Bank Page Controller
// ============================================

        function addEditDeleteButtonsToQuestions() {
            // Remove any existing edit/delete buttons first
            document.querySelectorAll('.question-actions-owner').forEach(btn => btn.remove());
            
            // Add edit/delete buttons to user's question photos
            appState.questionPhotos.forEach(question => {
                const currentUserName = appState.currentUser ? 
                    `${appState.currentUser.firstName} ${appState.currentUser.lastName}` : '';
                
                if (question.author === currentUserName) {
                    const questionElement = document.querySelector(`.question-photo-item[data-id="${question.id}"] .question-photo-details`);
                    if (questionElement) {
                        // Create owner actions container
                        const ownerActions = document.createElement('div');
                        ownerActions.className = 'question-actions-owner';
                        ownerActions.style.display = 'flex';
                        ownerActions.style.gap = '10px';
                        ownerActions.style.marginTop = '10px';
                        
                        ownerActions.innerHTML = `
                            <button class="edit-btn" data-id="${question.id}" data-type="question" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-btn" data-id="${question.id}" data-type="question" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        `;
                        
                        // Insert after the view button
                        const viewBtn = questionElement.querySelector('.view-question-btn');
                        if (viewBtn) {
                            viewBtn.parentNode.insertBefore(ownerActions, viewBtn.nextSibling);
                        } else {
                            questionElement.appendChild(ownerActions);
                        }
                    }
                }
            });
            
            // Add event listeners for edit/delete buttons
            document.querySelectorAll('.edit-btn[data-type="question"]').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const questionId = parseInt(this.getAttribute('data-id'));
                    editQuestion(questionId);
                });
            });
            
            document.querySelectorAll('.delete-btn[data-type="question"]').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const questionId = parseInt(this.getAttribute('data-id'));
                    deleteQuestion(questionId);
                });
            });
        }

        // Edit question function
        function editQuestion(questionId) {
            const question = appState.questionPhotos.find(q => q.id === questionId);
            if (!question) return;
            
            // Create edit question dialog
            const modal = document.createElement('div');
            modal.className = 'dialog-overlay active';
            modal.id = 'editQuestionDialog';
            
            // Create image preview HTML
            let imagePreviewHTML = '';
            if (question.imageUrl) {
                imagePreviewHTML = `<img src="${question.imageUrl}" alt="Question preview">`;
            } else {
                imagePreviewHTML = `
                    <div class="image-preview-placeholder">
                        <i class="fas fa-image"></i>
                        <p>No image selected</p>
                    </div>
                `;
            }
            
            modal.innerHTML = `
                <div class="dialog-box">
                    <div class="dialog-header">
                        <h3 class="dialog-title">Edit Question Photo</h3>
                        <button class="dialog-close" id="closeEditQuestionDialog">&times;</button>
                    </div>
                    <div class="dialog-body">
                        <form id="editQuestionForm">
                            <div class="question-upload-container">
                                <div class="form-group">
                                    <label for="editQuestionTitle">Question Title</label>
                                    <input type="text" id="editQuestionTitle" class="form-control" value="${question.title}" required>
                                </div>
                                
                                <div class="form-group">
                                    <label>Question Photo</label>
                                    <div class="image-preview" id="editQuestionImagePreview">
                                        ${imagePreviewHTML}
                                    </div>
                                    <div class="file-input-wrapper" style="margin-top: 10px;">
                                        <button type="button" class="btn btn-outline" style="width: 100%;">
                                            <i class="fas fa-upload"></i> Choose New Image (Optional)
                                        </button>
                                        <input type="file" id="editQuestionImage" accept="image/*">
                                    </div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="editQuestionUniversity">University</label>
                                        <select id="editQuestionUniversity" class="form-control" required>
                                            <option value="Tribhuvan University" ${question.university === 'Tribhuvan University' ? 'selected' : ''}>Tribhuvan University</option>
                                            <option value="Kathmandu University" ${question.university === 'Kathmandu University' ? 'selected' : ''}>Kathmandu University</option>
                                            <option value="Purbanchal University" ${question.university === 'Purbanchal University' ? 'selected' : ''}>Purbanchal University</option>
                                            <option value="Pokhara University" ${question.university === 'Pokhara University' ? 'selected' : ''}>Pokhara University</option>
                                            <option value="Lumbini Buddhist University" ${question.university === 'Lumbini Buddhist University' ? 'selected' : ''}>Lumbini Buddhist University</option>
                                            <option value="Agriculture and Forestry University" ${question.university === 'Agriculture and Forestry University' ? 'selected' : ''}>Agriculture and Forestry University</option>
                                            <option value="Nepal Sanskrit University" ${question.university === 'Nepal Sanskrit University' ? 'selected' : ''}>Nepal Sanskrit University</option>
                                            <option value="Far-Western University" ${question.university === 'Far-Western University' ? 'selected' : ''}>Far-Western University</option>
                                            <option value="Mid Western University" ${question.university === 'Mid Western University' ? 'selected' : ''}>Mid Western University</option>
                                            <option value="Nepal Open University" ${question.university === 'Nepal Open University' ? 'selected' : ''}>Nepal Open University</option>
                                            <option value="Rajarshi Janak University" ${question.university === 'Rajarshi Janak University' ? 'selected' : ''}>Rajarshi Janak University</option>
                                            <option value="Madan Bhandari University" ${question.university === 'Madan Bhandari University' ? 'selected' : ''}>Madan Bhandari University</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="editQuestionCourse">Course</label>
                                        <select id="editQuestionCourse" class="form-control" required>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="editQuestionYear">Year</label>
                                        <select id="editQuestionYear" class="form-control" required>
                                            <option value="1" ${question.year === 1 ? 'selected' : ''}>First Year</option>
                                            <option value="2" ${question.year === 2 ? 'selected' : ''}>Second Year</option>
                                            <option value="3" ${question.year === 3 ? 'selected' : ''}>Third Year</option>
                                            <option value="4" ${question.year === 4 ? 'selected' : ''}>Fourth Year</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="editQuestionSemester">Semester</label>
                                        <select id="editQuestionSemester" class="form-control" required>
                                            <option value="1" ${question.semester === 1 ? 'selected' : ''}>First Semester</option>
                                            <option value="2" ${question.semester === 2 ? 'selected' : ''}>Second Semester</option>
                                            <option value="3" ${question.semester === 3 ? 'selected' : ''}>Third Semester</option>
                                            <option value="4" ${question.semester === 4 ? 'selected' : ''}>Fourth Semester</option>
                                            <option value="5" ${question.semester === 5 ? 'selected' : ''}>Fifth Semester</option>
                                            <option value="6" ${question.semester === 6 ? 'selected' : ''}>Sixth Semester</option>
                                            <option value="7" ${question.semester === 7 ? 'selected' : ''}>Seventh Semester</option>
                                            <option value="8" ${question.semester === 8 ? 'selected' : ''}>Eighth Semester</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="dialog-footer">
                        <button class="btn btn-outline" id="cancelEditQuestion">Cancel</button>
                        <button class="btn btn-primary" id="submitEditQuestion" data-id="${questionId}">Update Question</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Populate course select based on university
            const editQuestionUniversitySelect = modal.querySelector('#editQuestionUniversity');
            const editQuestionCourseSelect = modal.querySelector('#editQuestionCourse');
            
            function populateEditQuestionCourses() {
                const selectedUniversity = editQuestionUniversitySelect.value;
                const courses = getCoursesForUniversity(selectedUniversity);
                editQuestionCourseSelect.innerHTML = '';
                courses.forEach(course => {
                    const option = document.createElement('option');
                    option.value = course;
                    option.textContent = course;
                    if (course === question.course) {
                        option.selected = true;
                    }
                    editQuestionCourseSelect.appendChild(option);
                });
            }
            
            // Initial population
            populateEditQuestionCourses();
            
            // Update courses when university changes
            editQuestionUniversitySelect.addEventListener('change', populateEditQuestionCourses);
            
            // Add event listeners
            modal.querySelector('#closeEditQuestionDialog').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            modal.querySelector('#cancelEditQuestion').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            // Image preview functionality
            const editQuestionImage = modal.querySelector('#editQuestionImage');
            const editQuestionImagePreview = modal.querySelector('#editQuestionImagePreview');
            
            editQuestionImage.addEventListener('change', function() {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        editQuestionImagePreview.innerHTML = `<img src="${e.target.result}" alt="Question preview">`;
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            modal.querySelector('#submitEditQuestion').addEventListener('click', () => {
                const title = document.getElementById('editQuestionTitle').value;
                const university = document.getElementById('editQuestionUniversity').value;
                const course = document.getElementById('editQuestionCourse').value;
                const year = document.getElementById('editQuestionYear').value;
                const semester = document.getElementById('editQuestionSemester').value;
                const imageFile = editQuestionImage.files[0];
                
                if (!title || !university || !course || !year || !semester) {
                    showToast('Please fill in all required fields', 'error');
                    return;
                }
                
                // Update question data
                question.title = title;
                question.university = university;
                question.course = course;
                question.year = parseInt(year);
                question.semester = parseInt(semester);
                question.editDate = new Date().toISOString().split('T')[0];
                question.edited = true;
                
                // Update image if a new one was selected
                if (imageFile) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        question.imageUrl = e.target.result;
                        
                        saveQuestionPhotosToStorage();
                        renderQuestionPhotos();
                        addEditDeleteButtonsToQuestions();
                        
                        document.body.removeChild(modal);
                        showToast('Question updated successfully!');
                    };
                    reader.readAsDataURL(imageFile);
                } else {
                    // Keep existing image
                    saveQuestionPhotosToStorage();
                    renderQuestionPhotos();
                    addEditDeleteButtonsToQuestions();
                    
                    document.body.removeChild(modal);
                    showToast('Question updated successfully!');
                }
            });
        }

        // Delete question function
        function deleteQuestion(questionId) {
            // Show custom confirmation dialog
            const deleteQuestionDialog = document.getElementById('deleteQuestionConfirmDialog');
            const deleteQuestionCancelBtn = document.getElementById('deleteQuestionCancelBtn');
            const deleteQuestionConfirmBtn = document.getElementById('deleteQuestionConfirmBtn');

            if (deleteQuestionDialog && deleteQuestionCancelBtn && deleteQuestionConfirmBtn) {
                // Show dialog
                deleteQuestionDialog.classList.add('active');

                // Cancel button
                deleteQuestionCancelBtn.onclick = () => {
                    deleteQuestionDialog.classList.remove('active');
                };

                // Confirm delete button
                deleteQuestionConfirmBtn.onclick = () => {
                    deleteQuestionDialog.classList.remove('active');
                    
                    const questionIndex = appState.questionPhotos.findIndex(q => q.id === questionId);
                    if (questionIndex !== -1) {
                        appState.questionPhotos.splice(questionIndex, 1);
                        saveQuestionPhotosToStorage();
                        
                        renderQuestionPhotos();
                        addEditDeleteButtonsToQuestions();
                        showToast('Question photo deleted successfully!');
                    }
                };

                // Close dialog when clicking outside
                deleteQuestionDialog.addEventListener('click', (e) => {
                    if (e.target === deleteQuestionDialog) {
                        deleteQuestionDialog.classList.remove('active');
                    }
                });
            } else {
                console.warn('Delete question dialog elements not found');
            }
        }

        // Render forum posts

        function renderQuestionPhotos() {
            console.log('❓ renderQuestionPhotos called');
            const questionPhotosContainer = document.getElementById('questionPhotosContainer');
            const emptyQuestionBankMessage = document.getElementById('emptyQuestionBankMessage');
            
            if (!questionPhotosContainer) {
                console.warn('❌ Question photos container not found');
                return;
            }
            console.log('✅ Question photos container found');
            questionPhotosContainer.innerHTML = '';
            
            let questionsToShow = appState.questionPhotos;
            
            // Apply university filter from text input (case-insensitive substring match)
            const universityInput = document.getElementById('questionBankUniversityInput');
            if (universityInput) {
                const universityFilterValue = universityInput.value.trim().toLowerCase();
                if (universityFilterValue !== '') {
                    questionsToShow = questionsToShow.filter(
                        question => question.university.toLowerCase().includes(universityFilterValue)
                    );
                }
            }
            
            // Apply course filter from text input (case-insensitive substring match)
            const courseInput = document.getElementById('questionBankCourseInput');
            if (courseInput) {
                const courseFilterValue = courseInput.value.trim().toLowerCase();
                if (courseFilterValue !== '') {
                    questionsToShow = questionsToShow.filter(
                        question => question.course.toLowerCase().includes(courseFilterValue)
                    );
                }
            }
            
            // Apply BS Starting filter (academic year)
            const bsStartingInput = document.getElementById('bsStartingInput');
            if (bsStartingInput) {
                const bsStartingFilterValue = bsStartingInput.value.trim();
                if (bsStartingFilterValue !== '') {
                    questionsToShow = questionsToShow.filter(
                        question => question.bsStarting && question.bsStarting.toString().includes(bsStartingFilterValue)
                    );
                }
            }
            
            // Apply year filter
            const yearFilter = document.getElementById('yearFilter');
            if (yearFilter && yearFilter.value !== 'all') {
                questionsToShow = questionsToShow.filter(
                    question => question.year.toString() === yearFilter.value
                );
            }
            
            // Apply semester filter
            const semesterFilter = document.getElementById('semesterFilter');
            if (semesterFilter && semesterFilter.value !== 'all') {
                questionsToShow = questionsToShow.filter(
                    question => question.semester.toString() === semesterFilter.value
                );
            }
            
            if (questionsToShow.length === 0) {
                if (emptyQuestionBankMessage) {
                    emptyQuestionBankMessage.style.display = 'block';
                    const pTag = emptyQuestionBankMessage.querySelector('p');
                    if (pTag) pTag.textContent = 'No questions found matching your filters.';
                }
                questionPhotosContainer.style.display = 'none';
                return;
            }
            
            if (emptyQuestionBankMessage) {
                emptyQuestionBankMessage.style.display = 'none';
            }
            
            // Reset pagination if filters changed
            const currentUniversityFilter = universityInput ? universityInput.value.trim().toLowerCase() : '';
            const currentCourseFilter = courseInput ? courseInput.value.trim().toLowerCase() : '';
            const currentBSStartingFilter = bsStartingInput ? bsStartingInput.value.trim() : '';
            const currentYearFilter = yearFilter ? yearFilter.value : 'all';
            const currentSemesterFilter = semesterFilter ? semesterFilter.value : 'all';
            
            if (paginationState.lastQuestionsUniversityFilter !== currentUniversityFilter || 
                paginationState.lastQuestionsCourseFilter !== currentCourseFilter ||
                paginationState.lastQuestionsBSStartingFilter !== currentBSStartingFilter ||
                paginationState.lastQuestionsYearFilter !== currentYearFilter ||
                paginationState.lastQuestionsSemesterFilter !== currentSemesterFilter) {
                paginationState.questionsLoaded = 15;
                paginationState.lastQuestionsUniversityFilter = currentUniversityFilter;
                paginationState.lastQuestionsCourseFilter = currentCourseFilter;
                paginationState.lastQuestionsBSStartingFilter = currentBSStartingFilter;
                paginationState.lastQuestionsYearFilter = currentYearFilter;
                paginationState.lastQuestionsSemesterFilter = currentSemesterFilter;
            }
            
            // Slice questions for pagination
            const questionsToDisplay = questionsToShow.slice(0, paginationState.questionsLoaded);
            
            questionPhotosContainer.style.display = 'grid';
            
            questionsToDisplay.forEach(question => {
                const questionElement = document.createElement('div');
                questionElement.className = 'question-photo-item';
                questionElement.setAttribute('data-id', question.id);
                
                const editedText = question.edited ? `<p style="color: var(--text-light); font-size: 0.7rem; margin-top: 3px; line-height: 1.2;"><i>Edited on ${formatDate(question.editDate)}</i></p>` : '';
                
                questionElement.innerHTML = `
                    <div class="question-photo-image">
                        <img src="${question.imageUrl}" alt="${question.title}">
                        <div class="question-overlay">
                            <button class="download-image-btn" data-id="${question.id}">
                                <i class="fas fa-download"></i> Image
                            </button>
                            <button class="download-pdf-btn" data-id="${question.id}">
                                <i class="fas fa-file-pdf"></i> PDF
                            </button>
                        </div>
                    </div>
                    <div class="question-photo-details">
                        <h4>${question.title}</h4>
                        <div class="question-photo-meta">
                            <span class="university-tag" style="background-color: #e8f4f8; color: #3498db; padding: 2px 4px; border-radius: 3px; font-size: 0.65rem;">${question.university}</span>
                            <span style="font-size: 0.65rem;">${question.course}${question.bsStarting ? ' • ' + question.bsStarting + ' BS': ''}</span>
                        </div>
                        <div class="question-photo-meta">
                            <span></span>
                            <span style="font-size: 0.65rem;">${question.year} Y  •  ${question.semester} S</span>
                        </div>
                        <div class="question-photo-meta">
                            <span class="profile-link" data-author="${question.author}" style="font-size: 0.65rem;">${question.author}</span>
                        </div>
                        ${editedText}
                        
                        <div class="question-photo-actions" style="display: flex; gap: 6px; margin-top: 6px;">
                            <button class="btn btn-outline view-question-btn" style="padding: 4px 8px; flex: 1; font-size: 0.7rem;">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </div>
                    </div>
                `;
                
                questionPhotosContainer.appendChild(questionElement);
                
                // Add event listener for view question button
                questionElement.querySelector('.view-question-btn').addEventListener('click', function() {
                    const questionId = parseInt(questionElement.getAttribute('data-id'));
                    viewQuestion(questionId);
                });
                
                // Add event listener for download image button
                questionElement.querySelector('.download-image-btn').addEventListener('click', function(e) {
                    e.stopPropagation();
                    const questionId = parseInt(this.getAttribute('data-id'));
                    downloadQuestion(questionId, 'image');
                });
                
                // Add event listener for download PDF button
                questionElement.querySelector('.download-pdf-btn').addEventListener('click', function(e) {
                    e.stopPropagation();
                    const questionId = parseInt(this.getAttribute('data-id'));
                    downloadQuestion(questionId, 'pdf');
                });
            });
            
            // Add Load More button if there are more questions
            if (questionsToShow.length > paginationState.questionsLoaded) {
                const loadMoreBtn = document.createElement('button');
                loadMoreBtn.className = 'load-more-btn';
                loadMoreBtn.textContent = 'Load More Questions';
                loadMoreBtn.style.gridColumn = '1 / -1';
                loadMoreBtn.addEventListener('click', () => {
                    paginationState.questionsLoaded += 15;
                    renderQuestionPhotos();
                });
                questionPhotosContainer.appendChild(loadMoreBtn);
            }
            
            // Add edit/delete buttons to user's questions
            addEditDeleteButtonsToQuestions();
        }

        // Download question as image or PDF
        function downloadQuestion(questionId, format) {
            const question = appState.questionPhotos.find(q => q.id === questionId);
            if (!question) return;
            
            // Create a temporary link element
            const link = document.createElement('a');
            const filename = `${question.title.replace(/\s+/g, '_')}_${question.course}_${question.year}_Sem${question.semester}`;
            
            if (format === 'image') {
                // Download as JPEG image
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    // Convert canvas to JPEG data URL
                    const jpegData = canvas.toDataURL('image/jpeg', 0.95);
                    
                    link.href = jpegData;
                    link.download = `${filename}.jpeg`;
                    link.click();
                    showToast('Downloading image...');
                };
                
                img.onerror = function() {
                    showToast('Error loading image. Please try again.');
                };
                
                img.src = question.imageUrl;
            } else if (format === 'pdf') {
                // Download as PDF using html2pdf library
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                img.onload = function() {
                    // Create a container for the PDF content
                    const element = document.createElement('div');
                    element.style.padding = '20px';
                    element.style.backgroundColor = 'white';
                    element.innerHTML = `
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h2 style="margin: 0 0 10px 0; font-size: 18px;">${question.title}</h2>
                            <p style="margin: 0; color: #666; font-size: 12px;">
                                ${question.course} | Year ${question.year} | Semester ${question.semester}
                            </p>
                        </div>
                        <div style="text-align: center; margin-bottom: 20px;">
                            <img src="${question.imageUrl}" style="max-width: 100%; max-height: 600px; border: 1px solid #ddd; border-radius: 4px;" />
                        </div>
                        <div style="font-size: 11px; color: #999; text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee;">
                            <p>Downloaded from College Sangi - Question Bank</p>
                        </div>
                    `;
                    
                    const opt = {
                        margin: 10,
                        filename: `${filename}.pdf`,
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2, allowTaint: true, useCORS: true },
                        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
                    };
                    
                    html2pdf().set(opt).from(element).save();
                    showToast('PDF downloaded successfully!');
                };
                
                img.onerror = function() {
                    showToast('Error loading image for PDF. Please try again.');
                };
                
                img.src = question.imageUrl;
            }
        }

        // View question in modal with download options
        function viewQuestion(questionId) {
            const question = appState.questionPhotos.find(q => q.id === questionId);
            if (!question) return;
            
            const editedText = question.edited ? ` (edited on ${formatDate(question.editDate)})` : '';
            
            // Create modal for question view
            const modal = document.createElement('div');
            modal.className = 'photo-view-modal';
            modal.style.display = 'flex';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">${question.title}${editedText}</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body-flex">
                        <div class="photo-view-image">
                            <img src="${question.imageUrl}" alt="${question.title}">
                        </div>
                        <div class="photo-view-details">
                            <div class="photo-view-meta">
                                <span class="photo-view-author profile-link" data-author="${question.author}">${question.author}</span>
                                <span class="photo-view-date">${formatDate(question.date)}${editedText}</span>
                            </div>
                            <div class="photo-view-description">
                                <p><strong>University:</strong> ${question.university}</p>
                                <p><strong>Course:</strong> ${question.course}</p>
                                ${question.bsStarting ? `<p><strong>BS Starting:</strong> ${question.bsStarting}</p>` : ''}
                                <p><strong>Year:</strong> ${question.year} | <strong>Semester:</strong> ${question.semester}</p>
                            </div>
                            
                            <div class="photo-view-actions" style="display: flex; gap: 10px; margin-top: 15px; flex-direction: column;">
                                <button class="btn btn-primary download-image-btn" data-id="${question.id}" style="width: 100%;">
                                    <i class="fas fa-download"></i> Download Image
                                </button>
                                <button class="btn btn-accent download-pdf-btn" data-id="${question.id}" style="width: 100%;">
                                    <i class="fas fa-file-pdf"></i> Download as PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Add event listeners
            modal.querySelector('.close-modal').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            modal.querySelector('.download-image-btn').addEventListener('click', function() {
                const questionId = parseInt(this.getAttribute('data-id'));
                downloadQuestion(questionId, 'image');
            });
            
            modal.querySelector('.download-pdf-btn').addEventListener('click', function() {
                const questionId = parseInt(this.getAttribute('data-id'));
                downloadQuestion(questionId, 'pdf');
            });
        }

        // Update profile page with user data

        function setupQuestionBankFilters() {
            // Setup dropdowns for university, course and BS starting year
            setupFilterDropdown('questionBankUniversityInput', 'questionBankUniversityDropdown', allUniversities);
            setupFilterDropdown('questionBankCourseInput', 'questionBankCourseDropdown', allCourses);
            setupFilterDropdown('bsStartingInput', 'bsStartingDropdown', allAcademicYears);

            // Add university change listener to update courses
            const questionBankUniversityInput = document.getElementById('questionBankUniversityInput');
            if (questionBankUniversityInput) {
                questionBankUniversityInput.addEventListener('change', () => {
                    updateCoursesForUniversity('questionBankUniversityInput', 'questionBankCourseInput', 'questionBankCourseDropdown');
                    renderQuestionPhotos();
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
            
            // University input filter
            const questionUniversityInput = document.getElementById('questionBankUniversityInput');
            if (questionUniversityInput) {
                questionUniversityInput.addEventListener('input', createDebouncedRender(renderQuestionPhotos));
            }
            
            // Course input filter
            const questionCourseInput = document.getElementById('questionBankCourseInput');
            if (questionCourseInput) {
                questionCourseInput.addEventListener('input', createDebouncedRender(renderQuestionPhotos));
            }

            // BS Starting input filter
            const bsStartingInput = document.getElementById('bsStartingInput');
            if (bsStartingInput) {
                bsStartingInput.addEventListener('input', createDebouncedRender(renderQuestionPhotos));
            }
            
            // Year filter (dropdown - keep as change event)
            const yearFilter = document.getElementById('yearFilter');
            if (yearFilter) {
                yearFilter.addEventListener('change', function() {
                    renderQuestionPhotos();
                });
            }
            
            // Semester filter (dropdown - keep as change event)
            const semesterFilter = document.getElementById('semesterFilter');
            if (semesterFilter) {
                semesterFilter.addEventListener('change', function() {
                    renderQuestionPhotos();
                });
            }
        }

        // Set up filter event listeners

        function setupUploadQuestionDialog() {
            const uploadQuestionBtn = document.getElementById('uploadQuestionBtn');
            const emptyQuestionBankUploadBtn = document.getElementById('emptyQuestionBankUploadBtn');
            const uploadQuestionDialog = document.getElementById('uploadQuestionDialog');
            const closeQuestionDialog = document.getElementById('closeQuestionDialog');
            const cancelQuestion = document.getElementById('cancelQuestion');
            const submitQuestion = document.getElementById('submitQuestion');
            const uploadQuestionForm = document.getElementById('uploadQuestionForm');
            const questionImage = document.getElementById('questionImage');
            const questionImagePreview = document.getElementById('questionImagePreview');

            // Guard clause: return if elements don't exist
            if (!uploadQuestionDialog || !closeQuestionDialog || !cancelQuestion || !submitQuestion || !uploadQuestionForm || !questionImage || !questionImagePreview) {
                return;
            }

            // Initialize searchable dropdowns inside upload dialog
            try {
                setupFilterDropdown('questionUniversity', 'questionUniversityDropdown', allUniversities);
                setupFilterDropdown('questionCourse', 'questionCourseDropdown', allCourses);
                setupFilterDropdown('questionBsStarting', 'questionBsStartingDropdown', allAcademicYears);
                
                // Add university change listener to update courses
                const questionUniversityInput = document.getElementById('questionUniversity');
                if (questionUniversityInput) {
                    questionUniversityInput.addEventListener('change', () => {
                        updateCoursesForUniversity('questionUniversity', 'questionCourse', 'questionCourseDropdown');
                    });
                }
            } catch (err) {
                // ignore if helper not available yet
            }

            // Handle both upload buttons
            [uploadQuestionBtn, emptyQuestionBankUploadBtn].forEach(btn => {
                if (btn) {
                    btn.addEventListener('click', () => {
                        showDialog('uploadQuestionDialog');
                    });
                }
            });

            closeQuestionDialog.addEventListener('click', () => {
                hideDialog('uploadQuestionDialog');
            });

            cancelQuestion.addEventListener('click', () => {
                hideDialog('uploadQuestionDialog');
            });

            // File upload button click handler
            const uploadBtn = uploadQuestionDialog.querySelector('.file-input-wrapper button');
            if (uploadBtn) {
                uploadBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    questionImage.click();
                });
            }

            // Image preview functionality
            questionImage.addEventListener('change', function() {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        questionImagePreview.innerHTML = `<img src="${e.target.result}" alt="Question preview">`;
                    };
                    reader.readAsDataURL(file);
                }
            });

            submitQuestion.addEventListener('click', () => {
                const title = document.getElementById('questionTitle').value;
                const university = document.getElementById('questionUniversity').value;
                const course = document.getElementById('questionCourse').value;
                const year = document.getElementById('questionYear').value;
                const semester = document.getElementById('questionSemester').value;
                const bsStarting = document.getElementById('questionBsStarting') ? document.getElementById('questionBsStarting').value : '';
                const imageFile = questionImage.files[0];

                if (!title || !university || !course || !year || !semester || !imageFile) {
                    showToast('Please fill in all required fields and select an image', 'error');
                    return;
                }

                // Create image URL from file
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Create new question
                    const newQuestion = {
                        id: Date.now(),
                        title: title,
                        imageUrl: e.target.result,
                        university: university,
                        course: course,
                        year: parseInt(year),
                        bsStarting: bsStarting || '',
                        semester: parseInt(semester),
                        author: `${appState.currentUser.firstName} ${appState.currentUser.lastName}`,
                        date: new Date().toISOString().split('T')[0]
                    };

                    // Add to questions array
                    appState.questionPhotos.unshift(newQuestion);
                    saveQuestionPhotosToStorage();

                    // Update UI
                    renderQuestionPhotos();
                    hideDialog('uploadQuestionDialog');
                    uploadQuestionForm.reset();
                    questionImagePreview.innerHTML = `
                        <div class="image-preview-placeholder">
                            <i class="fas fa-image"></i>
                            <p>No image selected</p>
                        </div>
                    `;
                    showToast('Question uploaded successfully!');
                };
                reader.readAsDataURL(imageFile);
            });
        }

        // Save user settings
