// ============================================
// College Sangi - State Management Module
// ============================================


// ===== MOBILE OPTIMIZATION STATE =====
        // Track performance metrics and mobile-specific state
        let mobileOptimizationState = {
            isScrolling: false,
            scrollTimeout: null,
            lastScrollTop: 0,
            scrollDirection: 'down',
            touchStartY: 0,
            lastTouchTime: 0,
            longPressTimer: null,
            isIphone: /iPad|iPhone|iPod/.test(navigator.userAgent),
            isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            isTouchDevice: () => (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)),
            renderLocked: false,
            pendingUpdates: []
        };

        // Application state (server-backed)
        let appState = {
            currentUser: null,
            forumPosts: [],
            marketplaceProducts: [],
            events: [],
            comments: {},
            likedPosts: [],
            currentMarketplaceFilter: 'all',
            currentForumFilter: 'all',
            users: [],
            userActivity: [],
            currentPostId: null,
            currentProductId: null,
            viewingProfile: null,
            userAvatars: {},
            notifications: [],
            unreadNotifications: 0,
            notificationSoundEnabled: true,
            questionPhotos: [],
            conversations: [],
            materials: []
        };

        // Navigation history state
        let navigationState = {
            history: ['home'], // Start with home page
            currentIndex: 0,
            isNavigatingBack: false
        };

        // Pagination state
        let paginationState = {
            forumPostsLoaded: 15,
            lastForumFilter: 'all',
            lastForumUniversityFilter: '',
            lastForumCourseFilter: '',
            marketplaceProductsLoaded: 15,
            lastMarketplaceUniversityFilter: '',
            lastMarketplaceCourseFilter: '',
            eventsLoaded: 9,
            lastEventsUniversityFilter: '',
            lastEventsCourseFilter: '',
            questionsLoaded: 15,
            lastQuestionsUniversityFilter: '',
            lastQuestionsCourseFilter: '',
            lastQuestionsBSStartingFilter: '',
            lastQuestionsYearFilter: 'all',
            lastQuestionsSemesterFilter: 'all',
            materialsLoaded: 15
        };

        // Load all state from server
        async function loadAppStateFromServer() {
            try {
                const res = await fetch('/api/state');
                if (!res.ok) throw new Error('Failed to load server state');
                const s = await res.json();
                appState.forumPosts = s.forumPosts || [];
                appState.marketplaceProducts = s.marketplaceProducts || [];
                appState.events = s.events || [];
                appState.comments = s.comments || {};
                appState.likedPosts = s.likedPosts || [];
                appState.users = s.users || [];
                appState.userActivity = s.userActivity || [];
                appState.userAvatars = s.userAvatars || {};
                appState.notifications = s.notifications || [];
                appState.questionPhotos = s.questionPhotos || [];
                appState.conversations = s.conversations || [];
                appState.materials = s.materials || [];
                updateUnreadCounts();
                // re-render UI where necessary (many existing functions assume appState is ready)
            } catch (err) {
                console.error('Error loading state from server:', err);
            }
        }

        // Initialize with sample data if no data exists on server
        function initializeSampleData() {
            // Data will be loaded from server via `loadAppStateFromServer()`
        }



        // Save functions now sync with server (bulk replace)
        async function savePostsToStorage() {
            try {
                await fetch('/api/sync/forum', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(appState.forumPosts)});
            } catch (e) { console.error(e); }
        }

        async function saveProductsToStorage() {
            try {
                await fetch('/api/sync/products', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(appState.marketplaceProducts)});
            } catch (e) { console.error(e); }
        }

        async function saveEventsToStorage() {
            try {
                await fetch('/api/sync/events', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(appState.events)});
            } catch (e) { console.error(e); }
        }

        async function saveCommentsToStorage() {
            try {
                await fetch('/api/sync/comments', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(appState.comments)});
            } catch (e) { console.error(e); }
        }

        async function saveLikedPostsToStorage() {
            try {
                await fetch('/api/sync/likedPosts', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(appState.likedPosts)});
            } catch (e) { console.error(e); }
        }

        async function saveAvatarsToStorage() {
            try {
                await fetch('/api/sync/avatars', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(appState.userAvatars)});
            } catch (e) { console.error(e); }
        }

        async function saveNotificationsToStorage() {
            try {
                await fetch('/api/sync/notifications', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(appState.notifications)});
            } catch (e) { console.error(e); }
        }

        async function saveQuestionPhotosToStorage() {
            try {
                await fetch('/api/sync/questionPhotos', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(appState.questionPhotos)});
            } catch (e) { console.error(e); }
        }

        async function saveMaterialsToStorage() {
            try {
                await fetch('/api/sync/materials', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(appState.materials)});
            } catch (e) { console.error(e); }
        }

        // Load initial state from server - now moved to DOMContentLoaded to ensure proper timing
        // loadAppStateFromServer() will be called after HTML components are loaded


        function loadAppData() {
            // Render all components
            renderForumPosts();
            renderMarketplaceProducts();
            renderEvents();
            renderQuestionPhotos();
            if (typeof renderMaterials === 'function') {
                renderMaterials();
            }
            
            // Set up filter event listeners
            setupFilterListeners();
            setupMarketplaceFilters();
            setupQuestionBankFilters();
            setupForumFilters();
            setupEventsFilters();
            if (typeof setupMaterialsFilters === 'function') {
                setupMaterialsFilters();
            }
            
            // Set up profile tab listeners
            setupProfileTabListeners();
        }

        // List of all universities and courses
        const allUniversities = [
            'Tribhuvan University',
            'Kathmandu University',
            'Purbanchal University',
            'Pokhara University',
            'Lumbini Buddhist University',
            'Agriculture and Forestry University',
            'Nepal Sanskrit University',
            'Far-Western University',
            'Mid Western University',
            'Nepal Open University',
            'Rajarshi Janak University',
            'Madan Bhandari University',
            'Gandaki University'
        ];

        const allCourses = [];

        // University-specific course mapping
        const universityCourses = {
            'Rajarshi Janak University': ['BE Civil', 'BALLB', 'BBA', 'BCA', 'BDBM', 'BIT', 'BJMC', 'BPH', 'BSc Agriculture', 'BSc MLT', 'BSc CSIT', 'MBA', 'MPhil EP', 'MCA'],
            'Nepal Open University': ['BA', 'BBA', 'BBS', 'BALLB', 'DLIM', 'Master in e-Governance', 'MES', 'Master in Geoinformatics', 'MBA', 'MPhil in Economics', 'MPhil Educational Studies', 'MPhil English', 'MPhil Health Education', 'MPhil ICT', 'MPhil Mathematics', 'MPhil Nepali', 'MPhil Political Science', 'MPhil in Social Science', 'MPhil Sociology', 'MSDMG', 'MSc EOH', 'B. Ed Pedagogical Sciences', 'PhD Education'],
            'Madan Bhandari University': ['MASc. AI', 'MASc. DS', 'MASc. FB', 'MASc. OA', 'PhD FB', 'PhD OA'],
            'Gandaki University': ['BSM', 'BA LLB', 'BBA', 'BIT', 'BPharm'],
            'Agriculture and Forestry University': ['BSc Agriculture', 'MSc Agriculture'],
            'Far-Western University': ['BA', 'BBA', 'BBS', 'BEd', 'BE Civil'],
            'Mid Western University': ['BA', 'BBA', 'BBS', 'BTTM', 'BEd', 'MBA', 'MBS', 'MA'],
            'Lumbini Buddhist University': ['BA Bhot studies', 'MA Mahayana Buddhism', 'MA Buddhism and Himalayan Studies', 'MA Buddhism and Peace Studies', 'MA Theravada Buddhism', 'MSc CEM'],
            'Nepal Sanskrit University': ['BAMS'],
            'Purbanchal University': [
                'BALLB',
                'BE Electronics and Communication',
                'BScIT Liberal Arts Science',
                'BMT',
                'BArch',
                'BA',
                'BBA',
                'BBS',
                'BCS',
                'BCA',
                'BTech',
                'BEd',
                'BE Electrical',
                'BE Biomedical',
                'BE Civil',
                'BE Computer',
                'BE Geomatics',
                'BFD',
                'BHMS',
                'BHCM',
                'BHM',
                'BIT',
                'BID',
                'BJMC',
                'BPharm',
                'BPH',
                'BSW',
                'BTTM',
                'BScAg',
                'BSc Biochemistry',
                'BSc Nursing',
                'EMBA',
                'MAMCJ',
                'MMT',
                'MCIH',
                'BSc ABM',
                'Master Civil Engineering',
                'MA RDPM',
                'MSW',
                'MA Sociology / Anthropology',
                'MA English',
                'MCA',
                'ME',
                'MHHM',
                'MTech IT',
                'MPA',
                'MPH',
                'MSc EM',
                'MSc UD',
                'MTTM',
                'MA HR',
                'MA DC',
                'MA DS',
                'MBA',
                'MEd',
                'MSc Dairy Technology',
                'MSc PRD',
                'MSc ISE',
                'MSc IT LS',
                'MSc MT',
                'PBN',
                'PGDCA',
                'PGD',
                'TSLC MLT'
            ],
            'Pokhara University': [
                'B.Arch',
                'BA LLB',
                'BBA',
                'BBA Finance',
                'BBA-BI',
                'BBA-TT',
                'BE Civil',
                'BCA',
                'BE Computer',
                'BCIS',
                'BCSIT',
                'BDEVS',
                'BE Electrical Electronic',
                'BE Electronics and Communication',
                'BIT',
                'BA English and Communication Studies',
                'BHCM',
                'BHM',
                'BPharm',
                'BPH',
                'BSc Biochemistry',
                'BSc Environmental Management',
                'BSc Medical Biochemistry',
                'BSc MLT',
                'BSc Nursing',
                'MA English',
                'MPGD',
                'MBA',
                'MCE',
                'MCIS',
                'MSc Computer',
                'MHCM',
                'MSc Pharmacy Clinical',
                'MSc Pharmacy Natural Product',
                'EMBA',
                'MBA Finance',
                'MBA Global Business',
                'MPhil English',
                'MSc Construction Management',
                'MSc Environmental Management',
                'MSc Interdisciplinary Water Resource Management',
                'MSc Natural Resources Management',
                'MSc Transportation Engineering and Management',
                'PGD HCM'
            ]
        };

        // Separate closing brace for universityCourses - ensuring proper formatting
        // Adding Kathmandu University courses
        universityCourses['Kathmandu University'] = [
            'MBE',
            'BA Buddhist Studies',
            'BE Chemical',
            'BE Civil',
            'BDF',
            'BDEVS',
            'BE Geomatics',
            'Bsc Psychology',
            'BArch',
            'Bsc Aviation Management',
            'BBA',
            'BBIS',
            'BALLB',
            'Bsc. Data Science',
            'BDS',
            'BE Electrical Electronic',
            'BFA',
            'BTTM',
            'BHM',
            'BMS',
            'MBBS',
            'BNS',
            'BPharm',
            'BPT',
            'B. Professional Hospitality',
            'BSc Nursing',
            'BSS',
            'B. Tech in Cybersecurity',
            'BTec Biotechnology',
            'BTech Environmental Engineering',
            'BBA Emphasis',
            'BE Computer',
            'BE Mechanical',
            'BSc Applied Physics',
            'BSc Environmental Science',
            'BSc Human Biology',
            'BFA MUSIC',
            'EMBA',
            'MBA',
            'MA Buddhist Studies',
            'MA Development Studies',
            'MA Music',
            'MSc Pharmacy',
            'Master in Structural Engineering',
            'MEd Sustainable Development',
            'MEd Leadership and Management',
            'ME Communication Engineering',
            'ME Computer Engineering',
            'ME Electrical Power Engineering',
            'ME Geo-informatics',
            'ME Mechanical Engineering',
            'MPA Public Policy and Management',
            'M.Sc. in Environmental Science',
            'MTech Biotech',
            'MTech IT',
            'MPhil Development Studies',
            'MEd Math',
            'MPhil English Language Education',
            'MS Research',
            'MS Research Biotechnology',
            'MS Research Environmental Science',
            'MS Research Pharmaceutical Sciences',
            'MS Research Communication Engineering',
            'PGDED',
            'PGDEd STEAM',
            'PhD Education',
            'PhD in Biotechnology',
            'PhD Environmental Science',
            'PhD Mathematics',
            'PhD Mechanical Engineering',
            'PhD Pharmaceutcal Sciences',
            'PhD Physics',
            'PGSM'
        ];

        // Adding Tribhuvan University courses
        universityCourses['Tribhuvan University'] = [
            'BHM',
            'BA Economics',
            'BA PSYCHOLOGY',
            'BE Aerospace',
            'BE Chemical',
            'Bsc Data Science',
            'BFS',
            'BFS AUDIOGRAPHY',
            'BFS CINEMATOGRAPHY',
            'BFS Editing',
            'BE Geomatics',
            'Bachelor Perfusion Technology',
            'B. Arch',
            'BA',
            'BA LLB',
            'BSW',
            'BA Sociology',
            'BASLP',
            'BAMS',
            'BBA',
            'BBM',
            'BBS',
            'BE Civil',
            'BCA',
            'BE Computer',
            'BDS',
            'BEd',
            'BEd ICT',
            'B.E.E.',
            'BECIE',
            'BFA',
            'B. Sc.IE',
            'BIM',
            'BIT',
            'BITM',
            'BJMC',
            'BE Mechanical',
            'MBBS',
            'BMS',
            'Bsc. Nursing',
            'B .Optom',
            'BPharm',
            'BPA',
            'BPH',
            'BA RURAL DEVELOPMENT',
            'BSc Meteorology',
            'BTTM',
            'BVScAH',
            'BSc Agriculture',
            'Bsc Biology',
            'BSc Botany',
            'BSc Chemistry',
            'BSc. CSIT',
            'BSc Environmental Science',
            'BSc General',
            'BSc Geology',
            'BSc. HFM',
            'BSc. Forestry',
            'BSc MIT-RT',
            'BSc Maths',
            'BSc MIT',
            'BMLT',
            'BSc Microbiology',
            'BSc Midwifery',
            'BSc Physics',
            'BSc Statistics',
            'BSc TTM',
            'BSc Zoology',
            'BTech Food Technology',
            'MA Nepali',
            'MA',
            'MA Economics',
            'MA CPDS',
            'MA in Gender Studies',
            'MAJMC',
            'MA Population Studies',
            'MA Political Science',
            'MA Psychology',
            'MA Rural Development',
            'MACMS',
            'Msc. Data Science',
            'MPH',
            'MTTM',
            'MA Art Anthropology',
            'MA English',
            'MA Sociology',
            'MBA Finance',
            'MBA IT',
            'MBM',
            'MBS',
            'MDS',
            'MFA',
            'MHM',
            'MALLM',
            'MN',
            'MPA',
            'MSc Mountaineering',
            'MSW',
            'MSc CSIT',
            'MBA Global Leadership and Management',
            'MBA',
            'MD General Practice',
            'MEd',
            'MEd Curriculum and Evaluation',
            'MEd Economics Education',
            'MEd Education Planning and Management',
            'MEd English Language Education',
            'MEd Health Education',
            'MEd in Mathematics',
            'MEd in Political Science Education',
            'MEd in Science Education',
            'MEd Nepali Language Education',
            'MPhil',
            'MPhil PA',
            'MSC Biotechnology',
            'MSc Botany',
            'MSc Chemistry',
            'MSc Clinical Microbiology',
            'MSC Engineering Geology',
            'MSc Geology',
            'MSc Hydrology and Meteorology',
            'MSc Community Forestry',
            'MSc Environmental Science',
            'MSC Maths',
            'MSc Microbiology',
            'MSc Physics',
            'MSc Zoology',
            'PhD in Environmental Science',
            'PBN',
            'PGDCP',
            'PGD PS'
        ];

        const allAcademicYears = ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033'];

        // Function to populate and show filter dropdown
        function setupFilterDropdown(inputId, dropdownId, items) {
            const input = document.getElementById(inputId);
            const dropdown = document.getElementById(dropdownId);
            
            if (!input || !dropdown) return;

            // Show all items on focus
            input.addEventListener('focus', () => {
                renderDropdownItems(dropdown, items, '');
                dropdown.classList.add('active');
            });

            // Filter items on input
            input.addEventListener('input', (e) => {
                const filterValue = e.target.value.toLowerCase();
                if (filterValue === '') {
                    renderDropdownItems(dropdown, items, '');
                } else {
                    const filtered = items.filter(item => 
                        item.toLowerCase().includes(filterValue)
                    );
                    renderDropdownItems(dropdown, filtered, filterValue);
                }
                dropdown.classList.add('active');
            });

            // Hide dropdown on blur (with delay to allow click)
            input.addEventListener('blur', () => {
                setTimeout(() => {
                    dropdown.classList.remove('active');
                }, 200);
            });

            // Container-level selection handler (mousedown/touchstart) to avoid blur race
            const containerSelectHandler = (e) => {
                const itemEl = e.target.closest ? e.target.closest('.filter-dropdown-item') : null;
                if (!itemEl) return;
                e.preventDefault();
                e.stopPropagation();
                const val = itemEl.dataset && itemEl.dataset.value ? itemEl.dataset.value : itemEl.textContent.trim();
                input.value = val;
                try { input.setAttribute('value', val); } catch (err) {}
                try { input.defaultValue = val; } catch (err) {}
                input.dataset.selected = val;
                // If select element, try to set option
                if (input.tagName && input.tagName.toLowerCase() === 'select') {
                    const opt = Array.from(input.options).find(o => o.value === val || o.text === val);
                    if (opt) opt.selected = true;
                }
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                try { input.focus(); } catch (err) {}
                setTimeout(() => dropdown.classList.remove('active'), 100);
            };

            dropdown.addEventListener('mousedown', containerSelectHandler);
            dropdown.addEventListener('touchstart', containerSelectHandler);
        }

        // Function to render dropdown items
        function renderDropdownItems(dropdown, items, searchTerm) {
            dropdown.innerHTML = '';
            
            if (items.length === 0) {
                const noResult = document.createElement('div');
                noResult.className = 'filter-dropdown-item';
                noResult.textContent = 'No results found';
                noResult.style.color = 'var(--text-light)';
                noResult.style.cursor = 'default';
                dropdown.appendChild(noResult);
                return;
            }

            items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'filter-dropdown-item';

                // Determine the current input value for this dropdown (to show selected)
                const input = dropdown.parentElement ? dropdown.parentElement.querySelector('input') : null;
                const currentValue = input ? (input.value || '').toString().trim() : '';
                const currentValueLower = currentValue.toLowerCase();

                // Render text with highlighted search term if present
                if (searchTerm) {
                    const regex = new RegExp(`(${searchTerm})`, 'gi');
                    itemElement.innerHTML = item.replace(regex, '<strong style="color: var(--secondary);">$1</strong>');
                } else {
                    itemElement.textContent = item;
                }

                // Attach data-value so container handler can read original item
                itemElement.dataset.value = item;

                // If this item equals the current input value, mark it as selected
                if (currentValue && item.toLowerCase() === currentValueLower) {
                    itemElement.classList.add('highlighted');
                    const mark = document.createElement('span');
                    mark.className = 'selected-mark';
                    mark.textContent = '✔';
                    itemElement.appendChild(mark);
                }

                // Handle item selection (use mousedown/touchstart to avoid blur race)
                const handleSelection = (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    // Try to find the related input/select/textarea inside the wrapper
                    let targetInput = null;
                    if (dropdown && dropdown.parentElement) {
                        targetInput = dropdown.parentElement.querySelector('input, select, textarea');
                    }

                    // Fallback: try to guess an input id based on dropdown id
                    if (!targetInput && dropdown && dropdown.id) {
                        const guessed = dropdown.id.replace(/Dropdown$/i, 'Input');
                        targetInput = document.getElementById(guessed) || document.getElementById(dropdown.id.replace(/Dropdown$/i, ''));
                    }

                    // Fallback: previous element sibling
                    if (!targetInput && dropdown && dropdown.previousElementSibling) {
                        const prev = dropdown.previousElementSibling;
                        if (/input|select|textarea/i.test(prev.tagName)) targetInput = prev;
                    }

                    if (targetInput) {
                        // Set value for text inputs
                        targetInput.value = item;
                        // Also set attributes/defaultValue for persistence and display
                        try { targetInput.setAttribute('value', item); } catch (err) {}
                        try { targetInput.defaultValue = item; } catch (err) {}
                        targetInput.dataset.selected = item;

                        // If it's a select element, try to match an existing option by value or text
                        if (targetInput.tagName && targetInput.tagName.toLowerCase() === 'select') {
                            const opt = Array.from(targetInput.options).find(o => (o.value === item) || (o.text === item));
                            if (opt) {
                                opt.selected = true;
                                targetInput.value = opt.value;
                            }
                        }

                        // Debugging: log selection
                        try { console.debug('Filter dropdown selection:', { dropdownId: dropdown.id, selected: item, inputId: targetInput.id }); } catch (err) {}

                        // Dispatch both input and change so listeners react
                        targetInput.dispatchEvent(new Event('input', { bubbles: true }));
                        targetInput.dispatchEvent(new Event('change', { bubbles: true }));

                        // Focus so the value is visible and caret placed at end
                        try {
                            targetInput.focus();
                            if (typeof targetInput.value === 'string' && targetInput.setSelectionRange) {
                                const len = targetInput.value.length;
                                targetInput.setSelectionRange(len, len);
                            }
                        } catch (err) {
                            // ignore focus errors
                        }

                        // Hide dropdown after a short delay to let any blur handlers finish
                        setTimeout(() => {
                            dropdown.classList.remove('active');
                        }, 100);
                    }
                };

                itemElement.addEventListener('mousedown', handleSelection);
                itemElement.addEventListener('touchstart', handleSelection);
                itemElement.addEventListener('click', handleSelection);

                dropdown.appendChild(itemElement);
            });
        }

        // Setup Signup Dialog Filters

        function getCoursesForUniversity(university) {
            return universityCourses[university] || [];
        }

        // Store course event handlers to properly manage them
        const courseEventHandlers = {};

        // Helper function to update course dropdown based on selected university
        function updateCoursesForUniversity(universityInputId, courseInputId, courseDropdownId) {
            const universityInput = document.getElementById(universityInputId);
            let courseInput = document.getElementById(courseInputId);
            const courseDropdown = document.getElementById(courseDropdownId);
            
            if (!universityInput || !courseInput || !courseDropdown) return;
            
            const selectedUniversity = universityInput.value;
            const availableCourses = getCoursesForUniversity(selectedUniversity);
            
            console.log('updateCoursesForUniversity called:', {selectedUniversity, coursesCount: availableCourses.length, courses: availableCourses});
            
            // Clone course input to remove all old event listeners from setupFilterDropdown
            const clonedCourseInput = courseInput.cloneNode(true);
            courseInput.parentNode.replaceChild(clonedCourseInput, courseInput);
            courseInput = document.getElementById(courseInputId); // Get reference to new element
            
            // Clear course input
            courseInput.value = '';
            
            // Reset dropdown state - remove active class and clear
            courseDropdown.classList.remove('active');
            courseDropdown.innerHTML = '';
            
            // Update dropdown with available courses
            if (availableCourses && availableCourses.length > 0) {
                console.log('Setting up course dropdown with courses:', availableCourses);
                
                // Create event handlers with closure over availableCourses
                const handleCourseFocus = () => {
                    console.log('Course input focused - rendering dropdown with courses:', availableCourses);
                    // Clear and render dropdown items fresh on every focus
                    courseDropdown.innerHTML = '';
                    renderDropdownItems(courseDropdown, availableCourses, '');
                    courseDropdown.classList.add('active');
                };
                
                const handleCourseInput = (e) => {
                    const filterValue = e.target.value.toLowerCase();
                    console.log('Course input event - filter value:', filterValue);
                    courseDropdown.innerHTML = '';
                    if (filterValue === '') {
                        renderDropdownItems(courseDropdown, availableCourses, '');
                    } else {
                        const filtered = availableCourses.filter(course => 
                            course.toLowerCase().includes(filterValue)
                        );
                        renderDropdownItems(courseDropdown, filtered, filterValue);
                    }
                    courseDropdown.classList.add('active');
                };
                
                const handleCourseBlur = () => {
                    console.log('Course input blur - hiding dropdown');
                    setTimeout(() => {
                        courseDropdown.classList.remove('active');
                    }, 150);
                };
                
                // Attach event listeners
                courseInput.addEventListener('focus', handleCourseFocus);
                courseInput.addEventListener('input', handleCourseInput);
                courseInput.addEventListener('blur', handleCourseBlur);
                
                console.log('Course dropdown setup complete with', availableCourses.length, 'courses');
            } else {
                console.log('No courses available for:', selectedUniversity);
                courseDropdown.innerHTML = '';
                const noResult = document.createElement('div');
                noResult.className = 'filter-dropdown-item';
                noResult.textContent = 'No courses available for this university';
                noResult.style.color = 'var(--text-light)';
                noResult.style.cursor = 'default';
                courseDropdown.appendChild(noResult);
            }
        }

        // Setup Forum Filters
