import { useState } from 'react';
import AdminAboutPanel from './components/AdminAboutPanel';
import { supabase } from './lib/supabase';
import { seedSupabase } from './seedSupabase';

const Admin = ({ data, onSave, onExit }) => {
    const [activeTab, setActiveTab] = useState('settings');
    const [editedData, setEditedData] = useState(data);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [saveFlash, setSaveFlash] = useState(false);

    // --- Core Data Handlers ---
    const handleUpdate = (section, field, value) => {
        setEditedData(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    const handleDeepUpdate = (section, subSection, field, value) => {
        setEditedData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [subSection]: { ...prev[section][subSection], [field]: value }
            }
        }));
    };

    const handleArrayUpdate = (section, index, field, value) => {
        const newArray = [...editedData[section]];
        newArray[index] = { ...newArray[index], [field]: value };
        setEditedData(prev => ({ ...prev, [section]: newArray }));
    };

    const handleNestedArrayUpdate = (section, subSection, index, field, value) => {
        const newArray = [...editedData[section][subSection]];
        newArray[index] = { ...newArray[index], [field]: value };
        setEditedData(prev => ({
            ...prev,
            [section]: { ...prev[section], [subSection]: newArray }
        }));
    };

    const handleAddItem = (section, template) => {
        setEditedData(prev => ({
            ...prev,
            [section]: [...(prev[section] || []), template]
        }));
    };

    const handleDeleteItem = (section, index) => {
        const newArray = editedData[section].filter((_, i) => i !== index);
        setEditedData(prev => ({ ...prev, [section]: newArray }));
    };

    const handleNestedAddItem = (section, subSection, template) => {
        setEditedData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [subSection]: [...(prev[section][subSection] || []), template]
            }
        }));
    };

    const handleNestedDeleteItem = (section, subSection, index) => {
        setEditedData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [subSection]: prev[section][subSection].filter((_, i) => i !== index)
            }
        }));
    };

    // --- Skills Handlers ---
    const handleAddSkillCategory = () => {
        const name = prompt('Enter new category name:');
        if (name && name.trim()) {
            setEditedData(prev => ({
                ...prev,
                skills: { ...prev.skills, [name.trim()]: [] }
            }));
        }
    };

    const handleDeleteSkillCategory = (category) => {
        if (!window.confirm(`Delete category "${category}" and all its skills?`)) return;
        setEditedData(prev => {
            const newSkills = { ...prev.skills };
            delete newSkills[category];
            return { ...prev, skills: newSkills };
        });
    };

    const handleRenameSkillCategory = (oldName, newName) => {
        if (!newName.trim() || newName === oldName) return;
        setEditedData(prev => {
            const newSkills = {};
            Object.entries(prev.skills).forEach(([key, val]) => {
                newSkills[key === oldName ? newName.trim() : key] = val;
            });
            return { ...prev, skills: newSkills };
        });
    };

    const handleAddSkill = (category) => {
        const skill = prompt(`Add skill to "${category}":`);
        if (skill && skill.trim()) {
            setEditedData(prev => ({
                ...prev,
                skills: {
                    ...prev.skills,
                    [category]: [...prev.skills[category], skill.trim()]
                }
            }));
        }
    };

    const handleDeleteSkill = (category, index) => {
        setEditedData(prev => ({
            ...prev,
            skills: {
                ...prev.skills,
                [category]: prev.skills[category].filter((_, i) => i !== index)
            }
        }));
    };

    // --- Image Upload (Supabase Storage) ---
    const uploadToStorage = async (file, path) => {
        const { data, error } = await supabase.storage
            .from('portfolio-assets')
            .upload(`${path}/${Date.now()}-${file.name}`, file);
        
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
            .from('portfolio-assets')
            .getPublicUrl(data.path);
            
        return publicUrl;
    };

    const handleImageUpload = async (index, file) => {
        if (!file) return;
        try {
            const publicUrl = await uploadToStorage(file, 'certificates');
            handleArrayUpdate('certifications', index, 'image', publicUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image to Supabase Storage.');
        }
    };

    const handleHeroImageUpload = async (file) => {
        if (!file) return;
        try {
            const publicUrl = await uploadToStorage(file, 'avatar');
            handleUpdate('hero', 'avatarImage', publicUrl);
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Failed to upload avatar to Supabase Storage.');
        }
    };

    // --- Save (Supabase Persistent Persistence) ---
    const saveChanges = async () => {
        try {
            setSaveFlash(false);
            
            // 1. Sync portfolio_data (Profile)
            const { error: profileError } = await supabase
                .from('portfolio_data')
                .upsert({
                    id: '00000000-0000-0000-0000-000000000000',
                    settings: editedData.settings,
                    hero: editedData.hero,
                    about: editedData.about,
                    contact: editedData.contact,
                    updated_at: new Date()
                });
            if (profileError) throw profileError;

            // 2. Sync Experience (Delete and Re-insert for simplicity and ordering)
            await supabase.from('experience').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
            const { error: expError } = await supabase
                .from('experience')
                .insert(editedData.experience.map((exp, i) => ({
                    ...exp,
                    order_index: i
                })));
            if (expError) throw expError;

            // 3. Sync Certifications
            await supabase.from('certifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            const { error: certError } = await supabase
                .from('certifications')
                .insert(editedData.certifications.map((cert, i) => ({
                    title: cert.title || '',
                    organization: cert.organization || '',
                    image_url: cert.image || '',
                    issue_date: cert.issueDate || '',
                    credential_id: cert.credentialId || '',
                    credential_url: cert.credentialUrl || '',
                    color: cert.color || '#FF6A3D',
                    order_index: i
                })));
            if (certError) throw certError;

            // 4. Sync Projects
            await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (editedData.projects?.length > 0) {
                const { error: projError } = await supabase
                    .from('projects')
                    .insert(editedData.projects.map((p, i) => ({ 
                        name: p.name || '',
                        description: p.description || '',
                        url: p.url || '',
                        language: p.language || '',
                        image_url: p.image_url || '',
                        order_index: i 
                    })));
                if (projError) throw projError;
            }

            // 5. Sync Skills
            await supabase.from('skills').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            const flatSkills = [];
            Object.entries(editedData.skills).forEach(([category, skills], catIdx) => {
                skills.forEach((skill, skillIdx) => {
                    flatSkills.push({
                        category,
                        skill_name: skill,
                        order_index: (catIdx * 100) + skillIdx
                    });
                });
            });
            if (flatSkills.length > 0) {
                const { error: skillsError } = await supabase
                    .from('skills')
                    .insert(flatSkills);
                if (skillsError) throw skillsError;
            }

            onSave(editedData); // Update parent state locally
            setSaveFlash(true);
            setTimeout(() => setSaveFlash(false), 3000);
        } catch (error) {
            console.error('Error saving to Supabase:', error);
            alert('Error saving changes. Check console for details.');
        }
    };

    const tabs = [
        { id: 'settings', label: 'Settings', icon: 'fa-cog' },
        { id: 'hero', label: 'Hero', icon: 'fa-rocket' },
        { id: 'about', label: 'About', icon: 'fa-user' },
        { id: 'skills', label: 'Skills', icon: 'fa-code' },
        { id: 'projects', label: 'Projects', icon: 'fa-code-branch' },
        { id: 'experience', label: 'Experience', icon: 'fa-briefcase' },
        { id: 'certifications', label: 'Certifications', icon: 'fas fa-certificate' },
        { id: 'contact', label: 'Contact', icon: 'fas fa-envelope' },
        { id: 'footer', label: 'Footer', icon: 'fas fa-shoe-prints' }
    ];

    return (
        <div className="admin-dashboard">
            {/* Save Flash Notification */}
            <div className={`save-toast ${saveFlash ? 'visible' : ''}`}>
                <i className="fas fa-check-circle"></i> Changes saved & synced!
            </div>

            {/* Mobile Overlay */}
            {isMobileNavOpen && <div className="admin-overlay" onClick={() => setIsMobileNavOpen(false)}></div>}

            <header className="admin-header">
                <div className="admin-header-left">
                    <button className="admin-menu-btn" onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}>
                        <i className={`fas ${isMobileNavOpen ? 'fa-times' : 'fa-bars'}`}></i>
                    </button>
                    <div className="admin-title">
                        <h1>Admin Panel</h1>
                        <p>{editedData.settings?.siteName || 'Portfolio'}</p>
                    </div>
                </div>
                <div className="admin-controls">
                    <button className="btn btn-primary btn-save" onClick={saveChanges}>
                        <i className="fas fa-save"></i> <span className="btn-text">Save All</span>
                    </button>
                    <button className="btn btn-outline btn-exit" onClick={onExit}>
                        <i className="fas fa-sign-out-alt"></i> <span className="btn-text">Exit</span>
                    </button>
                </div>
            </header>

            <div className="admin-layout">
                <aside className={`admin-sidebar ${isMobileNavOpen ? 'open' : ''}`}>
                    <div className="sidebar-label">Navigation</div>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`admin-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(tab.id);
                                setIsMobileNavOpen(false);
                            }}
                        >
                            <i className={`fas ${tab.icon}`}></i>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </aside>

                <main className="admin-content">
                    {/* === SETTINGS === */}
                    {activeTab === 'settings' && editedData.settings && (
                        <div className="admin-section">
                            <h3><i className="fas fa-cog"></i> General Settings</h3>
                            <div className="form-grid">
                                <div className="form-group"><label>Logo Text</label><input type="text" value={editedData.settings.logoText} onChange={e => handleUpdate('settings', 'logoText', e.target.value)} /></div>
                                <div className="form-group"><label>Site Title</label><input type="text" value={editedData.settings.siteTitle} onChange={e => handleUpdate('settings', 'siteTitle', e.target.value)} /></div>
                                <div className="form-group"><label>GitHub Username</label><input type="text" value={editedData.settings.githubUsername} onChange={e => handleUpdate('settings', 'githubUsername', e.target.value)} /></div>
                                <div className="form-group"><label>Footer Text</label><input type="text" value={editedData.settings.footer?.text || ''} onChange={e => handleDeepUpdate('settings', 'footer', 'text', e.target.value)} /></div>
                            </div>
                            <div className="admin-danger-zone" style={{ marginTop: '40px', padding: '20px', border: '1px solid #ff4d4d', borderRadius: '8px', background: 'rgba(255, 77, 77, 0.05)' }}>
                                <h4 style={{ color: '#ff4d4d', marginBottom: '10px' }}><i className="fas fa-exclamation-triangle"></i> Migration Tools</h4>
                                <p style={{ fontSize: '0.9rem', marginBottom: '15px', color: '#ccc' }}>Use this tool to migrate your local <code>initialData.js</code> content to the Supabase database. This will overwrite existing data!</p>
                                <button className="btn btn-outline" style={{ borderColor: '#ff4d4d', color: '#ff4d4d' }} onClick={seedSupabase}>
                                    <i className="fas fa-upload"></i> Seed Database from Local
                                </button>
                            </div>
                        </div>
                    )}

                    {/* === HERO === */}
                    {activeTab === 'hero' && editedData.hero && (
                        <div className="admin-section">
                            <h3><i className="fas fa-rocket"></i> Hero Section</h3>
                            
                            <div className="form-group" style={{ marginBottom: '25px' }}>
                                <label>Profile Picture (Avatar)</label>
                                {editedData.hero.avatarImage && (
                                    <div style={{ marginBottom: '10px' }}>
                                        <img src={editedData.hero.avatarImage} alt="Hero Avatar Preview" className="image-preview-admin" style={{ maxWidth: '150px', borderRadius: '50%' }} />
                                    </div>
                                )}
                                <div className="file-upload-wrapper">
                                    <input type="file" id="hero-img-upload" hidden accept="image/*" onChange={e => handleHeroImageUpload(e.target.files[0])} />
                                    <label htmlFor="hero-img-upload" className="btn btn-outline file-upload-btn">
                                        <i className="fas fa-image"></i> Browse Image
                                    </label>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Greeting</label>
                                    <input type="text" value={editedData.hero.greeting} onChange={e => handleUpdate('hero', 'greeting', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Main Role</label>
                                    <input type="text" value={editedData.hero.role} onChange={e => handleUpdate('hero', 'role', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Badge Text</label>
                                    <input type="text" value={editedData.hero.badgeText || ''} onChange={e => handleUpdate('hero', 'badgeText', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Resume URL</label>
                                    <input type="text" value={editedData.hero.resumeUrl || ''} onChange={e => handleUpdate('hero', 'resumeUrl', e.target.value)} />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Typing Texts (Comma separated)</label>
                                    <input
                                        type="text"
                                        value={editedData.hero.typingTexts?.join(', ') || ''}
                                        onChange={e => handleUpdate('hero', 'typingTexts', e.target.value.split(',').map(s => s.trim()))}
                                    />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Description</label>
                                    <textarea value={editedData.hero.description} onChange={e => handleUpdate('hero', 'description', e.target.value)} />
                                </div>
                            </div>
                            
                            <h4 style={{ marginTop: '30px', marginBottom: '15px' }}>Action Buttons</h4>
                            <div className="admin-items-grid">
                                {editedData.hero.buttons?.map((btn, idx) => (
                                    <div key={idx} className="admin-item-card">
                                        <div className="card-header-admin">
                                            <input type="text" className="input-bold" value={btn.text} onChange={e => handleNestedArrayUpdate('hero', 'buttons', idx, 'text', e.target.value)} placeholder="Button Text" />
                                            <button className="btn-delete" onClick={() => handleNestedDeleteItem('hero', 'buttons', idx)}><i className="fas fa-trash"></i></button>
                                        </div>
                                        <div className="form-group">
                                            <label>Link / URL</label>
                                            <input type="text" value={btn.href} onChange={e => handleNestedArrayUpdate('hero', 'buttons', idx, 'href', e.target.value)} placeholder="#section or https://..." />
                                        </div>
                                        <div className="form-group">
                                            <label>Icon Class</label>
                                            <input type="text" value={btn.icon} onChange={e => handleNestedArrayUpdate('hero', 'buttons', idx, 'icon', e.target.value)} placeholder="fas fa-arrow-right" />
                                        </div>
                                        <div className="form-group">
                                            <label>Type</label>
                                            <select value={btn.type} onChange={e => handleNestedArrayUpdate('hero', 'buttons', idx, 'type', e.target.value)} style={{ width: '100%', padding: '10px', background: 'var(--bg-card)', color: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                                <option value="primary">Primary</option>
                                                <option value="outline">Outline</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-outline full-width" style={{ marginTop: '10px' }} onClick={() => handleNestedAddItem('hero', 'buttons', { text: 'New Button', href: '#', icon: 'fas fa-link', type: 'primary' })}>
                                <i className="fas fa-plus"></i> Add Button
                            </button>

                            <h4 style={{ marginTop: '30px', marginBottom: '15px' }}>Social Links</h4>
                            <div className="admin-items-grid">
                                {editedData.hero.socialLinks?.map((social, idx) => (
                                    <div key={idx} className="admin-item-card">
                                        <div className="card-header-admin">
                                            <input type="text" className="input-bold" value={social.label} onChange={e => handleNestedArrayUpdate('hero', 'socialLinks', idx, 'label', e.target.value)} placeholder="Platform Label" />
                                            <button className="btn-delete" onClick={() => handleNestedDeleteItem('hero', 'socialLinks', idx)}><i className="fas fa-trash"></i></button>
                                        </div>
                                        <div className="form-group">
                                            <label>URL</label>
                                            <input type="text" value={social.url} onChange={e => handleNestedArrayUpdate('hero', 'socialLinks', idx, 'url', e.target.value)} placeholder="https://..." />
                                        </div>
                                        <div className="form-group">
                                            <label>Icon Class</label>
                                            <input type="text" value={social.icon} onChange={e => handleNestedArrayUpdate('hero', 'socialLinks', idx, 'icon', e.target.value)} placeholder="fab fa-github" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-outline full-width" style={{ marginTop: '10px' }} onClick={() => handleNestedAddItem('hero', 'socialLinks', { label: 'New Link', url: 'https://', icon: 'fas fa-link' })}>
                                <i className="fas fa-plus"></i> Add Social Link
                            </button>

                        </div>
                    )}

                    {/* === ABOUT === */}
                    {activeTab === 'about' && editedData.about && (
                        <AdminAboutPanel
                            data={editedData.about}
                            settings={editedData.settings}
                            onUpdate={handleUpdate}
                            onDeepUpdate={handleDeepUpdate}
                        />
                    )}

                    {/* === SKILLS (Category/Item Manager) === */}
                    {activeTab === 'skills' && editedData.skills && (
                        <div className="admin-section">
                            <h3><i className="fas fa-code"></i> Skills Management</h3>
                            <div className="skills-manager">
                                {Object.entries(editedData.skills).map(([category, skills]) => (
                                    <div key={category} className="skill-category-card">
                                        <div className="skill-category-header">
                                            <div className="skill-category-name">
                                                <i className="fas fa-folder-open"></i>
                                                <input
                                                    type="text"
                                                    className="input-bold"
                                                    value={category}
                                                    onChange={e => handleRenameSkillCategory(category, e.target.value)}
                                                    onBlur={e => handleRenameSkillCategory(category, e.target.value)}
                                                />
                                                <span className="skill-count">{skills.length}</span>
                                            </div>
                                            <div className="skill-category-actions">
                                                <button className="btn-icon btn-add-skill" onClick={() => handleAddSkill(category)} title="Add Skill">
                                                    <i className="fas fa-plus"></i>
                                                </button>
                                                <button className="btn-icon btn-delete-cat" onClick={() => handleDeleteSkillCategory(category)} title="Delete Category">
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="skill-items-list">
                                            {skills.map((skill, idx) => (
                                                <div key={idx} className="skill-item">
                                                    <span className="skill-item-dot"></span>
                                                    <span className="skill-item-text">{skill}</span>
                                                    <button className="btn-icon-sm" onClick={() => handleDeleteSkill(category, idx)} title="Remove">
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            ))}
                                            {skills.length === 0 && (
                                                <p className="empty-hint">No skills yet. Click + to add.</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-outline full-width" style={{ marginTop: '20px' }} onClick={handleAddSkillCategory}>
                                <i className="fas fa-plus"></i> Add Category
                            </button>
                        </div>
                    )}

                    {/* === PROJECTS === */}
                    {activeTab === 'projects' && (
                        <div className="admin-section">
                            <h3><i className="fas fa-code-branch"></i> Custom Projects</h3>
                            <p className="admin-hint">Manual projects will appear alongside your GitHub repositories.</p>
                            {editedData.projects?.map((proj, idx) => (
                                <div key={idx} className="admin-item-card">
                                    <div className="card-header-admin">
                                        <input type="text" className="input-bold" value={proj.name} onChange={e => handleArrayUpdate('projects', idx, 'name', e.target.value)} placeholder="Project Name" />
                                        <button className="btn-delete" onClick={() => handleDeleteItem('projects', idx)}><i className="fas fa-trash"></i></button>
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea value={proj.description} onChange={e => handleArrayUpdate('projects', idx, 'description', e.target.value)} />
                                    </div>
                                    <div className="form-grid">
                                        <div className="form-group"><label>URL</label><input type="text" value={proj.url} onChange={e => handleArrayUpdate('projects', idx, 'url', e.target.value)} /></div>
                                        <div className="form-group"><label>Language/Tech</label><input type="text" value={proj.language} onChange={e => handleArrayUpdate('projects', idx, 'language', e.target.value)} /></div>
                                    </div>
                                </div>
                            ))}
                            <button className="btn btn-outline full-width" onClick={() => handleAddItem('projects', { name: 'New Project', description: '', url: '#', language: 'React' })}>
                                <i className="fas fa-plus"></i> Add Custom Project
                            </button>
                        </div>
                    )}

                    {/* === EXPERIENCE === */}
                    {activeTab === 'experience' && editedData.experience && (
                        <div className="admin-section">
                            <h3><i className="fas fa-briefcase"></i> Work Experience</h3>
                            {editedData.experience.map((exp, idx) => (
                                <div key={idx} className="admin-item-card">
                                    <div className="card-header-admin">
                                        <input type="text" className="input-bold" value={exp.title} onChange={e => handleArrayUpdate('experience', idx, 'title', e.target.value)} />
                                        <button className="btn-delete" onClick={() => handleDeleteItem('experience', idx)}><i className="fas fa-trash"></i> <span className="btn-text">Delete</span></button>
                                    </div>
                                    <div className="form-grid">
                                        <div className="form-group"><label>Company</label><input type="text" value={exp.company} onChange={e => handleArrayUpdate('experience', idx, 'company', e.target.value)} /></div>
                                        <div className="form-group"><label>Date Range</label><input type="text" value={exp.date} onChange={e => handleArrayUpdate('experience', idx, 'date', e.target.value)} /></div>
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea value={exp.description} onChange={e => handleArrayUpdate('experience', idx, 'description', e.target.value)} />
                                    </div>
                                </div>
                            ))}
                            <button className="btn btn-outline full-width" onClick={() => handleAddItem('experience', { title: 'New Role', company: 'Company', date: 'Date', description: '', achievements: [] })}>
                                <i className="fas fa-plus"></i> Add Experience
                            </button>
                        </div>
                    )}

                    {/* === CERTIFICATIONS === */}
                    {activeTab === 'certifications' && editedData.certifications && (
                        <div className="admin-section">
                            <h3><i className="fas fa-certificate"></i> Certifications</h3>
                            <div className="admin-items-grid">
                                {editedData.certifications.map((cert, idx) => (
                                    <div key={idx} className="admin-item-card">
                                        <div className="card-header-admin">
                                            <input type="text" className="input-bold" value={cert.title} onChange={e => handleArrayUpdate('certifications', idx, 'title', e.target.value)} placeholder="Certification Title" />
                                            <button className="btn-delete" onClick={() => handleDeleteItem('certifications', idx)}><i className="fas fa-trash"></i></button>
                                        </div>
                                        <div className="form-group">
                                            <label>Organization</label>
                                            <input type="text" value={cert.organization} onChange={e => handleArrayUpdate('certifications', idx, 'organization', e.target.value)} placeholder="Organization" />
                                        </div>
                                        <div className="form-group">
                                            <label>Credential URL</label>
                                            <input type="text" value={cert.credentialUrl} onChange={e => handleArrayUpdate('certifications', idx, 'credentialUrl', e.target.value)} placeholder="https://..." />
                                        </div>
                                        <div className="form-group">
                                            <label>Certificate Image</label>
                                            {cert.image && <img src={cert.image} alt="Preview" className="image-preview-admin" />}
                                            <div className="file-upload-wrapper">
                                                <input type="file" id={`cert-img-${idx}`} hidden accept="image/*" onChange={e => handleImageUpload(idx, e.target.files[0])} />
                                                <label htmlFor={`cert-img-${idx}`} className="btn btn-outline file-upload-btn">
                                                    <i className="fas fa-image"></i> Browse Image
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-outline full-width" style={{ marginTop: '20px' }} onClick={() => handleAddItem('certifications', { title: 'New Certification', organization: 'Org', image: '', credentialUrl: '#' })}>
                                <i className="fas fa-plus"></i> Add Certification
                            </button>
                        </div>
                    )}

                    {/* === CONTACT === */}
                    {activeTab === 'contact' && editedData.contact && (
                        <div className="admin-section">
                            <h3><i className="fas fa-envelope"></i> Contact Info</h3>
                            <div className="form-group"><label>Heading</label><input type="text" value={editedData.contact.heading} onChange={e => handleUpdate('contact', 'heading', e.target.value)} /></div>
                            <div className="form-group"><label>Description</label><textarea value={editedData.contact.description} onChange={e => handleUpdate('contact', 'description', e.target.value)} /></div>
                            <div className="form-grid">
                                <div className="form-group"><label>Email</label><input type="text" value={editedData.contact.email?.value || ''} onChange={e => handleDeepUpdate('contact', 'email', 'value', e.target.value)} /></div>
                                <div className="form-group"><label>Phone</label><input type="text" value={editedData.contact.phone?.value || ''} onChange={e => handleDeepUpdate('contact', 'phone', 'value', e.target.value)} /></div>
                            </div>
                        </div>
                    )}

                    {/* === FOOTER === */}
                    {activeTab === 'footer' && editedData.settings?.footer && (
                        <div className="admin-section">
                            <h3><i className="fas fa-shoe-prints"></i> Footer Management</h3>
                            <div className="form-group">
                                <label>Footer Text</label>
                                <input
                                    type="text"
                                    value={editedData.settings.footer.text}
                                    onChange={e => {
                                        const newData = { ...editedData };
                                        newData.settings.footer.text = e.target.value;
                                        setEditedData(newData);
                                    }}
                                    placeholder="Designed & Built by..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Footer Year</label>
                                <input
                                    type="number"
                                    value={editedData.settings.footer.year}
                                    onChange={e => {
                                        const newData = { ...editedData };
                                        newData.settings.footer.year = parseInt(e.target.value) || new Date().getFullYear();
                                        setEditedData(newData);
                                    }}
                                    placeholder="2025"
                                />
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Admin;
