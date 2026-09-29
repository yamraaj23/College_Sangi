// ============================================
// College Sangi - Forum Page Controller
// ============================================

        function addEditDeleteButtonsToPosts() {
            // Remove any existing edit/delete buttons first
            document.querySelectorAll('.post-actions-owner').forEach(btn => btn.remove());
            
            // Add edit/delete buttons to user's posts
            appState.forumPosts.forEach(post => {
                const currentUserName = appState.currentUser ? 
                    `${appState.currentUser.firstName} ${appState.currentUser.lastName}` : '';
                
                if (post.author === currentUserName) {
                    const postElement = document.querySelector(`.post-card .post-footer .view-comments-btn[data-id="${post.id}"]`);
                    if (postElement) {
                        const postFooter = postElement.closest('.post-footer');
                        
                        // Create owner actions container
                        const ownerActions = document.createElement('div');
                        ownerActions.className = 'post-actions-owner';
                        ownerActions.innerHTML = `
                            <button class="edit-btn" data-id="${post.id}" data-type="post" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-btn" data-id="${post.id}" data-type="post" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        `;
                        
                        // Insert before the view-comments button
                        postFooter.insertBefore(ownerActions, postElement);
                    }
                }
            });
            
            // Add event listeners for edit/delete buttons
            document.querySelectorAll('.edit-btn[data-type="post"]').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const postId = parseInt(this.getAttribute('data-id'));
                    editPost(postId);
                });
            });
            
            document.querySelectorAll('.delete-btn[data-type="post"]').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const postId = parseInt(this.getAttribute('data-id'));
                    deletePost(postId);
                });
            });
        }

        // Edit post function
        function editPost(postId) {
            const post = appState.forumPosts.find(p => p.id === postId);
            if (!post) return;
            
            // Create edit post dialog
            const modal = document.createElement('div');
            modal.className = 'dialog-overlay active';
            modal.id = 'editPostDialog';
            
            modal.innerHTML = `
                <div class="dialog-box">
                    <div class="dialog-header">
                        <h3 class="dialog-title">Edit Post</h3>
                        <button class="dialog-close" id="closeEditPostDialog">&times;</button>
                    </div>
                    <div class="dialog-body">
                        <form id="editPostForm">
                            <div class="form-group">
                                <label for="editPostTitle">Post Title</label>
                                <input type="text" id="editPostTitle" class="form-control" value="${post.title}" required>
                            </div>
                            <div class="form-group">
                                <label for="editPostCourse">Course</label>
                                <select id="editPostCourse" class="form-control" required>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="editPostUniversity">University</label>
                                <select id="editPostUniversity" class="form-control" required>
                                    <option value="Tribhuvan University" ${post.university === 'Tribhuvan University' ? 'selected' : ''}>Tribhuvan University</option>
                                    <option value="Kathmandu University" ${post.university === 'Kathmandu University' ? 'selected' : ''}>Kathmandu University</option>
                                    <option value="Purbanchal University" ${post.university === 'Purbanchal University' ? 'selected' : ''}>Purbanchal University</option>
                                    <option value="Pokhara University" ${post.university === 'Pokhara University' ? 'selected' : ''}>Pokhara University</option>
                                    <option value="Lumbini Buddhist University" ${post.university === 'Lumbini Buddhist University' ? 'selected' : ''}>Lumbini Buddhist University</option>
                                    <option value="Agriculture and Forestry University" ${post.university === 'Agriculture and Forestry University' ? 'selected' : ''}>Agriculture and Forestry University</option>
                                    <option value="Nepal Sanskrit University" ${post.university === 'Nepal Sanskrit University' ? 'selected' : ''}>Nepal Sanskrit University</option>
                                    <option value="Far-Western University" ${post.university === 'Far-Western University' ? 'selected' : ''}>Far-Western University</option>
                                    <option value="Mid Western University" ${post.university === 'Mid Western University' ? 'selected' : ''}>Mid Western University</option>
                                    <option value="Nepal Open University" ${post.university === 'Nepal Open University' ? 'selected' : ''}>Nepal Open University</option>
                                    <option value="Rajarshi Janak University" ${post.university === 'Rajarshi Janak University' ? 'selected' : ''}>Rajarshi Janak University</option>
                                    <option value="Madan Bhandari University" ${post.university === 'Madan Bhandari University' ? 'selected' : ''}>Madan Bhandari University</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="editPostContent">Post Content</label>
                                <textarea id="editPostContent" class="form-control" required>${post.content}</textarea>
                            </div>
                        </form>
                    </div>
                    <div class="dialog-footer">
                        <button class="btn btn-outline" id="cancelEditPost">Cancel</button>
                        <button class="btn btn-primary" id="submitEditPost" data-id="${postId}">Update Post</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Populate course select based on university
            const editPostUniversitySelect = modal.querySelector('#editPostUniversity');
            const editPostCourseSelect = modal.querySelector('#editPostCourse');
            
            function populateEditPostCourses() {
                const selectedUniversity = editPostUniversitySelect.value;
                const courses = getCoursesForUniversity(selectedUniversity);
                editPostCourseSelect.innerHTML = '';
                courses.forEach(course => {
                    const option = document.createElement('option');
                    option.value = course;
                    option.textContent = course;
                    if (course === post.course) {
                        option.selected = true;
                    }
                    editPostCourseSelect.appendChild(option);
                });
            }
            
            // Initial population
            populateEditPostCourses();
            
            // Update courses when university changes
            editPostUniversitySelect.addEventListener('change', populateEditPostCourses);
            
            // Add event listeners
            modal.querySelector('#closeEditPostDialog').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            modal.querySelector('#cancelEditPost').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            modal.querySelector('#submitEditPost').addEventListener('click', () => {
                const title = document.getElementById('editPostTitle').value;
                const course = document.getElementById('editPostCourse').value;
                const university = document.getElementById('editPostUniversity').value;
                const content = document.getElementById('editPostContent').value;
                
                if (!title || !course || !university || !content) {
                    showToast('Please fill in all fields', 'error');
                    return;
                }
                
                // Update the post
                post.title = title;
                post.course = course;
                post.university = university;
                post.content = content;
                post.excerpt = content.length > 100 ? content.substring(0, 100) + '...' : content;
                post.editDate = new Date().toISOString().split('T')[0];
                post.edited = true;
                
                savePostsToStorage();
                renderForumPosts();
                addEditDeleteButtonsToPosts();
                
                document.body.removeChild(modal);
                showToast('Post updated successfully!');
            });
        }

        // Delete post function
        function deletePost(postId) {
            // Show custom confirmation dialog
            const deleteConfirmDialog = document.getElementById('deletePostConfirmDialog');
            const deletePostCancelBtn = document.getElementById('deletePostCancelBtn');
            const deletePostConfirmBtn = document.getElementById('deletePostConfirmBtn');

            if (deleteConfirmDialog && deletePostCancelBtn && deletePostConfirmBtn) {
                // Show dialog
                deleteConfirmDialog.classList.add('active');

                // Cancel button
                deletePostCancelBtn.onclick = () => {
                    deleteConfirmDialog.classList.remove('active');
                };

                // Confirm delete button
                deletePostConfirmBtn.onclick = () => {
                    deleteConfirmDialog.classList.remove('active');
                    
                    const postIndex = appState.forumPosts.findIndex(p => p.id === postId);
                    if (postIndex !== -1) {
                        // Remove the post
                        appState.forumPosts.splice(postIndex, 1);
                        savePostsToStorage();
                        
                        // Also remove associated comments
                        if (appState.comments[postId]) {
                            delete appState.comments[postId];
                            saveCommentsToStorage();
                        }
                        
                        renderForumPosts();
                        addEditDeleteButtonsToPosts();
                        showToast('Post deleted successfully!');
                    }
                };

                // Close dialog when clicking outside
                deleteConfirmDialog.addEventListener('click', (e) => {
                    if (e.target === deleteConfirmDialog) {
                        deleteConfirmDialog.classList.remove('active');
                    }
                });
            } else {
                console.warn('Delete post dialog elements not found');
            }
        }

        // NEW: Edit and Delete Functionality for Marketplace Products

        function renderForumPosts() {
            console.log('🔍 renderForumPosts called');
            const forumPostsContainer = document.getElementById('forumPosts');
            if (!forumPostsContainer) {
                console.warn('❌ Forum posts container not found');
                return;
            }
            console.log('✅ Forum posts container found');
            forumPostsContainer.innerHTML = '';
            
            let postsToShow = appState.forumPosts;
            console.log('📊 Total posts to show:', postsToShow.length);
            
            // Get current filter values
            const universityInput = document.getElementById('forumUniversityInput');
            const courseInput = document.getElementById('forumCourseInput');
            const currentUniversityFilter = universityInput ? universityInput.value.trim().toLowerCase() : '';
            const currentCourseFilter = courseInput ? courseInput.value.trim().toLowerCase() : '';
            
            // Check if filters have changed
            const filtersChanged = 
                appState.currentForumFilter !== paginationState.lastForumFilter ||
                currentUniversityFilter !== paginationState.lastForumUniversityFilter ||
                currentCourseFilter !== paginationState.lastForumCourseFilter;
            
            // Reset pagination only if filters changed
            if (filtersChanged) {
                paginationState.forumPostsLoaded = 15;
                paginationState.lastForumFilter = appState.currentForumFilter;
                paginationState.lastForumUniversityFilter = currentUniversityFilter;
                paginationState.lastForumCourseFilter = currentCourseFilter;
            }
            
            // Apply course filter from buttons if not "all"
            if (appState.currentForumFilter !== 'all') {
                postsToShow = postsToShow.filter(
                    post => post.course === appState.currentForumFilter
                );
            }
            
            // Apply university filter from text input
            if (currentUniversityFilter !== '') {
                postsToShow = postsToShow.filter(
                    post => post.university.toLowerCase().includes(currentUniversityFilter)
                );
            }
            
            // Apply course filter from text input
            if (currentCourseFilter !== '') {
                postsToShow = postsToShow.filter(
                    post => post.course.toLowerCase().includes(currentCourseFilter)
                );
            }
            
            if (postsToShow.length === 0) {
                forumPostsContainer.innerHTML = `
                    <div style="width: 100%; min-height: 150px; display: flex; align-items: center; justify-content: center; padding: 18px 16px;">
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 auto; max-width: 520px; text-align: center;">
                            <div style="width: 82px; height: 82px; border-radius: 50%; background: #c7ccd0; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: #ffffff; line-height: 1; margin-bottom: 12px;">
                                <i class="fas fa-comments"></i>
                            </div>
                            <h3 style="margin: 0 0 8px; color: #1f1f1f; font-weight: 400; font-size: clamp(1.6rem, 2.3vw, 2.2rem); line-height: 1.2; text-align: center;">No Forum Posts Available</h3>
                            <p style="margin: 0; font-size: clamp(1rem, 1.3vw, 1.3rem); color: #5f6a74; font-style: italic; text-align: center;">Be the first to start a discussion on your campus!</p>
                        </div>
                    </div>
                `;
                return;
            }
            
            // Store filtered posts for pagination
            appState.filteredForumPosts = postsToShow;
            
            // Display only the first N posts based on pagination state
            const postsToDisplay = postsToShow.slice(0, paginationState.forumPostsLoaded);
            
            postsToDisplay.forEach(post => {
                const postElement = document.createElement('div');
                postElement.className = 'post-card';
                
                const dateClass = post.edited ? 'post-date edited' : 'post-date';
                const editedText = post.edited ? ` (edited on ${formatDate(post.editDate)})` : '';
                
                postElement.innerHTML = `
                    <div class="post-header">
                        <div class="post-meta">
                            <span class="post-author profile-link" data-author="${post.author}">${post.author}</span>
                            <span>•</span>
                            <span class="${dateClass}">${formatDate(post.date)}${editedText}</span>
                        </div>
                        <div>
                            <span class="post-tag">${post.course}</span>
                            <span class="post-tag" style="margin-left: 5px; background-color: #e8f4f8; color: #3498db;">${post.university}</span>
                        </div>
                    </div>
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <div class="post-footer">
                        <div class="post-actions">
                            <div class="post-action ${post.liked ? 'liked' : ''}" data-id="${post.id}">
                                <i class="fas fa-heart"></i>
                                <span class="like-count">${post.likes}</span>
                            </div>
                            <div class="post-action">
                                <i class="fas fa-comment"></i>
                                <span>${post.comments}</span>
                            </div>
                        </div>
                        <button class="view-comments-btn" data-id="${post.id}">View Post & Comments</button>
                    </div>
                `;
                
                forumPostsContainer.appendChild(postElement);
            });
            
            // Add load more button if there are more posts
            if (postsToShow.length > paginationState.forumPostsLoaded) {
                const loadMoreDiv = document.createElement('div');
                loadMoreDiv.style.textAlign = 'center';
                loadMoreDiv.style.padding = '12px';
                loadMoreDiv.innerHTML = `<button class="load-more-btn" id="loadMoreForumPosts">Load More Posts</button>`;
                forumPostsContainer.appendChild(loadMoreDiv);
                
                document.getElementById('loadMoreForumPosts').addEventListener('click', function() {
                    paginationState.forumPostsLoaded += 15;
                    renderForumPosts();
                });
            }
            
            // Add event listeners for like buttons
            document.querySelectorAll('.post-action[data-id]').forEach(btn => {
                btn.addEventListener('click', function() {
                    const postId = parseInt(this.getAttribute('data-id'));
                    togglePostLike(postId);
                });
            });
            
            // Add event listeners for view comments buttons
            document.querySelectorAll('.view-comments-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const postId = parseInt(this.getAttribute('data-id'));
                    viewPostComments(postId);
                });
            });
            
            // Add edit/delete buttons to user's posts
            addEditDeleteButtonsToPosts();
        }

        // Toggle post like with notification (FIXED VERSION)
        function togglePostLike(postId) {
            const post = appState.forumPosts.find(p => p.id === postId);
            if (!post) return;
            
            const currentUserName = appState.currentUser ? 
                `${appState.currentUser.firstName} ${appState.currentUser.lastName}` : 'Anonymous';
            
            // Check if current user is the post author
            if (post.author === currentUserName) {
                // User is liking their own post - just toggle like without notification
                if (post.liked) {
                    post.likes--;
                    post.liked = false;
                    appState.likedPosts = appState.likedPosts.filter(id => id !== postId);
                } else {
                    post.likes++;
                    post.liked = true;
                    appState.likedPosts.push(postId);
                }
                
                savePostsToStorage();
                saveLikedPostsToStorage();
                renderForumPosts();
                updatePostLikeInModal(postId);
                return;
            }
            
            // User is liking someone else's post
            if (post.liked) {
                post.likes--;
                post.liked = false;
                appState.likedPosts = appState.likedPosts.filter(id => id !== postId);
            } else {
                post.likes++;
                post.liked = true;
                appState.likedPosts.push(postId);
                
                // Create notification for post owner (if not liking own post)
                createNotification('like', postId, 'post', post.title, currentUserName);
            }
            
            savePostsToStorage();
            saveLikedPostsToStorage();
            renderForumPosts();
            
            // Also update if post is open in modal
            updatePostLikeInModal(postId);
        }

        // View post comments
        function viewPostComments(postId) {
            const post = appState.forumPosts.find(p => p.id === postId);
            if (!post) return;
            
            const dateClass = post.edited ? 'post-date edited' : 'post-date';
            const editedText = post.edited ? ` (edited on ${formatDate(post.editDate)})` : '';
            
            // Create modal for post view
            const modal = document.createElement('div');
            modal.className = 'post-modal';
            modal.style.display = 'flex';
            
            modal.innerHTML = `
                <div class="post-modal-content">
                    <div class="post-modal-header">
                        <h3>${post.title}</h3>
                        <button class="close-post-modal">&times;</button>
                    </div>
                    <div class="post-modal-body">
                        <div class="post-header">
                            <div class="post-meta">
                                <span class="post-author profile-link" data-author="${post.author}">${post.author}</span>
                                <span>•</span>
                                <span class="${dateClass}">${formatDate(post.date)}${editedText}</span>
                            </div>
                            <div>
                                <span class="post-tag">${post.course}</span>
                                <span class="post-tag" style="margin-left: 5px; background-color: #e8f4f8; color: #3498db;">${post.university}</span>
                            </div>
                        </div>
                        <div class="post-content">
                            <p>${post.content}</p>
                        </div>
                        
                        <div class="post-footer">
                            <div class="post-actions">
                                <div class="post-action ${post.liked ? 'liked' : ''}" data-id="${post.id}">
                                    <i class="fas fa-heart"></i>
                                    <span class="like-count">${post.likes}</span>
                                </div>
                                <div class="post-action">
                                    <i class="fas fa-comment"></i>
                                    <span>${post.comments}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="comments-section">
                            <h4 class="comments-title">Comments (${post.comments})</h4>
                            <div class="comments-list" id="commentsList-${post.id}">
                                <!-- Comments will be loaded here -->
                            </div>
                            <div class="comment-form">
                                <textarea class="comment-input" placeholder="Add a comment..." id="commentInput-${post.id}"></textarea>
                                <button class="comment-submit" data-post-id="${post.id}">Post Comment</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Load comments
            loadComments(postId);
            
            // Add event listeners
            modal.querySelector('.close-post-modal').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            modal.querySelector('.comment-submit').addEventListener('click', function() {
                const commentText = document.getElementById(`commentInput-${postId}`).value;
                if (commentText.trim()) {
                    addComment(postId, commentText);
                    document.getElementById(`commentInput-${postId}`).value = '';
                }
            });
            
            modal.querySelector('.post-action[data-id]').addEventListener('click', function() {
                togglePostLike(postId);
                // Update the like count in the modal
                const likeCount = modal.querySelector('.like-count');
                likeCount.textContent = post.likes;
                this.classList.toggle('liked', post.liked);
            });
        }

        // Load comments for a post
        function loadComments(postId) {
            const commentsList = document.getElementById(`commentsList-${postId}`);
            if (!commentsList) return;
            
            const comments = appState.comments[postId] || [];
            commentsList.innerHTML = '';
            
            if (comments.length === 0) {
                commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
                return;
            }
            
            comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.className = 'comment-item';
                
                const dateClass = comment.edited ? 'comment-date edited' : 'comment-date';
                const editedText = comment.edited ? ` (edited on ${formatDate(comment.editDate)})` : '';
                
                commentElement.innerHTML = `
                    <div class="comment-header">
                        <span class="comment-author profile-link" data-author="${comment.author}">${comment.author}</span>
                        <span class="${dateClass}">${formatDate(comment.date)}${editedText}</span>
                    </div>
                    <div class="comment-content">${comment.content}</div>
                `;
                
                commentsList.appendChild(commentElement);
            });
        }

        // Add comment to a post with notification (FIXED VERSION)
        function addComment(postId, content) {
            if (!appState.currentUser) return;
            
            const currentUserName = `${appState.currentUser.firstName} ${appState.currentUser.lastName}`;
            const comment = {
                id: Date.now(),
                postId: postId,
                author: currentUserName,
                content: content,
                date: new Date().toISOString().split('T')[0]
            };
            
            // Initialize comments array for this post if it doesn't exist
            if (!appState.comments[postId]) {
                appState.comments[postId] = [];
            }
            
            appState.comments[postId].push(comment);
            
            // Update post comment count
            const post = appState.forumPosts.find(p => p.id === postId);
            if (post) {
                post.comments = appState.comments[postId].length;
                
                // Create notification for post owner (if not commenting on own post)
                if (post.author !== currentUserName) {
                    createNotification('comment', postId, 'post', content, currentUserName);
                }
            }
            
            saveCommentsToStorage();
            savePostsToStorage();
            
            // Reload comments
            loadComments(postId);
            
            // Update comment count in the forum view
            updateCommentCount(postId, post.comments);
            
            showToast('Comment added successfully!');
        }

        // Format price in NPR with comma separators

        function setupForumFilters() {
            // Setup dropdowns
            setupFilterDropdown('forumUniversityInput', 'forumUniversityDropdown', allUniversities);
            setupFilterDropdown('forumCourseInput', 'forumCourseDropdown', allCourses);

            // Add event listener for university change to update courses
            const forumUniversityInput = document.getElementById('forumUniversityInput');
            if (forumUniversityInput) {
                forumUniversityInput.addEventListener('change', () => {
                    updateCoursesForUniversity('forumUniversityInput', 'forumCourseInput', 'forumCourseDropdown');
                    renderForumPosts();
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
            const forumUniversityInput2 = document.getElementById('forumUniversityInput');
            if (forumUniversityInput2) {
                forumUniversityInput2.addEventListener('input', createDebouncedRender(renderForumPosts));
            }
            
            // Course input filter
            const forumCourseInput = document.getElementById('forumCourseInput');
            if (forumCourseInput) {
                forumCourseInput.addEventListener('input', createDebouncedRender(renderForumPosts));
            }
        }

        // Setup Marketplace Filters

        function setupAddPostDialog() {
            const newPostBtn = document.getElementById('newPostBtn');
            const addPostDialog = document.getElementById('addPostDialog');
            const closePostDialog = document.getElementById('closePostDialog');
            const cancelPost = document.getElementById('cancelPost');
            const submitPost = document.getElementById('submitPost');
            const addPostForm = document.getElementById('addPostForm');

            // Guard clause: return if elements don't exist
            if (!newPostBtn || !addPostDialog || !closePostDialog || !cancelPost || !submitPost || !addPostForm) {
                return;
            }

            // Initialize searchable dropdowns for post dialog
            try {
                setupFilterDropdown('postUniversity', 'postUniversityDropdown', allUniversities);
                setupFilterDropdown('postCourse', 'postCourseDropdown', allCourses);
                
                // Add university change listener to update courses
                const postUniversityInput = document.getElementById('postUniversity');
                if (postUniversityInput) {
                    postUniversityInput.addEventListener('change', () => {
                        updateCoursesForUniversity('postUniversity', 'postCourse', 'postCourseDropdown');
                    });
                }
            } catch (err) {
                console.warn('Dropdown setup failed, will retry later', err);
            }

            newPostBtn.addEventListener('click', () => {
                showDialog('addPostDialog');
            });

            closePostDialog.addEventListener('click', () => {
                hideDialog('addPostDialog');
            });

            cancelPost.addEventListener('click', () => {
                hideDialog('addPostDialog');
            });

            submitPost.addEventListener('click', () => {
                const title = document.getElementById('postTitle').value;
                const course = document.getElementById('postCourse').value;
                const university = document.getElementById('postUniversity').value;
                const content = document.getElementById('postContent').value;

                if (!title || !course || !university || !content) {
                    showToast('Please fill in all fields', 'error');
                    return;
                }

                // Create new post
                const newPost = {
                    id: Date.now(),
                    title: title,
                    excerpt: content.length > 100 ? content.substring(0, 100) + '...' : content,
                    content: content,
                    author: `${appState.currentUser.firstName} ${appState.currentUser.lastName}`,
                    course: course,
                    university: university,
                    date: new Date().toISOString().split('T')[0],
                    likes: 0,
                    comments: 0,
                    liked: false
                };

                // Add to posts array
                appState.forumPosts.unshift(newPost);
                savePostsToStorage();

                // Update UI
                renderForumPosts();
                hideDialog('addPostDialog');
                addPostForm.reset();
                showToast('Post published successfully!');
            });
        }

        // Add Textbook Dialog

        function updateCommentCount(postId, count) {
            const commentCountElement = document.querySelector(`.view-comments-btn[data-id="${postId}"]`);
            if (commentCountElement) {
                const countSpan = commentCountElement.previousElementSibling?.querySelector('span');
                if (countSpan) {
                    countSpan.textContent = count;
                }
            }
        }

        // Delete user profile function

        function updatePostLikeInModal(postId) {
            const modal = document.querySelector('.post-modal');
            if (modal) {
                const post = appState.forumPosts.find(p => p.id === postId);
                if (post) {
                    const likeAction = modal.querySelector('.post-action[data-id]');
                    if (likeAction) {
                        likeAction.querySelector('.like-count').textContent = post.likes;
                        likeAction.classList.toggle('liked', post.liked);
                    }
                }
            }
        }

        // Set up all event listeners
