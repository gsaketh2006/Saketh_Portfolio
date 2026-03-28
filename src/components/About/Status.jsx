import React from 'react';
import { motion } from 'framer-motion';

const Status = ({ roleTitle, roleOrg }) => {
    return (
        <motion.div
            className="about-card about-status-card glass-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
        >
            <div className="about-icon-badge">
                <i className="fas fa-satellite-dish"></i>
                <div className="badge-glow"></div>
            </div>
            
            <div className="about-header">
                <span className="about-subtitle">Current Status</span>
                <h3 className="about-title">What I&apos;m Doing</h3>
            </div>
            
            <div className="status-list">
                {/* Current Status */}
                <div className="status-item">
                    <div className="status-indicator">
                        <div className="status-ping"></div>
                        <div className="status-dot"></div>
                    </div>
                    <div className="status-content">
                        <p>{roleTitle} @ {roleOrg}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default React.memo(Status);
