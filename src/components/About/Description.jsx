import React from 'react';
import { motion } from 'framer-motion';

const Description = ({ title, description }) => {
    return (
        <motion.div
            className="about-card about-description-card glass-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
        >
            <div className="about-icon-badge">
                <i className="fas fa-user-astronaut"></i>
            </div>
            
            <div className="about-header">
                <span className="about-subtitle">The Story</span>
                <h3 className="about-title">{title}</h3>
            </div>
            
            <p className="about-text">
                {description}
            </p>

            <div className="about-tags">
                <span className="about-tag">AI & Machine Learning</span>
                <span className="about-tag">Computer Vision</span>
                <span className="about-tag">Full-Stack Development</span>
            </div>
        </motion.div>
    );
};

export default React.memo(Description);
