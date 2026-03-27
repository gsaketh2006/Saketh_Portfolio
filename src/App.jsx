import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { initialData } from './initialData';
import Admin from './Admin';
import AboutSection from './components/AboutSection';

// --- Animated Counter Hook ---
// eslint-disable-next-line no-unused-vars
const useCountUp = (end, duration = 2000, startOnView = true) => {
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(!startOnView);
    const ref = useRef(null);

    useEffect(() => {
        if (!startOnView) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setStarted(true); },
            { threshold: 0.5 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [startOnView]);

    useEffect(() => {
        if (!started) return;
        let startTime;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [started, end, duration]);

    return { count, ref };
};

const App = () => {
    const [data, setData] = useState(() => {
        const saved = localStorage.getItem('portfolio_data');
        return saved ? JSON.parse(saved) : initialData;
    });

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        localStorage.setItem('portfolio_data', JSON.stringify(data));
    }, [data]);

    // Preloader
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
            const sections = ['home', 'about', 'skills', 'projects', 'experience', 'certifications', 'contact'];
            let current = 'home';
            for (const id of sections) {
                const el = document.getElementById(id);
                if (el && window.scrollY >= el.offsetTop - 200) {
                    current = id;
                }
            }
            setActiveSection(current);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordInput === 'Port@26') {
            setIsAdmin(true);
            setIsLoggingIn(false);
            setPasswordInput('');
            window.scrollTo(0, 0);
        } else {
            alert('Incorrect password');
        }
    };

    if (isAdmin) {
        return <Admin data={data} onSave={setData} onExit={() => setIsAdmin(false)} />;
    }

    return (
        <>
            {/* Preloader */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        className="preloader"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                    >
                        <div className="preloader-inner">
                            <div className="preloader-ring"></div>
                            <span className="preloader-text">Saketh</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="portfolio-app" style={{
                '--mouse-x': `${mousePos.x}px`,
                '--mouse-y': `${mousePos.y}px`
            }}>
                <ParticlesBackground />
                <div className="hero-spotlight"></div>
                <ScrollProgress />
                <SideNav navLinks={data.settings.navLinks} activeSection={activeSection} />

                <AnimatePresence>
                    {isLoggingIn && (
                        <motion.div
                            className="admin-login-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="admin-login-modal glass-card"
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                            >
                                <h3>Admin Access</h3>
                                <form onSubmit={handlePasswordSubmit}>
                                    <input
                                        type="password"
                                        placeholder="Enter password"
                                        autoFocus
                                        value={passwordInput}
                                        onChange={e => setPasswordInput(e.target.value)}
                                    />
                                    <div className="modal-actions">
                                        <button type="submit" className="btn btn-primary">Login</button>
                                        <button type="button" className="btn btn-outline" onClick={() => setIsLoggingIn(false)}>Cancel</button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Navbar
                    settings={data.settings}
                    scrolled={scrolled}
                    activeSection={activeSection}
                    theme={theme}
                    toggleTheme={toggleTheme}
                />
                <main>
                    <Section id="home"><Hero data={data.hero} mousePos={mousePos} /></Section>
                    <Section id="about"><AboutSection data={data.about} settings={data.settings} /></Section>
                    <Section id="skills"><Skills data={data.skills} settings={data.settings} /></Section>
                    <Section id="projects"><Projects settings={data.settings} /></Section>
                    <Section id="experience"><Experience data={data.experience} settings={data.settings} /></Section>
                    <Section id="certifications"><Certifications data={data.certifications} settings={data.settings} /></Section>
                    <Section id="contact"><Contact data={data.contact} settings={data.settings} /></Section>
                </main>
                <Footer settings={data.settings} data={data.contact} onAdminClick={() => setIsLoggingIn(true)} />
                <BackToTop scrolled={scrolled} />
            </div>
        </>
    );
};

// --- Scroll Progress Bar ---
const ScrollProgress = () => {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const update = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            setWidth(docHeight > 10 ? (scrollTop / docHeight) * 100 : 0);
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
        return () => window.removeEventListener('scroll', update);
    }, []);
    return (
        <div className="scroll-progress-container">
            <div className="scroll-progress-bar" style={{ width: `${width}%` }}>
                <div className="scroll-progress-glow"></div>
            </div>
        </div>
    );
};

// --- Side Navigation Dots ---
const SideNav = ({ navLinks, activeSection }) => {
    if (!navLinks) return null;
    return (
        <nav className="side-nav">
            <div className="side-nav-track"></div>
            {navLinks.map((link) => (
                <a
                    key={link.section}
                    href={link.href}
                    className={`side-nav-dot ${activeSection === link.section ? 'active' : ''}`}
                    aria-label={`Go to ${link.text}`}
                    onClick={(e) => {
                        e.preventDefault();
                        document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                >
                    <span className="dot-label">{link.text}</span>
                    <div className="dot-circle"></div>
                </a>
            ))}
        </nav>
    );
};

// --- Framer Motion Wrapper for Reveal on Scroll ---
const Section = ({ children, id }) => (
    <motion.section
        id={id}
        className="section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
        {children}
    </motion.section>
);

// --- Background ---
const ParticlesBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
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

        let animationId;
        const animate = () => {
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
            animationId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return <canvas ref={canvasRef} id="particleCanvas" style={{ position: 'fixed', inset: 0, zIndex: -1, opacity: 0.3 }} />;
};

// --- Navbar ---
const Navbar = ({ settings, scrolled, activeSection, theme, toggleTheme }) => {
    const [navOpen, setNavOpen] = useState(false);
    const pillRef = useRef(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ opacity: 0 });

    useEffect(() => {
        const activeLink = document.querySelector(`.nav-link[data-section="${activeSection}"]`);
        if (activeLink && pillRef.current) {
            const pillRect = pillRef.current.getBoundingClientRect();
            const linkRect = activeLink.getBoundingClientRect();
            setIndicatorStyle({
                left: linkRect.left - pillRect.left,
                width: linkRect.width,
                opacity: 0.15
            });
        }
    }, [activeSection, settings]);

    // Close nav on Escape key
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') setNavOpen(false); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    // Prevent body scroll when mobile nav open
    useEffect(() => {
        document.body.style.overflow = navOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [navOpen]);

    return (
        <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            {/* Mobile overlay */}
            {navOpen && <div className="nav-overlay active" onClick={() => setNavOpen(false)} aria-hidden="true" />}

            <div className="nav-container">
                <a href="#home" className="nav-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); setNavOpen(false); }}>
                    <div className="logo-icon"><i className="fas fa-terminal"></i></div>
                    <span>{settings.logoText}</span>
                </a>

                <div className="nav-pill" ref={pillRef}>
                    <div className="nav-pill-glow"></div>
                    <motion.div
                        className="nav-pill-indicator"
                        animate={indicatorStyle}
                        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
                    />
                    {/* Desktop Menu - part of the pill */}
                    <nav className="nav-menu-desktop">
                        {settings.navLinks?.map(link => (
                            <a
                                key={link.section}
                                href={link.href}
                                className={`nav-link ${activeSection === link.section ? 'active' : ''}`}
                                data-section={link.section}
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                {link.text}
                            </a>
                        ))}
                    </nav>
                </div>

                {/* Mobile Menu - Outside the pill so it's not hidden by .nav-pill {display: none} */}
                <nav className={`nav-menu ${navOpen ? 'open' : ''}`}>
                    {settings.navLinks?.map(link => (
                        <a
                            key={link.section}
                            href={link.href}
                            className={`nav-link ${activeSection === link.section ? 'active' : ''}`}
                            data-section={link.section}
                            onClick={(e) => {
                                e.preventDefault();
                                document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                                setNavOpen(false);
                            }}
                        >
                            {link.text}
                        </a>
                    ))}
                </nav>

                <div className="nav-actions">
                    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                        <i className={`fas fa-${theme === 'dark' ? 'moon' : 'sun'}`}></i>
                    </button>
                    <button
                        className={`nav-hamburger ${navOpen ? 'active' : ''}`}
                        onClick={() => setNavOpen(!navOpen)}
                        aria-label={navOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={navOpen}
                    >
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </div>
        </header>
    );
};

// --- Hero ---
const Hero = ({ data, mousePos }) => {
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);

    useEffect(() => {
        if (!data?.typingTexts) return;
        const handleType = () => {
            const i = loopNum % data.typingTexts.length;
            const fullText = data.typingTexts[i];
            setText(isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1));
            setTypingSpeed(isDeleting ? 40 : 100);

            if (!isDeleting && text === fullText) {
                setTimeout(() => setIsDeleting(true), 1500);
            } else if (isDeleting && text === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };
        const timer = setTimeout(handleType, typingSpeed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, data, typingSpeed]);

    if (!data) return null;
    return (
        <div className="container hero-grid">
            <div className="hero-text">
                <div className="hero-badge"><span className="badge-dot"></span>{data.badgeText}</div>
                <h1 className="hero-name">
                    {data.greeting}
                    <span className="hero-name-typing gradient-text">
                        {text}<span className="typing-cursor"></span>
                    </span>
                </h1>
                <p className="hero-role"><span className="role-icon">⚡</span>{data.role}</p>
                <p className="hero-desc">{data.description}</p>
                <div className="hero-cta">
                    {data.buttons?.map(b => (
                        <motion.a
                            key={b.text}
                            href={b.href}
                            className={`btn btn-${b.type}`}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => {
                                if (b.href.startsWith('#')) {
                                    e.preventDefault();
                                    document.querySelector(b.href)?.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                        >
                            <span>{b.text}</span><i className={b.icon}></i>
                        </motion.a>
                    ))}
                    {data.resumeUrl && (
                        <motion.a
                            href={data.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span>Resume</span><i className="fas fa-download"></i>
                        </motion.a>
                    )}
                </div>
                <div className="hero-socials">
                    {data.socialLinks?.map(s => (
                        <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}><i className={s.icon}></i></a>
                    ))}
                </div>
            </div>
            <div className="hero-visual">
                <motion.div
                    className="hero-avatar-wrap"
                    style={{
                        x: (mousePos.x - window.innerWidth / 2) * 0.02,
                        y: (mousePos.y - window.innerHeight / 2) * 0.02,
                    }}
                >
                    <div className="avatar-glow"></div>
                    <div className="avatar-ring"></div>
                    {data.avatarImage ? (
                        <img src={data.avatarImage} alt="Profile" className="avatar-image" />
                    ) : (
                        <div className="avatar-placeholder"><i className="fas fa-user"></i></div>
                    )}
                </motion.div>
            </div>
            {/* Scroll Indicator */}
            <div className="scroll-indicator">
                <div className="scroll-mouse"><div className="scroll-wheel"></div></div>
                <span>Scroll to explore</span>
            </div>
        </div>
    );
};

// --- Skills ---
const Skills = ({ data, settings }) => {
    if (!data) return null;
    const iconMap = {
        'programming languages': 'fa-code',
        'web technologies': 'fa-globe',
        'database & cloud': 'fa-database',
        'tools & analytics': 'fa-wrench',
        'libraries & frameworks': 'fa-layer-group',
        'operating systems': 'fa-desktop',
        'machine learning': 'fa-brain',
        'ai & ml': 'fa-robot',
        'devops': 'fa-server',
        'mobile': 'fa-mobile-alt',
    };

    const getIcon = (category) => {
        const lower = category.toLowerCase();
        for (const [key, icon] of Object.entries(iconMap)) {
            if (lower.includes(key) || key.includes(lower)) return icon;
        }
        return 'fa-cubes';
    };

    const gradients = [
        'linear-gradient(135deg, #667eea, #764ba2)',
        'linear-gradient(135deg, #f093fb, #f5576c)',
        'linear-gradient(135deg, #4facfe, #00f2fe)',
        'linear-gradient(135deg, #43e97b, #38f9d7)',
        'linear-gradient(135deg, #fa709a, #fee140)',
        'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    ];

    return (
        <div className="container">
            <h2 className="section-heading"><span className="heading-num">02.</span>{settings.sectionTitles?.skills}<span className="heading-line"></span></h2>
            <div className="skills-grid">
                {Object.entries(data).map(([cat, skills], i) => (
                    <motion.div
                        key={cat}
                        className="skill-card glass-card"
                        style={{ '--skill-gradient': gradients[i % gradients.length] }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                        <div className="skill-card-header">
                            <div className="skill-icon-wrap"><i className={`fas ${getIcon(cat)}`}></i></div>
                            <h3>{cat}</h3>
                        </div>
                        <div className="skill-tags">
                            {skills.map((s, j) => (
                                <motion.span
                                    key={s}
                                    className="skill-tag"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: i * 0.1 + j * 0.05 }}
                                >
                                    {s}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// --- Projects (GitHub API) ---
const Projects = ({ settings }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRepos = async () => {
            try {
                const res = await fetch(`https://api.github.com/users/${settings.githubUsername || 'gsaketh2006'}/repos?sort=updated&per_page=100`);
                const repos = await res.json();
                setProjects(repos.filter(r => !r.fork).map(r => ({
                    name: r.name,
                    description: r.description,
                    url: r.html_url,
                    homepage: r.homepage,
                    stars: r.stargazers_count,
                    language: r.language,
                    topics: r.topics || []
                })));
            } catch (e) { console.error(e); }
            setLoading(false);
        };
        fetchRepos();
    }, [settings.githubUsername]);

    const langColors = {
        Python: '#3572A5', JavaScript: '#f1e05a', TypeScript: '#3178c6', HTML: '#e34c26',
        CSS: '#563d7c', Java: '#b07219', 'C++': '#f34b7d', C: '#555555', Ruby: '#701516',
        Go: '#00ADD8', Rust: '#dea584', PHP: '#4F5D95', 'Jupyter Notebook': '#DA5B0B',
        Shell: '#89e051', R: '#198CE7', Dart: '#00B4AB', Swift: '#F05138', Kotlin: '#A97BFF',
    };

    const filtered = projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.topics.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.language && p.language.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="container">
            <h2 className="section-heading"><span className="heading-num">03.</span>{settings.sectionTitles?.projects}<span className="heading-line"></span></h2>
            <div className="projects-search-bar">
                <i className="fas fa-search"></i>
                <input type="text" placeholder="Search projects by name, topic, or language..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <span className="projects-count">{filtered.length} projects</span>
            </div>
            {loading ? (
                <div className="projects-list">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="project-bar glass-card skeleton-card">
                            <div className="skeleton-body">
                                <div className="skeleton-line skeleton-title"></div>
                                <div className="skeleton-line skeleton-text"></div>
                                <div className="skeleton-line skeleton-text short"></div>
                                <div className="skeleton-tags">
                                    <div className="skeleton-tag"></div>
                                    <div className="skeleton-tag"></div>
                                    <div className="skeleton-tag"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="projects-list">
                    {filtered.map((p, i) => (
                        <motion.div
                            key={p.name}
                            className="project-bar glass-card"
                            onClick={() => window.open(`${p.url}/blob/HEAD/README.md`, '_blank')}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                        >
                            <div className="project-bar-body">
                                <div className="project-bar-top">
                                    <div className="project-bar-title-wrap">
                                        <h3>{p.name.replace(/-/g, ' ')}</h3>
                                        {p.language && (
                                            <span className="project-language">
                                                <span className="lang-dot" style={{ background: langColors[p.language] || '#8b8b8b' }}></span>
                                                {p.language}
                                            </span>
                                        )}
                                    </div>
                                    <div className="project-bar-actions">
                                        {p.homepage && (
                                            <a
                                                href={p.homepage}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="project-action-btn primary"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <i className="fas fa-external-link-alt"></i> Live Demo
                                            </a>
                                        )}
                                        <a
                                            href={`${p.url}/blob/HEAD/README.md`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="project-action-btn secondary"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <i className="fab fa-github"></i> README
                                        </a>
                                    </div>
                                </div>
                                {p.description && <p>{p.description}</p>}
                                {p.topics.length > 0 && (
                                    <div className="project-bar-topics">{p.topics.map(t => <span key={t} className="project-topic-tag">{t}</span>)}</div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="projects-empty">
                            <i className="fas fa-search"></i>
                            <p>No projects match &quot;{searchTerm}&quot;</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Experience ---
const Experience = ({ data, settings }) => {
    if (!data) return null;
    return (
        <div className="container">
            <h2 className="section-heading"><span className="heading-num">04.</span>{settings.sectionTitles?.experience}<span className="heading-line"></span></h2>
            <div className="timeline">
                {data.map((exp, i) => (
                    <motion.div
                        key={i}
                        className="timeline-item"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6, delay: i * 0.15 }}
                    >
                        <div className="timeline-marker"><i className={`fas ${exp.icon || 'fa-briefcase'}`}></i></div>
                        <div className="timeline-content glass-card">
                            <span className="timeline-date">{exp.date}</span>
                            <h3>{exp.title}</h3>
                            <h4>{exp.company}</h4>
                            <p>{exp.description}</p>
                            {exp.achievements && <ul className="timeline-achievements">{exp.achievements.map((a, j) => <li key={j}>{a}</li>)}</ul>}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// --- Certifications ---
const Certifications = ({ data, settings }) => {
    if (!data) return null;
    return (
        <div className="container">
            <h2 className="section-heading"><span className="heading-num">05.</span>{settings.sectionTitles?.certifications}<span className="heading-line"></span></h2>
            <div className="certs-grid">
                {data.map((cert, i) => (
                    <motion.div
                        key={i}
                        className="cert-card glass-card"
                        onClick={() => window.open(cert.credentialUrl, '_blank')}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                        <div className="cert-card-image" style={{ borderBottom: `3px solid ${cert.color || 'var(--lavender)'}` }}>
                            <CertImage src={cert.image} alt={cert.title} color={cert.color} />
                        </div>
                        <div className="cert-card-body">
                            <h3>{cert.title}</h3>
                            <span className="cert-card-org">{cert.organization}</span>
                            {cert.issueDate && <span className="cert-card-date"><i className="fas fa-calendar-alt"></i> {cert.issueDate}</span>}
                            <a href={cert.credentialUrl} target="_blank" className="cert-card-link" onClick={e => e.stopPropagation()} rel="noopener noreferrer">View Credential <i className="fas fa-external-link-alt"></i></a>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// --- Cert Image with fallback ---
const CertImage = ({ src, alt, color }) => {
    const [error, setError] = useState(false);
    if (error || !src) {
        return (
            <div className="cert-image-fallback" style={{ background: `linear-gradient(135deg, ${color || 'var(--lavender)'}, ${color || 'var(--sky)'}40)` }}>
                <i className="fas fa-certificate"></i>
                <span>{alt}</span>
            </div>
        );
    }
    return <img src={src} alt={alt} onError={() => setError(true)} />;
};

// --- Contact ---
const Contact = ({ data, settings }) => {
    if (!data) return null;
    return (
        <div className="container">
            <h2 className="section-heading"><span className="heading-num">06.</span>{settings.sectionTitles?.contact}<span className="heading-line"></span></h2>
            <div className="contact-wrap">
                <div className="contact-intro"><h3>{data.heading}</h3><p>{data.description}</p></div>
                <div className="contact-cards">
                    {[data.email, data.phone, data.location].filter(Boolean).map(item => (
                        <div key={item.label} className="contact-card glass-card">
                            <i className={item.icon}></i>
                            <h4>{item.label}</h4>
                            {item.link ? (
                                <a href={item.link}>{item.value}</a>
                            ) : (
                                <p>{item.value}</p>
                            )}
                        </div>
                    ))}
                </div>
                {data.socialLinks?.length > 0 && (
                    <div className="contact-socials">
                        {data.socialLinks.map(s => (
                            <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.ariaLabel || s.platform}>
                                <i className={s.icon}></i>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const Footer = ({ settings, data, onAdminClick }) => (
    <footer className="footer">
        <div className="container">
            <div className="footer-content">
                <div className="footer-brand">
                    <div className="footer-logo"><i className="fas fa-terminal"></i> {settings.logoText || 'Saketh'}</div>
                    <p className="footer-tagline">Building intelligent systems that solve real-world problems.</p>
                </div>
                <div className="footer-nav">
                    <h4>Quick Links</h4>
                    <div className="footer-nav-links">
                        {settings.navLinks?.slice(0, 4).map(link => (
                            <a key={link.section} href={link.href} onClick={(e) => {
                                e.preventDefault();
                                document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                            }}>{link.text}</a>
                        ))}
                    </div>
                </div>
                <div className="footer-social">
                    <h4>Connect</h4>
                    <div className="footer-links">
                        {data?.socialLinks?.map(s => (
                            <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.platform}><i className={s.icon}></i></a>
                        ))}
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>{settings.footer?.text} · © {settings.footer?.year || new Date().getFullYear()}</p>
                <button className="admin-secret-link" onClick={onAdminClick}>admin</button>
            </div>
        </div>
    </footer>
);

const BackToTop = ({ scrolled }) => (
    <button
        className={`back-to-top ${scrolled ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
    >
        <i className="fas fa-chevron-up"></i>
    </button>
);

export default App;
