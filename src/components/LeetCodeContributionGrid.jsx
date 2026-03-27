import React from 'react';
import { motion } from 'framer-motion';

const LeetCodeContributionGrid = ({ username }) => {
    if (!username) return null;

    // Using a reliable leetcode-stats-card API
    const chartUrl = `https://leetcode-stats-card.vercel.app/?username=${username}&theme=dark`;

    return (
        <motion.div
            className="leetcode-contribution-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <motion.a
                href={`https://leetcode.com/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="leetcode-grid-link glass-card"
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(255, 161, 22, 0.2)' }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="grid-header">
                    <i className="fas fa-code"></i>
                    <span>LeetCode Submissions</span>
                </div>
                <div className="grid-image-container">
                    <img
                        src={chartUrl}
                        alt={`${username}'s LeetCode stats`}
                        className="leetcode-grid-img"
                        loading="lazy"
                    />
                </div>
                <div className="grid-footer">
                    <span>Click to view profile</span>
                </div>
            </motion.a>
        </motion.div>
    );
};

export default LeetCodeContributionGrid;
