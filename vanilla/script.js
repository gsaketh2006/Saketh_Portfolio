/**
 * Saketh - Portfolio Website (Vanilla JS Version)
 * Ported from React to Vanilla HTML/CSS/JS
 */

const initialData = {
    settings: {
        siteName: "Saketh",
        siteTitle: "Saketh — AI & ML Engineer",
        logoText: "Saketh",
        navLinks: [
            { text: "Home", href: "#home", section: "home" },
            { text: "About", href: "#about", section: "about" },
            { text: "Skills", href: "#skills", section: "skills" },
            { text: "Projects", href: "#projects", section: "projects" },
            { text: "Experience", href: "#experience", section: "experience" },
            { text: "Certifications", href: "#certifications", section: "certifications" },
            { text: "Contact", href: "#contact", section: "contact" }
        ],
        sectionTitles: {
            about: "About Me",
            skills: "Skills & Technologies",
            projects: "Featured Projects",
            experience: "Experience",
            certifications: "Certifications",
            contact: "Get In Touch"
        },
        footer: {
            text: "Designed & Built by Saketh",
            year: 2025
        },
        githubUsername: "gsaketh2006",
        leetcodeUsername: "saketh_g",
        scrollIndicatorText: "Scroll to explore"
    },
    hero: {
        greeting: "Hi, I'm",
        typingTexts: [
            "G.L.N.S.S. Saketh",
            "AI & ML Engineer",
            "CV Enthusiast",
            "Problem Solver"
        ],
        role: "AI & ML Engineer · Computer Vision Enthusiast",
        description: "I build intelligent systems that see, learn, and solve real-world problems. Passionate about end-to-end ML pipelines, deep learning, and crafting elegant solutions.",
        badgeText: "Available for opportunities",
        buttons: [
            { text: "Let's Connect", href: "#contact", icon: "fas fa-arrow-right", type: "primary" },
            { text: "View Projects", href: "#projects", icon: "fas fa-code", type: "outline" }
        ],
        socialLinks: [
            { url: "https://github.com/gsaketh2006", icon: "fab fa-github", label: "GitHub" },
            { url: "https://www.linkedin.com/in/guggilam-leela-naga-sai-sri-saketh-326853289/", icon: "fab fa-linkedin-in", label: "LinkedIn" },
            { url: "mailto:guggilamsaketh@gmail.com", icon: "fas fa-envelope", label: "Email" }
        ],
        resumeUrl: "",
        avatarImage: ""
    },
    about: {
        title: "About Me",
        description: "I'm a passionate B.Tech CSE (AI & ML) student at SRM University–AP and a Computer Vision enthusiast. I enjoy solving real-world problems using machine learning, deep learning, and end-to-end model deployment. Learning | Building | Experimenting",
        currentRoleTitle: "Summer Research Intern",
        currentRoleOrg: "SRM University-AP",
        showGithubGrid: true,
        showLeetcodeGrid: true
    },
    skills: {
        "Programming Languages": ["C", "C++", "Python"],
        "Web Technologies": ["HTML5", "CSS", "Java Script", "PHP"],
        "Database & Cloud": ["MySQL", "Vercel", "Infinity free"],
        "Tools & Analytics": ["Power BI", "GitHub"],
        "Libraries & Frameworks": ["numpy", "pandas", "scikit-learn"],
        "Operating Systems": ["Windows", "Linux", "MacOS"]
    },
    experience: [
        {
            date: "June 2025 - Present",
            title: "Summer Research Intern",
            company: "SRM University-AP",
            description: "Conducted a faculty-guided research internship focused on building a machine learning–based screening system for early prediction of Autism Spectrum Disorder (ASD) in adults using questionnaire and demographic data. Developed an end-to-end ML pipeline and deployed the final model as a web application.",
            achievements: [
                "Built and evaluated multiple ML models with cross-validation and hyperparameter tuning; achieved 95% accuracy using a Random Forest classifier.",
                "Handled class imbalance using SMOTE and improved interpretability through feature importance analysis.",
                "Deployed the solution as a Flask-based web app for real-time screening predictions."
            ],
            icon: "fa-code",
            color: "#667eea"
        }
    ],
    certifications: [
        {
            title: "AWS Certified Cloud Practitioner",
            organization: "Amazon Web Services",
            image: "https://d1.awsstatic.com/training-and-certification/Certification%20Badges/AWS-Certified_Cloud_Practitioner_512x512.bc006f14f986fa4f3ca6b5c8933bfef0a177b9bc.png",
            issueDate: "2024-01-15",
            credentialId: "AWS-CCP-12345",
            credentialUrl: "https://www.credly.com/badges/example",
            color: "#FF9900"
        },
        {
            title: "Google Cloud Professional Cloud Architect",
            organization: "Google Cloud",
            image: "https://www.gstatic.com/cloud/images/product/png_96/cloud_512_96.png",
            issueDate: "2023-11-20",
            credentialId: "GCP-PCA-67890",
            credentialUrl: "https://www.credly.com/badges/example",
            color: "#4285F4"
        },
        {
            title: "Microsoft Azure Fundamentals",
            organization: "Microsoft",
            image: "https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-fundamentals-badge.svg",
            issueDate: "2023-09-10",
            credentialId: "MS-AZ-900-11111",
            credentialUrl: "https://www.credly.com/badges/example",
            color: "#0078D4"
        }
    ],
    contact: {
        title: "Get In Touch",
        heading: "Let's Work Together",
        description: "I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions.",
        email: { label: "Email", value: "guggilamsaketh@gmail.com", icon: "fas fa-envelope", link: "mailto:guggilamsaketh@gmail.com" },
        phone: { label: "Phone", value: "+1 (234) 567-890", icon: "fas fa-phone", link: "tel:+1234567890" },
        location: { label: "Location", value: "Andhra Pradesh, India", icon: "fas fa-map-marker-alt", link: null },
        socialLinks: [
            { platform: "GitHub", url: "https://github.com", icon: "fab fa-github", ariaLabel: "GitHub" },
            { platform: "LinkedIn", url: "https://www.linkedin.com/in/guggilam-leela-naga-sai-sri-saketh-326853289/", icon: "fab fa-linkedin", ariaLabel: "LinkedIn" },
            { platform: "Twitter", url: "https://twitter.com", icon: "fab fa-twitter", ariaLabel: "Twitter" },
            { platform: "Dribbble", url: "https://dribbble.com", icon: "fab fa-dribbble", ariaLabel: "Dribbble" }
        ]
    }
};

// --- State Management ---
let state = {
    data: JSON.parse(localStorage.getItem('portfolio_data')) || initialData,
    theme: localStorage.getItem('theme') || 'dark',
    activeSection: 'home',
    navOpen: false,
    isAdmin: false,
    mousePos: { x: 0, y: 0 },
    projects: [],
    loadingProjects: true,
    searchTerm: ''
};

// --- Initialization ---
function init() {
    applyTheme();
    renderAll();
    setupEventListeners();
    initParticles();
    initIntersectionObserver();
    startTypingAnimation();
    fetchGithubProjects();
    
    // Remove preloader
    setTimeout(() => {
        document.getElementById('preloader')?.classList.add('fade-out');
    }, 1500);
}

// --- Render All ---
function renderAll() {
    renderNavbar();
    renderSideNav();
    renderHero();
    renderAbout();
    renderSkills();
    renderExperience();
    renderCertifications();
    renderContact();
    renderFooter();
}

// --- Theme Management ---
function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) {
        themeIcon.className = state.theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', state.theme);
    applyTheme();
}

// --- Navbar Rendering ---
function renderNavbar() {
    const desktopMenu = document.getElementById('nav-menu-desktop');
    const mobileMenu = document.getElementById('nav-menu-mobile');
    const logoText = document.getElementById('logo-text');
    logoText.textContent = state.data.settings.logoText;

    const linksHtml = state.data.settings.navLinks.map(link => `
        <a href="${link.href}" class="nav-link ${state.activeSection === link.section ? 'active' : ''}" data-section="${link.section}">
            ${link.text}
        </a>
    `).join('');

    desktopMenu.innerHTML = linksHtml;
    mobileMenu.innerHTML = linksHtml;

    // Attach click listeners to new links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
            closeNav();
        });
    });

    updateNavIndicator();
}

function updateNavIndicator() {
    const activeLink = document.querySelector(`.nav-link[data-section="${state.activeSection}"]`);
    const indicator = document.getElementById('nav-pill-indicator');
    const pill = document.querySelector('.nav-pill');
    
    if (activeLink && indicator && pill) {
        const pillRect = pill.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        indicator.style.left = `${linkRect.left - pillRect.left}px`;
        indicator.style.width = `${linkRect.width}px`;
        indicator.style.opacity = '0.15';
    } else if (indicator) {
        indicator.style.opacity = '0';
    }
}

// --- Side Nav Rendering ---
function renderSideNav() {
    const sideNav = document.getElementById('side-nav');
    sideNav.innerHTML = `<div class="side-nav-track"></div>` + state.data.settings.navLinks.map(link => `
        <a href="${link.href}" class="side-nav-dot ${state.activeSection === link.section ? 'active' : ''}" aria-label="Go to ${link.text}">
            <span class="dot-label">${link.text}</span>
            <div class="dot-circle"></div>
        </a>
    `).join('');

    sideNav.querySelectorAll('.side-nav-dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = dot.getAttribute('href').substring(1);
            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// --- Hero Rendering ---
function renderHero() {
    const d = state.data.hero;
    document.getElementById('hero-badge-text').textContent = d.badgeText;
    document.getElementById('hero-greeting').textContent = d.greeting;
    document.getElementById('hero-role-text').textContent = d.role;
    document.getElementById('hero-description').textContent = d.description;

    const buttonsContainer = document.getElementById('hero-buttons');
    buttonsContainer.innerHTML = d.buttons.map(b => `
        <a href="${b.href}" class="btn btn-${b.type}">
            <span>${b.text}</span><i class="${b.icon}"></i>
        </a>
    `).join('');
    
    if (d.resumeUrl) {
        buttonsContainer.innerHTML += `
            <a href="${d.resumeUrl}" target="_blank" class="btn btn-outline">
                <span>Resume</span><i class="fas fa-download"></i>
            </a>
        `;
    }

    const socialsContainer = document.getElementById('hero-socials');
    socialsContainer.innerHTML = d.socialLinks.map(s => `
        <a href="${s.url}" target="_blank" rel="noopener noreferrer" aria-label="${s.label}"><i class="${s.icon}"></i></a>
    `).join('');

    const avatarContainer = document.getElementById('avatar-container');
    if (d.avatarImage) {
        avatarContainer.innerHTML = `<img src="${d.avatarImage}" alt="Profile" class="avatar-image">`;
    } else {
        avatarContainer.innerHTML = `<div class="avatar-placeholder"><i class="fas fa-user"></i></div>`;
    }
}

// --- About Rendering ---
function renderAbout() {
    const d = state.data.about;
    const s = state.data.settings;
    document.getElementById('about-title-text').textContent = s.sectionTitles?.about || "About Me";
    document.getElementById('about-display-title').textContent = d.title;
    document.getElementById('about-description').textContent = d.description;
    document.getElementById('current-role-title').textContent = d.currentRoleTitle;
    document.getElementById('current-role-org').textContent = d.currentRoleOrg;

    const gridsContainer = document.getElementById('contribution-grids');
    gridsContainer.innerHTML = '';
    if (d.showGithubGrid) {
        gridsContainer.innerHTML += `
            <div class="grid-item">
                <div class="github-contribution-grid">
                    <a href="https://github.com/${s.githubUsername}" target="_blank" class="github-grid-link glass-card">
                        <div class="grid-header"><i class="fab fa-github"></i><span>GitHub Contributions</span></div>
                        <div class="grid-image-container">
                            <img src="https://ghchart.rshah.org/40c463/${s.githubUsername}" alt="GitHub" class="github-grid-img" loading="lazy">
                        </div>
                        <div class="grid-footer"><span>Click to view profile</span></div>
                    </a>
                </div>
            </div>
        `;
    }
    if (d.showLeetcodeGrid) {
        gridsContainer.innerHTML += `
            <div class="grid-item">
                <div class="leetcode-contribution-grid">
                    <a href="https://leetcode.com/${s.leetcodeUsername}" target="_blank" class="leetcode-grid-link glass-card">
                        <div class="grid-header"><i class="fas fa-code"></i><span>LeetCode Submissions</span></div>
                        <div class="grid-image-container">
                            <img src="https://leetcode-stats-card.vercel.app/?username=${s.leetcodeUsername}&theme=dark" alt="LeetCode" class="leetcode-grid-img" loading="lazy">
                        </div>
                        <div class="grid-footer"><span>Click to view profile</span></div>
                    </a>
                </div>
            </div>
        `;
    }
}

// --- Skills Rendering ---
function renderSkills() {
    const d = state.data.skills;
    const s = state.data.settings;
    document.getElementById('skills-title-text').textContent = s.sectionTitles.skills;
    
    const grid = document.getElementById('skills-grid');
    const gradients = [
        'linear-gradient(135deg, #667eea, #764ba2)',
        'linear-gradient(135deg, #f093fb, #f5576c)',
        'linear-gradient(135deg, #4facfe, #00f2fe)',
        'linear-gradient(135deg, #43e97b, #38f9d7)',
        'linear-gradient(135deg, #fa709a, #fee140)',
        'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    ];

    const iconMap = {
        'programming': 'fa-code', 'web': 'fa-globe', 'database': 'fa-database',
        'tools': 'fa-wrench', 'libraries': 'fa-layer-group', 'operating': 'fa-desktop'
    };

    grid.innerHTML = Object.entries(d).map(([cat, skills], i) => {
        let icon = 'fa-cubes';
        const lowerCat = cat.toLowerCase();
        for (let [k, v] of Object.entries(iconMap)) {
            if (lowerCat.includes(k)) { icon = v; break; }
        }

        return `
            <div class="skill-card glass-card reveal" style="--skill-gradient: ${gradients[i % gradients.length]}">
                <div class="skill-card-header">
                    <div class="skill-icon-wrap"><i class="fas ${icon}"></i></div>
                    <h3>${cat}</h3>
                </div>
                <div class="skill-tags">
                    ${skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// --- Experience Rendering ---
function renderExperience() {
    const d = state.data.experience;
    const s = state.data.settings;
    document.getElementById('experience-title-text').textContent = s.sectionTitles.experience;
    
    const timeline = document.getElementById('experience-timeline');
    timeline.innerHTML = d.map(exp => `
        <div class="timeline-item reveal">
            <div class="timeline-marker"><i class="fas ${exp.icon || 'fa-briefcase'}"></i></div>
            <div class="timeline-content glass-card">
                <span class="timeline-date">${exp.date}</span>
                <h3>${exp.title}</h3>
                <h4>${exp.company}</h4>
                <p>${exp.description}</p>
                ${exp.achievements ? `<ul class="timeline-achievements">${exp.achievements.map(a => `<li>${a}</li>`).join('')}</ul>` : ''}
            </div>
        </div>
    `).join('');
}

// --- Certifications Rendering ---
function renderCertifications() {
    const d = state.data.certifications;
    const s = state.data.settings;
    document.getElementById('certifications-title-text').textContent = s.sectionTitles.certifications;
    
    const grid = document.getElementById('certs-grid');
    grid.innerHTML = d.map(cert => `
        <div class="cert-card glass-card reveal" onclick="window.open('${cert.credentialUrl}', '_blank')">
            <div class="cert-card-image" style="border-bottom: 3px solid ${cert.color || 'var(--lavender)'}">
                <img src="${cert.image}" alt="${cert.title}">
            </div>
            <div class="cert-card-body">
                <h3>${cert.title}</h3>
                <span class="cert-card-org">${cert.organization}</span>
                <span class="cert-card-date"><i class="fas fa-calendar-alt"></i> ${cert.issueDate}</span>
                <a href="${cert.credentialUrl}" target="_blank" class="cert-card-link">View Credential <i class="fas fa-external-link-alt"></i></a>
            </div>
        </div>
    `).join('');
}

// --- Projects Logic ---
async function fetchGithubProjects() {
    const username = state.data.settings.githubUsername;
    const listContainer = document.getElementById('projects-list');
    
    // Skeleton
    listContainer.innerHTML = Array(4).fill(0).map(() => `
        <div class="project-bar glass-card skeleton-card">
            <div class="skeleton-body">
                <div class="skeleton-line skeleton-title"></div>
                <div class="skeleton-line skeleton-text"></div>
                <div class="skeleton-tags"><div class="skeleton-tag"></div><div class="skeleton-tag"></div></div>
            </div>
        </div>
    `).join('');

    try {
        const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
        const repos = await res.json();
        state.projects = repos.filter(r => !r.fork).map(r => ({
            name: r.name,
            description: r.description,
            url: r.html_url,
            homepage: r.homepage,
            stars: r.stargazers_count,
            language: r.language,
            topics: r.topics || []
        }));
        state.loadingProjects = false;
        renderProjects();
    } catch (e) {
        console.error(e);
        listContainer.innerHTML = `<p class="error">Failed to load projects. Check console.</p>`;
    }
}

function renderProjects() {
    const container = document.getElementById('projects-list');
    const countSpan = document.getElementById('projects-count');
    const term = state.searchTerm.toLowerCase();
    
    const filtered = state.projects.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.topics.some(t => t.toLowerCase().includes(term)) ||
        (p.language && p.language.toLowerCase().includes(term))
    );

    countSpan.textContent = `${filtered.length} projects`;

    if (filtered.length === 0) {
        container.innerHTML = `<div class="projects-empty"><i class="fas fa-search"></i><p>No projects match "${state.searchTerm}"</p></div>`;
        return;
    }

    const langColors = {
        Python: '#3572A5', JavaScript: '#f1e05a', TypeScript: '#3178c6', HTML: '#e34c26',
        CSS: '#563d7c', Java: '#b07219', 'C++': '#f34b7d', C: '#555555', PHP: '#4F5D95',
        'Jupyter Notebook': '#DA5B0B'
    };

    container.innerHTML = filtered.map(p => `
        <div class="project-bar glass-card reveal" onclick="window.open('${p.url}/blob/HEAD/README.md', '_blank')">
            <div class="project-bar-body">
                <div class="project-bar-top">
                    <div class="project-bar-title-wrap">
                        <h3>${p.name.replace(/-/g, ' ')}</h3>
                        ${p.language ? `
                            <span class="project-language">
                                <span class="lang-dot" style="background: ${langColors[p.language] || '#8b8b8b'}"></span>
                                ${p.language}
                            </span>
                        ` : ''}
                    </div>
                    <div class="project-bar-actions">
                        ${p.homepage ? `<a href="${p.homepage}" target="_blank" class="project-action-btn primary" onclick="event.stopPropagation()"><i class="fas fa-external-link-alt"></i> Live</a>` : ''}
                        <a href="${p.url}/blob/HEAD/README.md" target="_blank" class="project-action-btn secondary" onclick="event.stopPropagation()"><i class="fab fa-github"></i> README</a>
                    </div>
                </div>
                ${p.description ? `<p>${p.description}</p>` : ''}
                <div class="project-bar-topics">${p.topics.map(t => `<span class="project-topic-tag">${t}</span>`).join('')}</div>
            </div>
        </div>
    `).join('');
}

// --- Contact Rendering ---
function renderContact() {
    const d = state.data.contact;
    const s = state.data.settings;
    document.getElementById('contact-title-text').textContent = s.sectionTitles.contact;
    document.getElementById('contact-heading').textContent = d.heading;
    document.getElementById('contact-description').textContent = d.description;

    const grid = document.getElementById('contact-info-grid');
    grid.innerHTML = [d.email, d.phone, d.location].filter(Boolean).map(item => `
        <div class="contact-info-item">
            <div class="info-icon"><i class="${item.icon}"></i></div>
            <div class="info-details">
                <span class="info-label">${item.label}</span>
                ${item.link ? `<a href="${item.link}" class="info-value">${item.value}</a>` : `<span class="info-value">${item.value}</span>`}
            </div>
        </div>
    `).join('');

    const socials = document.getElementById('contact-socials');
    socials.innerHTML = d.socialLinks.map(s => `
        <a href="${s.url}" target="_blank" aria-label="${s.platform}"><i class="${s.icon}"></i></a>
    `).join('');
}

// --- Footer Rendering ---
function renderFooter() {
    const f = state.data.settings.footer;
    document.getElementById('footer-text').innerHTML = `${f.text} &bull; © ${f.year}`;
}

// --- Typing Animation ---
let typingIdx = 0;
let charIdx = 0;
let isDeleting = false;
function startTypingAnimation() {
    const target = document.getElementById('typing-text');
    const texts = state.data.hero.typingTexts;
    if (!target || !texts.length) return;

    const currentText = texts[typingIdx % texts.length];
    
    if (isDeleting) {
        target.textContent = currentText.substring(0, charIdx - 1);
        charIdx--;
    } else {
        target.textContent = currentText.substring(0, charIdx + 1);
        charIdx++;
    }

    let speed = isDeleting ? 50 : 100;

    if (!isDeleting && charIdx === currentText.length) {
        speed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        typingIdx++;
        speed = 500;
    }

    setTimeout(startTypingAnimation, speed);
}

// --- Event Listeners ---
function setupEventListeners() {
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', (e) => {
        state.mousePos = { x: e.clientX, y: e.clientY };
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
        
        // Parallax avatar
        const avatar = document.getElementById('hero-avatar-wrap');
        if (avatar) {
            const x = (e.clientX - window.innerWidth / 2) * 0.02;
            const y = (e.clientY - window.innerHeight / 2) * 0.02;
            avatar.style.transform = `translate(${x}px, ${y}px)`;
        }
    });

    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('nav-hamburger').addEventListener('click', toggleNav);
    document.getElementById('nav-overlay').addEventListener('click', closeNav);
    
    document.getElementById('projects-search-input').addEventListener('input', (e) => {
        state.searchTerm = e.target.value;
        renderProjects();
    });

    document.getElementById('back-to-top').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Admin
    document.getElementById('admin-trigger').addEventListener('click', () => {
        document.getElementById('admin-login-overlay').style.display = 'flex';
    });
    document.getElementById('admin-cancel').addEventListener('click', () => {
        document.getElementById('admin-login-overlay').style.display = 'none';
    });
    document.getElementById('admin-login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const pass = document.getElementById('admin-password').value;
        if (pass === 'Port@26') {
            state.isAdmin = true;
            document.getElementById('admin-login-overlay').style.display = 'none';
            renderAdminDashboard();
        } else {
            alert('Incorrect password');
        }
    });
}

function handleScroll() {
    const scrollY = window.scrollY;
    
    // Scrolled class for navbar
    const navbar = document.getElementById('navbar');
    navbar.classList.toggle('scrolled', scrollY > 50);

    // Scroll progress bar
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPct = (scrollY / docHeight) * 100;
    document.getElementById('scroll-progress-bar').style.width = `${scrollPct}%`;

    // Back to top visibility
    document.getElementById('back-to-top').classList.toggle('visible', scrollY > 500);

    // Active section detection
    const sections = ['home', 'about', 'skills', 'projects', 'experience', 'certifications', 'contact'];
    let current = 'home';
    for (const id of sections) {
        const el = document.getElementById(id);
        if (el && scrollY >= el.offsetTop - 250) {
            current = id;
        }
    }
    
    if (state.activeSection !== current) {
        state.activeSection = current;
        updateNavActiveState();
    }
}

function updateNavActiveState() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-section') === state.activeSection);
    });
    document.querySelectorAll('.side-nav-dot').forEach(dot => {
        dot.classList.toggle('active', dot.getAttribute('href').substring(1) === state.activeSection);
    });
    updateNavIndicator();
}

function toggleNav() {
    state.navOpen = !state.navOpen;
    document.getElementById('nav-menu-mobile').classList.toggle('open', state.navOpen);
    document.getElementById('nav-hamburger').classList.toggle('active', state.navOpen);
    document.getElementById('nav-overlay').classList.toggle('active', state.navOpen);
    document.body.style.overflow = state.navOpen ? 'hidden' : '';
}

function closeNav() {
    state.navOpen = false;
    document.getElementById('nav-menu-mobile').classList.remove('open');
    document.getElementById('nav-hamburger').classList.remove('active');
    document.getElementById('nav-overlay').classList.remove('active');
    document.body.style.overflow = '';
}

// --- Intersection Observer for Animations ---
function initIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// --- Particles Canvas ---
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const count = Math.min(55, Math.floor(window.innerWidth / 28));

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2.2 + 0.7;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.45 + 0.18;
            this.hue = Math.random() * 40 + 220;
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 55%, 72%, ${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < count; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < 130) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `hsla(230, 50%, 68%, ${0.1 * (1 - d / 130)})`;
                    ctx.lineWidth = 0.7;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}

// --- Admin Dashboard (Simplified Simulation) ---
function renderAdminDashboard() {
    const container = document.getElementById('admin-dashboard-container');
    container.innerHTML = `
        <div class="admin-dashboard-overlay">
            <div class="admin-dashboard glass-card">
                <header class="admin-header">
                    <h2>Admin Dashboard</h2>
                    <div class="admin-controls">
                        <button id="admin-save" class="btn btn-primary">Save Changes</button>
                        <button id="admin-exit" class="btn btn-outline">Exit</button>
                    </div>
                </header>
                <div class="admin-notice">Note: In this vanilla version, "Save" updates localStorage. In a real app, it would hit an API.</div>
                <div class="admin-form-container">
                    <div class="form-group">
                        <label>Site Name</label>
                        <input type="text" id="edit-site-name" value="${state.data.settings.siteName}">
                    </div>
                    <div class="form-group">
                        <label>Hero Role</label>
                        <input type="text" id="edit-hero-role" value="${state.data.settings.siteTitle}">
                    </div>
                    <!-- Add more fields as needed -->
                     <p style="margin-top:20px; color:var(--text-muted)">Full CRUD logic can be added here similarly to React. All rendering logic is already generic.</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('admin-exit').addEventListener('click', () => {
        container.innerHTML = '';
        state.isAdmin = false;
    });

    document.getElementById('admin-save').addEventListener('click', () => {
        state.data.settings.siteName = document.getElementById('edit-site-name').value;
        state.data.settings.siteTitle = document.getElementById('edit-hero-role').value;
        localStorage.setItem('portfolio_data', JSON.stringify(state.data));
        renderAll();
        alert('Saved to local storage!');
    });
}

// Run on load
window.addEventListener('DOMContentLoaded', init);
