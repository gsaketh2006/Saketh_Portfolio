import React from 'react';
import { motion } from 'framer-motion';
import GithubContributionGrid from './GithubContributionGrid';
import LeetCodeContributionGrid from './LeetCodeContributionGrid';

const AboutSection = ({ data, settings }) => {
    if (!data) return null;

    return (
        <div className="container">
            <h2 className="section-heading">
                <span className="heading-num">01.</span>
                {settings.sectionTitles?.about || "About Me"}
                <span className="heading-line"></span>
            </h2>

            <div className="about-bento-grid">
                {/* Main Description Card - The "Heart" of the section */}
                <motion.div
                    className="bento-card bento-about-main glass-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                >
                    <div className="bento-accent-glow"></div>
                    <div className="bento-content-wrapper">
                        <div className="bento-icon-badge">
                            <i className="fas fa-user-astronaut"></i>
                        </div>
                        <div className="bento-header">
                            <span className="bento-subtitle">The Story</span>
                            <h3>{data.title}</h3>
                        </div>
                        <p className="bento-description">{data.description}</p>
                    </div>
                </motion.div>

                {/* Current Role Card - High-visibility "Credential" style */}
                <motion.div
                    className="bento-card bento-about-role glass-card"
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                >
                    <div className="bento-icon-badge role-icon">
                        <i className="fas fa-briefcase"></i>
                    </div>
                    <div className="bento-header">
                        <span className="bento-subtitle">Current Status</span>
                        <h3>Now Building</h3>
                    </div>
                    <div className="role-credential">
                        <div className="role-accent-line"></div>
                        <div className="role-main">
                            <h4>{data.currentRoleTitle}</h4>
                            <p>{data.currentRoleOrg}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Submissions/Activity Section - Full width side-by-side */}
                <motion.div
                    className="bento-submissions-container"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                >
                    <div className="grids-container side-by-side">
                        {data.showGithubGrid && (
                            <div className="grid-item">
                                <GithubContributionGrid
                                    username={settings.githubUsername}
                                />
                            </div>
                        )}

                        {data.showLeetcodeGrid && (
                            <div className="grid-item">
                                <LeetCodeContributionGrid
                                    username={settings.leetcodeUsername}
                                />
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AboutSection;
