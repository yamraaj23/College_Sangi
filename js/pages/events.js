// ============================================
// College Sangi - Events Page Controller
// ============================================

        function addEditDeleteButtonsToEvents() {
            // Remove any existing edit/delete buttons first
            document.querySelectorAll('.event-actions-owner').forEach(btn => btn.remove());
            
            // Add edit/delete buttons to user's events
            appState.events.forEach(event => {
                const currentUserName = appState.currentUser ? 
                    `${appState.currentUser.firstName} ${appState.currentUser.lastName}` : '';
                
                // Check if current user is the organizer
                if (event.organization.includes(currentUserName.split(' ')[0]) || event.organization === currentUserName) {
                    const eventElement = document.querySelector(`.event-card:nth-child(${Array.from(document.querySelectorAll('.event-card')).findIndex(el => el.textContent.includes(event.title)) + 1})`);
                    if (eventElement) {
                        // Create owner actions container
                        const ownerActions = document.createElement('div');
                        ownerActions.className = 'event-actions-owner';
                        ownerActions.style.padding = '10px';
                        ownerActions.style.display = 'flex';
                        ownerActions.style.gap = '8px';
                        ownerActions.style.borderTop = '1px solid #eee';
                        
                        ownerActions.innerHTML = `
                            <button class="edit-btn" data-id="${event.id}" data-type="event" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-btn" data-id="${event.id}" data-type="event" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        `;
                        
                        // Insert at the end of event card
                        const eventInfo = eventElement.querySelector('.event-info');
                        eventInfo.appendChild(ownerActions);
                    }
                }
            });
            
            // Add event listeners for edit/delete buttons
            document.querySelectorAll('.edit-btn[data-type="event"]').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const eventId = parseInt(this.getAttribute('data-id'));
                    editEvent(eventId);
                });
            });
            
            document.querySelectorAll('.delete-btn[data-type="event"]').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const eventId = parseInt(this.getAttribute('data-id'));
                    deleteEvent(eventId);
                });
            });
        }

        // Edit event function
        function editEvent(eventId) {
            const event = appState.events.find(e => e.id === eventId);
            if (!event) return;
            
            // Create edit event dialog
            const modal = document.createElement('div');
            modal.className = 'dialog-overlay active';
            modal.id = 'editEventDialog';
            
            // Format date for input field
            const formattedDate = event.date;
            
            modal.innerHTML = `
                <div class="dialog-box">
                    <div class="dialog-header">
                        <h3 class="dialog-title">Edit Event</h3>
                        <button class="dialog-close" id="closeEditEventDialog">&times;</button>
                    </div>
                    <div class="dialog-body">
                        <form id="editEventForm">
                            <div class="form-group">
                                <label for="editEventTitle">Event Title</label>
                                <input type="text" id="editEventTitle" class="form-control" value="${event.title}" required>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editEventDate">Date</label>
                                    <input type="date" id="editEventDate" class="form-control" value="${formattedDate}" required>
                                </div>
                                <div class="form-group">
                                    <label for="editEventTime">Time</label>
                                    <input type="time" id="editEventTime" class="form-control" value="${event.time || '18:00'}" required>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editEventLocation">Location</label>
                                    <input type="text" id="editEventLocation" class="form-control" value="${event.location}" required>
                                </div>
                                <div class="form-group">
                                    <label for="editEventUniversity">University</label>
                                    <select id="editEventUniversity" class="form-control" required>
                                        <option value="Tribhuvan University" ${event.university === 'Tribhuvan University' ? 'selected' : ''}>Tribhuvan University</option>
                                        <option value="Kathmandu University" ${event.university === 'Kathmandu University' ? 'selected' : ''}>Kathmandu University</option>
                                        <option value="Purbanchal University" ${event.university === 'Purbanchal University' ? 'selected' : ''}>Purbanchal University</option>
                                        <option value="Pokhara University" ${event.university === 'Pokhara University' ? 'selected' : ''}>Pokhara University</option>
                                        <option value="Lumbini Buddhist University" ${event.university === 'Lumbini Buddhist University' ? 'selected' : ''}>Lumbini Buddhist University</option>
                                        <option value="Agriculture and Forestry University" ${event.university === 'Agriculture and Forestry University' ? 'selected' : ''}>Agriculture and Forestry University</option>
                                        <option value="Nepal Sanskrit University" ${event.university === 'Nepal Sanskrit University' ? 'selected' : ''}>Nepal Sanskrit University</option>
                                        <option value="Far-Western University" ${event.university === 'Far-Western University' ? 'selected' : ''}>Far-Western University</option>
                                        <option value="Mid Western University" ${event.university === 'Mid Western University' ? 'selected' : ''}>Mid Western University</option>
                                        <option value="Nepal Open University" ${event.university === 'Nepal Open University' ? 'selected' : ''}>Nepal Open University</option>
                                        <option value="Rajarshi Janak University" ${event.university === 'Rajarshi Janak University' ? 'selected' : ''}>Rajarshi Janak University</option>
                                        <option value="Madan Bhandari University" ${event.university === 'Madan Bhandari University' ? 'selected' : ''}>Madan Bhandari University</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="editEventOrganization">Organizer</label>
                                <input type="text" id="editEventOrganization" class="form-control" value="${event.organization}" required>
                            </div>
                            <div class="form-group">
                                <label for="editEventCourse">Related Course</label>
                                <select id="editEventCourse" class="form-control">
                                    <option value="">Select course (optional)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="editEventDescription">Event Description</label>
                                <textarea id="editEventDescription" class="form-control" required>${event.description}</textarea>
                            </div>
                        </form>
                    </div>
                    <div class="dialog-footer">
                        <button class="btn btn-outline" id="cancelEditEvent">Cancel</button>
                        <button class="btn btn-primary" id="submitEditEvent" data-id="${eventId}">Update Event</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Populate course select based on university
            const editEventUniversitySelect = modal.querySelector('#editEventUniversity');
            const editEventCourseSelect = modal.querySelector('#editEventCourse');
            
            function populateEditEventCourses() {
                const selectedUniversity = editEventUniversitySelect.value;
                const courses = getCoursesForUniversity(selectedUniversity);
                editEventCourseSelect.innerHTML = '<option value="">Select course (optional)</option>';
                courses.forEach(course => {
                    const option = document.createElement('option');
                    option.value = course;
                    option.textContent = course;
                    if (event.course && course === event.course) {
                        option.selected = true;
                    }
                    editEventCourseSelect.appendChild(option);
                });
            }
            
            // Initial population
            populateEditEventCourses();
            
            // Update courses when university changes
            editEventUniversitySelect.addEventListener('change', populateEditEventCourses);
            
            // Add event listeners
            modal.querySelector('#closeEditEventDialog').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            modal.querySelector('#cancelEditEvent').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            modal.querySelector('#submitEditEvent').addEventListener('click', () => {
                const title = document.getElementById('editEventTitle').value;
                const date = document.getElementById('editEventDate').value;
                const time = document.getElementById('editEventTime').value;
                const location = document.getElementById('editEventLocation').value;
                const university = document.getElementById('editEventUniversity').value;
                const organization = document.getElementById('editEventOrganization').value;
                const course = document.getElementById('editEventCourse').value;
                const description = document.getElementById('editEventDescription').value;
                
                if (!title || !date || !time || !location || !university || !organization || !description) {
                    showToast('Please fill in all required fields', 'error');
                    return;
                }
                
                // Update event data
                event.title = title;
                event.date = date;
                event.time = time;
                event.location = location;
                event.organization = organization;
                event.university = university;
                event.course = course || '';
                event.description = description;
                event.editDate = new Date().toISOString().split('T')[0];
                event.edited = true;
                
                saveEventsToStorage();
                renderEvents();
                addEditDeleteButtonsToEvents();
                
                document.body.removeChild(modal);
                showToast('Event updated successfully!');
            });
        }

        // Delete event function
        function deleteEvent(eventId) {
            if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
                return;
            }
            
            const eventIndex = appState.events.findIndex(e => e.id === eventId);
            if (eventIndex !== -1) {
                appState.events.splice(eventIndex, 1);
                saveEventsToStorage();
                
                renderEvents();
                addEditDeleteButtonsToEvents();
                showToast('Event deleted successfully!');
            }
        }

        // NEW: Edit and Delete Functionality for Question Photos

        function renderEvents() {
            console.log('📅 renderEvents called');
            const eventsContainer = document.getElementById('eventsContainer');
            if (!eventsContainer) {
                console.warn('❌ Events container not found');
                return;
            }
            console.log('✅ Events container found');

            eventsContainer.innerHTML = '';
            
            let eventsToShow = appState.events;
            
            // Apply university filter from text input (case-insensitive substring match)
            const universityInput = document.getElementById('eventsUniversityInput');
            if (universityInput) {
                const universityFilterValue = universityInput.value.trim().toLowerCase();
                if (universityFilterValue !== '') {
                    eventsToShow = eventsToShow.filter(
                        event => event.university.toLowerCase().includes(universityFilterValue)
                    );
                }
            }
            
            // Apply course filter from text input (case-insensitive substring match)
            const courseInput = document.getElementById('eventsCourseInput');
            if (courseInput) {
                const courseFilterValue = courseInput.value.trim().toLowerCase();
                if (courseFilterValue !== '') {
                    eventsToShow = eventsToShow.filter(
                        event => event.course.toLowerCase().includes(courseFilterValue)
                    );
                }
            }
            
            if (eventsToShow.length === 0) {
                eventsContainer.innerHTML = `
                    <div style="width: 100%; min-height: 150px; display: flex; align-items: center; justify-content: center; padding: 18px 16px;">
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 auto; max-width: 520px; text-align: center;">
                            <div style="width: 82px; height: 82px; border-radius: 50%; background: #c7ccd0; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: #ffffff; line-height: 1; margin-bottom: 12px;">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                            <h3 style="margin: 0 0 8px; color: #1f1f1f; font-weight: 400; font-size: clamp(1.6rem, 2.3vw, 2.2rem); line-height: 1.2; text-align: center;">No Events Available</h3>
                            <p style="margin: 0; font-size: clamp(1rem, 1.3vw, 1.3rem); color: #5f6a74; font-style: italic; text-align: center;">Be the first to share an exciting campus event!</p>
                        </div>
                    </div>
                `;
                return;
            }
            
            // Reset pagination if filters changed
            const currentUniversityFilter = universityInput ? universityInput.value.trim().toLowerCase() : '';
            const currentCourseFilter = courseInput ? courseInput.value.trim().toLowerCase() : '';
            
            if (paginationState.lastEventsUniversityFilter !== currentUniversityFilter || 
                paginationState.lastEventsCourseFilter !== currentCourseFilter) {
                paginationState.eventsLoaded = 9;
                paginationState.lastEventsUniversityFilter = currentUniversityFilter;
                paginationState.lastEventsCourseFilter = currentCourseFilter;
            }
            
            // Slice events for pagination
            const eventsToDisplay = eventsToShow.slice(0, paginationState.eventsLoaded);
            
            eventsToDisplay.forEach(event => {
                const eventDate = new Date(event.date);
                const day = eventDate.getDate();
                const month = eventDate.toLocaleString('default', { month: 'short' });
                
                const eventElement = document.createElement('div');
                eventElement.className = 'event-card';
                
                eventElement.innerHTML = `
                    <div class="event-card-background" ${event.imageUrl ? `style="background-image: url('${event.imageUrl}'); background-size: cover; background-position: center;"` : ''}>
                        <div class="event-card-overlay"></div>
                        <div class="event-card-content">
                            <div class="event-date-badge">
                                <div class="event-day">${day}</div>
                                <div class="event-month">${month}</div>
                            </div>
                            <div class="event-info-overlay">
                                <h3 class="event-title">${event.title}</h3>
                                <p class="event-details">${event.description}</p>
                                <div class="event-footer">
                                    <div class="event-org profile-link" data-author="${event.organization}">${event.organization}</div>
                                    <div>
                                        <span class="event-location">${event.location}</span>
                                        ${event.university ? `<span class="event-university">${event.university}</span>` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                eventsContainer.appendChild(eventElement);
            });
            
            // Add Load More button if there are more events
            if (eventsToShow.length > paginationState.eventsLoaded) {
                const loadMoreBtn = document.createElement('button');
                loadMoreBtn.className = 'load-more-btn';
                loadMoreBtn.textContent = 'Load More Events';
                loadMoreBtn.addEventListener('click', () => {
                    paginationState.eventsLoaded += 9;
                    renderEvents();
                });
                eventsContainer.appendChild(loadMoreBtn);
            }
            
            // Add edit/delete buttons to user's events
            addEditDeleteButtonsToEvents();
        }

        // Render question photos with download options (NO likes/comments)

        function setupEventsFilters() {
            // Events tab has no university/course filters
        }

        // Setup Question Bank Filters

        function setupAddEventDialog() {
            const addEventBtn = document.getElementById('addEventBtn');
            const addEventDialog = document.getElementById('addEventDialog');
            const closeEventDialog = document.getElementById('closeEventDialog');
            const cancelEvent = document.getElementById('cancelEvent');
            const submitEvent = document.getElementById('submitEvent');
            const addEventForm = document.getElementById('addEventForm');
            const eventPhoto = document.getElementById('eventPhoto');
            const eventPhotoPreview = document.getElementById('eventPhotoPreview');

            // Guard clause: return if elements don't exist
            if (!addEventBtn || !addEventDialog || !closeEventDialog || !cancelEvent || !submitEvent || !addEventForm) {
                return;
            }

            // Handle event photo preview
            if (eventPhoto) {
                eventPhoto.addEventListener('change', function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            if (eventPhotoPreview) {
                                eventPhotoPreview.innerHTML = `<img src="${event.target.result}" style="max-width: 200px; max-height: 150px; border-radius: 4px;">`;
                            }
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }

            addEventBtn.addEventListener('click', () => {
                showDialog('addEventDialog');
            });

            closeEventDialog.addEventListener('click', () => {
                hideDialog('addEventDialog');
            });

            cancelEvent.addEventListener('click', () => {
                hideDialog('addEventDialog');
            });

            submitEvent.addEventListener('click', () => {
                const title = document.getElementById('eventTitle').value;
                const date = document.getElementById('eventDate').value;
                const time = document.getElementById('eventTime').value;
                const location = document.getElementById('eventLocation').value;
                const organization = document.getElementById('eventOrganization').value;
                const description = document.getElementById('eventDescription').value;
                const photoFile = eventPhoto ? eventPhoto.files[0] : null;

                if (!title || !date || !time || !location || !organization || !description) {
                    showToast('Please fill in all required fields', 'error');
                    return;
                }

                // Convert photo to base64 if provided
                let photoURL = '';
                if (photoFile) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        photoURL = event.target.result;
                        createEvent(title, date, time, location, organization, description, photoURL);
                    };
                    reader.readAsDataURL(photoFile);
                } else {
                    createEvent(title, date, time, location, organization, description, photoURL);
                }

                function createEvent(title, date, time, location, organization, description, photoURL) {
                    // Create new event
                    const newEvent = {
                        id: Date.now(),
                        title: title,
                        date: date,
                        time: time,
                        location: location,
                        organization: organization,
                        course: '',
                        university: '',
                        description: description,
                        imageUrl: photoURL
                    };

                    // Add to events array
                    appState.events.unshift(newEvent);
                    saveEventsToStorage();

                    // Update UI
                    renderEvents();
                    hideDialog('addEventDialog');
                    addEventForm.reset();
                    if (eventPhotoPreview) {
                        eventPhotoPreview.innerHTML = '';
                    }
                    showToast('Event added successfully!');
                }
            });
        }

        // Upload Question Dialog
