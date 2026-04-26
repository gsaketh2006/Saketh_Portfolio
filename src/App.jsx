import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { initialData } from './initialData';
import Admin from './Admin';
import About from './components/About/About';
import { supabase } from './lib/supabase';
import React, { Suspense } from 'react';

const Spline = React.lazy(() => import("@splinetool/react-spline"));

// --- Custom Hooks ---
const useMagnetic = (ref, strength = 0.5) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 150, damping: 15 });
    const springY = useSpring(y, { stiffness: 150, damping: 15 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!ref.current) return;
            const { left, top, width, height } = ref.current.getBoundingClientRect();
            const centerX = left + width / 2;
            const centerY = top + height / 2;
            const distanceX = e.clientX - centerX;
            const distanceY = e.clientY - centerY;
            
            if (Math.abs(distanceX) < width && Math.abs(distanceY) < height) {
                x.set(distanceX * strength);
                y.set(distanceY * strength);
            } else {
                x.set(0);
                y.set(0);
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [ref, strength, x, y]);

    return { x: springX, y: springY };
};

// --- Motion Components ---
const CustomCursor = () => {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    const springX = useSpring(cursorX, { stiffness: 500, damping: 28 });
    const springY = useSpring(cursorY, { stiffness: 500, damping: 28 });
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const moveCursor = (e) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };
        const handleHover = (e) => {
            const target = e.target;
            const isClickable = target.closest('a, button, .project-bar, .skill-card, .cert-card');
            setIsHovered(!!isClickable);
        };
        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleHover);
        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleHover);
        };
    }, [cursorX, cursorY]);

    return (
        <div className={isHovered ? 'cursor-hover' : ''}>
            <motion.div className="custom-cursor" style={{ x: springX, y: springY, translateX: '-50%', translateY: '-50%' }} />
            <motion.div className="custom-cursor-outline" style={{ x: springX, y: springY, translateX: '-50%', translateY: '-50%' }} />
        </div>
    );
};

const ScrollProgress = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
    return (
        <div className="scroll-progress-container">
            <motion.div className="scroll-progress-bar" style={{ scaleX, originX: 0 }} />
        </div>
    );
};

const MagneticButton = ({ children, className, ...props }) => {
    const ref = useRef(null);
    const { x, y } = useMagnetic(ref);
    return (
        <motion.div ref={ref} style={{ x, y }} className="magnetic-wrap">
            <motion.button className={className} {...props}>{children}</motion.button>
        </motion.div>
    );
};

const TiltCard = ({ children, className, ...props }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);
    const springX = useSpring(rotateX);
    const springY = useSpring(rotateY);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set(e.clientX - centerX);
        y.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            className={className}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX: springX, rotateY: springY, perspective: 1000 }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

const RevealText = ({ text, delay = 0 }) => {
    const words = text.split(' ');
    return (
        <span className="reveal-text">
            {words.map((word, i) => (
                <span key={i} style={{ display: 'inline-block', overflow: 'hidden', marginRight: '0.25em' }}>
                    <motion.span
                        className="reveal-word"
                        initial={{ y: '100%' }}
                        whileInView={{ y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: delay + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {word}
                    </motion.span>
                </span>
            ))}
        </span>
    );
};

// --- Animated Counter Hook ---
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

const MotionLayer = ({ children, speed = 0.1 }) => {
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 5000], [0, speed * 5000]);
    return <motion.div style={{ y }}>{children}</motion.div>;
};

const App = () => {
    const [data, setData] = useState(initialData);

    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('theme');
        return (saved === 'dark' || saved === 'light') ? saved : 'dark';
    });
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(window.location.pathname.includes('/admin'));
    const [passwordInput, setPasswordInput] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // 1. Fetch main portfolio data (profile)
            const { data: profileData, error: profileError } = await supabase
                .from('portfolio_data')
                .select('*')
                .single();

            if (profileError) throw profileError;

            // 2. Fetch experience
            const { data: expData, error: expError } = await supabase
                .from('experience')
                .select('*')
                .order('order_index', { ascending: true });

            if (expError) throw expError;

            // 3. Fetch certifications
            const { data: certData, error: certError } = await supabase
                .from('certifications')
                .select('*')
                .order('order_index', { ascending: true });

            if (certError) throw certError;

            // Map snake_case from DB to camelCase for frontend
            const mappedCertData = (certData || []).map(cert => ({
                ...cert,
                image: cert.image_url,
                issueDate: cert.issue_date,
                credentialId: cert.credential_id,
                credentialUrl: cert.credential_url
            }));

            // 4. Fetch skills
            const { data: skillsData, error: skillsError } = await supabase
                .from('skills')
                .select('*')
                .order('order_index', { ascending: true });

            if (skillsError) throw skillsError;

            // 5. Fetch custom projects
            const { data: projData, error: projError } = await supabase
                .from('projects')
                .select('*')
                .order('order_index', { ascending: true });

            if (projError) throw projError;

            // Reconstruct the skills object from the flat table
            const skillsMap = {};
            skillsData.forEach(s => {
                if (!skillsMap[s.category]) skillsMap[s.category] = [];
                skillsMap[s.category].push(s.skill_name);
            });

            // Update main state (Merge Supabase data with fallback settings if needed)
            setData(prev => ({
                settings: profileData?.settings || prev.settings,
                hero: profileData?.hero || prev.hero,
                about: profileData?.about || prev.about,
                contact: profileData?.contact || prev.contact,
                experience: expData?.length > 0 ? expData : prev.experience,
                certifications: mappedCertData?.length > 0 ? mappedCertData : prev.certifications,
                projects: projData?.length > 0 ? projData : prev.projects,
                skills: Object.keys(skillsMap).length > 0 ? skillsMap : prev.skills
            }));

        } catch (error) {
            console.error('Supabase Sync Error:', error.message);
            // Fallback: Use what we have in state (from initialData or localStorage)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Removed localStorage.setItem('portfolio_data', ...) effect

    // Preloader
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        let lastScroll = 0;
        const handleScroll = () => {
            const now = Date.now();
            if (now - lastScroll < 50) return; // Throttle to ~20fps
            lastScroll = now;

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

    useEffect(() => {
        const handleMouseMove = (e) => {
            document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
            document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
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
            {/* Immersive Foundations */}
            <div className="vignette" />
            <CustomCursor />
            {/* Removed duplicated ScrollProgress */}
            
            <AnimatePresence>
                {loading && (
                    <motion.div
                        className="preloader"
                        exit={{ 
                            clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
                            transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } 
                        }}
                    >
                        <motion.div 
                            className="loader-content"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="loader-logo">{data.settings?.logoText || 'Saketh'}</div>
                            <div className="loader-progress">
                                <motion.div 
                                    className="loader-bar"
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="portfolio-app">
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                    <Suspense fallback={<div className="absolute inset-0 bg-hero-bg" />}>
                        <MemoizedSpline />
                    </Suspense>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/20" />
                </div>
                <div className="hero-spotlight"></div>
                <ScrollProgress />
                {data?.settings?.navLinks && <SideNav navLinks={data.settings.navLinks} activeSection={activeSection} />}

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
                    <Section id="home"><Hero data={data.hero} /></Section>
                    <Section id="about"><About data={data.about} settings={data.settings} /></Section>
                    <Section id="skills"><Skills data={data.skills} settings={data.settings} /></Section>
                    <Section id="projects"><Projects settings={data.settings} customProjects={data.projects} /></Section>
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
        initial={{ opacity: 0, y: 60, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    >
        <div className="parallax-bg" />
        {children}
    </motion.section>
);



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
                    <MagneticButton className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                        <i className={`fas fa-${theme === 'dark' ? 'moon' : 'sun'}`}></i>
                    </MagneticButton>
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
const Hero = ({ data }) => {
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
            {/* Decorative Elements */}
            <div className="hero-decoration-1"></div>
            <div className="hero-decoration-2"></div>
            
            <motion.div 
                className="hero-text"
                animate={{
                    y: [0, -8, 0],
                    transition: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                }}
            >
                <motion.div 
                    className="hero-badge"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                >
                    <span className="badge-dot"></span>{data.badgeText}
                </motion.div>
                <h1 className="hero-name">
                    <RevealText text={data.greeting} delay={1.4} />
                    <span className="hero-name-typing gradient-text" style={{ display: 'block' }}>
                        {text}<span className="typing-cursor"></span>
                    </span>
                </h1>
                <motion.p 
                    className="hero-role"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                >
                    <span className="role-icon">⚡</span>{data.role}
                </motion.p>
                <motion.p 
                    className="hero-desc"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.2 }}
                >
                    {data.description}
                </motion.p>
                <div className="hero-cta">
                    {data.buttons?.map((b, i) => (
                        <MagneticButton
                            key={b.text}
                            className={`btn btn-${b.type}`}
                            onClick={(e) => {
                                if (b.href.startsWith('#')) {
                                    e.preventDefault();
                                    document.querySelector(b.href)?.scrollIntoView({ behavior: 'smooth' });
                                } else {
                                    window.open(b.href, '_blank');
                                }
                            }}
                        >
                            <span>{b.text}</span><i className={b.icon}></i>
                        </MagneticButton>
                    ))}
                    {data.resumeUrl && (
                        <MagneticButton
                            className="btn btn-outline"
                            onClick={() => window.open(data.resumeUrl, '_blank')}
                        >
                            <span>Resume</span><i className="fas fa-download"></i>
                        </MagneticButton>
                    )}
                </div>
                <div className="hero-socials">
                    {data.socialLinks?.map(s => (
                        <motion.a 
                            key={s.label} 
                            href={s.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            aria-label={s.label}
                            whileHover={{ y: -5, color: '#fff' }}
                        >
                            <i className={s.icon}></i>
                        </motion.a>
                    ))}
                </div>
            </motion.div>
            <div className="hero-visual">
                <motion.div
                    className="hero-avatar-wrap"
                    animate={{
                        y: [0, -15, 0],
                        transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                    }}
                >
                    <div className="hero-avatar">
                        <div className="avatar-glow"></div>
                        <div className="avatar-circle-decoration">
                            <svg viewBox="0 0 100 100">
                                <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                                <text>
                                    <textPath xlinkHref="#circlePath">
                                        EVERY AMBITION REQUIRES PREPARATION &bull; EVERY AMBITION REQUIRES PREPARATION &bull;
                                    </textPath>
                                </text>
                            </svg>
                        </div>
                        {data.avatarImage ? (
                            <img src={data.avatarImage} alt="Profile" className="avatar-image" />
                        ) : (
                            <div className="avatar-placeholder"><i className="fas fa-user"></i></div>
                        )}
                    </div>
                </motion.div>
            </div>
            {/* Scroll Indicator */}
            <motion.div 
                className="scroll-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
            >
                <div className="scroll-mouse"><div className="scroll-wheel"></div></div>
                <span>Scroll to explore</span>
            </motion.div>
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
        'linear-gradient(135deg, hsl(var(--primary) / 0.4), #030712)',
        'linear-gradient(135deg, #030712, hsl(var(--primary) / 0.4))',
        'linear-gradient(135deg, hsl(var(--primary) / 0.3), #0f172a)',
        'linear-gradient(135deg, #0f172a, hsl(var(--primary) / 0.3))',
    ];

    return (
        <div className="container">
            <h2 className="section-heading">
                <span className="heading-num">02.</span>
                <RevealText text={settings.sectionTitles?.skills || ''} />
                <span className="heading-line"></span>
            </h2>
            <div className="skills-grid">
                {Object.entries(data).map(([cat, skills], i) => (
                    <TiltCard
                        key={cat}
                        className="skill-card glass-card"
                        style={{ '--skill-gradient': gradients[i % gradients.length] }}
                    >
                        <div className="skill-card-header">
                            <div className="skill-icon-wrap"><i className={`fas ${getIcon(cat)}`}></i></div>
                            <h3>{cat}</h3>
                        </div>
                        <div className="skill-tags">
                            {Array.from(new Set(skills)).map((s, j) => (
                                <motion.span
                                    key={`${s}-${j}`}
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
                    </TiltCard>
                ))}
            </div>
        </div>
    );
};

// --- Projects (GitHub API + Supabase) ---
const Projects = ({ settings, customProjects = [] }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRepos = async () => {
            try {
                const res = await fetch(`https://api.github.com/users/${settings.githubUsername || 'gsaketh2006'}/repos?sort=updated&per_page=100`);
                const repos = await res.json();
                
                const githubProjects = repos.filter(r => !r.fork).map(r => ({
                    name: r.name,
                    description: r.description,
                    url: r.html_url,
                    homepage: r.homepage,
                    stars: r.stargazers_count,
                    language: r.language,
                    topics: r.topics || [],
                    isGitHub: true
                }));

                // 1. Filter out hidden manual projects
                const filteredCustom = customProjects
                    .filter(p => p.source === 'manual')
                    .filter(p => p.is_visible !== false)
                    .map(p => ({ ...p, isGitHub: false, topics: p.topics || [] }));

                // 2. Filter out hidden GitHub projects based on Supabase overrides
                const filteredGithub = githubProjects.filter(repo => {
                    const override = customProjects.find(p => p.name === repo.name && p.source === 'github');
                    return !override || override.is_visible !== false;
                }).map(p => ({ ...p, isGitHub: true }));

                // 3. Merge both
                const merged = [...filteredCustom, ...filteredGithub];
                
                setProjects(merged);
            } catch (e) { 
                console.error(e);
                setProjects(customProjects.filter(p => p.is_visible !== false).map(p => ({ ...p, isGitHub: false, topics: p.topics || [] })));
            }
            setLoading(false);
        };
        fetchRepos();
    }, [settings.githubUsername, customProjects]);

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
            <h2 className="section-heading">
                <span className="heading-num">03.</span>
                <RevealText text={settings.sectionTitles?.projects || ''} />
                <span className="heading-line"></span>
            </h2>
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
                            onClick={() => window.open(p.url, '_blank')}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.05 }}
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
                                            href={p.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="project-action-btn secondary"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <i className="fab fa-github"></i> github
                                        </a>
                                    </div>
                                </div>
                                <div className="project-bar-expandable">
                                    {p.description && <p>{p.description}</p>}
                                    {p.topics.length > 0 && (
                                        <div className="project-bar-topics">{p.topics.map(t => <span key={t} className="project-topic-tag">{t}</span>)}</div>
                                    )}
                                </div>
                            </div>
                            <div className="project-hover-glow" />
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
            <h2 className="section-heading">
                <span className="heading-num">04.</span>
                <RevealText text={settings.sectionTitles?.experience || ''} />
                <span className="heading-line"></span>
            </h2>
            <div className="timeline">
                {data.map((exp, i) => (
                    <motion.div
                        key={i}
                        className="timeline-item"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
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
            <h2 className="section-heading">
                <span className="heading-num">05.</span>
                <RevealText text={settings.sectionTitles?.certifications || ''} />
                <span className="heading-line"></span>
            </h2>
            <div className="certs-grid">
                {data.map((cert, i) => (
                    <TiltCard
                        key={i}
                        className="cert-card glass-card"
                        onClick={() => window.open(cert.credentialUrl, '_blank')}
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
                    </TiltCard>
                ))}
            </div>
        </div>
    );
};

// --- Cert Image with fallback ---
const CertImage = ({ src, alt, color }) => {
    const [error, setError] = useState(false);
    
    // Reset error state when src changes
    useEffect(() => {
        setError(false);
    }, [src]);

    if (error || !src) {
        return (
            <div className="cert-image-fallback" style={{ background: `linear-gradient(135deg, ${color || 'var(--lavender)'}, ${color || 'var(--sky)'}40)` }}>
                <i className="fas fa-certificate"></i>
                <span style={{ fontSize: '0.8rem', marginTop: '8px', opacity: 0.8 }}>{alt}</span>
            </div>
        );
    }

    return (
        <img 
            src={src} 
            alt={alt} 
            loading="lazy" 
            onError={() => {
                console.warn(`Failed to load certification image: ${src}`);
                setError(true);
            }} 
        />
    );
};

// --- Contact ---
const Contact = ({ data, settings }) => {
    if (!data) return null;
    return (
        <div className="container">
            <h2 className="section-heading">
                <span className="heading-num">06.</span>
                <RevealText text={settings.sectionTitles?.contact || ''} />
                <span className="heading-line"></span>
            </h2>
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
        <MotionLayer speed={-0.05}>
            <div className="footer-bg-glow" />
        </MotionLayer>
        <div className="container">
            <div className="footer-content">
                <motion.div 
                    className="footer-brand"
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 20 }}
                    viewport={{ once: true }}
                >
                    <div className="footer-logo"><i className="fas fa-terminal"></i> {settings.logoText || 'Saketh'}</div>
                    <p className="footer-tagline">Building intelligent systems that solve real-world problems.</p>
                    <div className="footer-cta-motion">
                        <MagneticButton className="btn btn-primary" onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}>
                            Start a Project
                        </MagneticButton>
                    </div>
                </motion.div>
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
                            <motion.a 
                                key={s.platform} 
                                href={s.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                aria-label={s.platform}
                                whileHover={{ scale: 1.2, rotate: 5 }}
                            >
                                <i className={s.icon}></i>
                            </motion.a>
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

const MemoizedSpline = React.memo(() => (
    <Spline
        scene="https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode"
        className="w-full h-full"
        style={{ filter: 'hue-rotate(180deg) brightness(0.8)' }}
    />
));

export default App;
