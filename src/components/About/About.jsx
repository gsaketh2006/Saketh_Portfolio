import React from 'react';
import './About.css';
import Description from './Description';
import GithubContributionGrid from '../GithubContributionGrid';
import LeetCodeContributionGrid from '../LeetCodeContributionGrid';

const About = ({ data, settings }) => {
    if (!data) return null;

    return (
        <section className="about-section" id="about-section">
            <div className="container" id="about-container">
                <h2 className="section-heading">
                    <span className="heading-num">01.</span>
                    {settings.sectionTitles?.about || "About Me"}
                    <span className="heading-line"></span>
                </h2>

                <div className="about-grid-wrapper">
                    {/* Part 1: Description */}
                    <div className="about-main-content">
                        <Description 
                            title={data.title} 
                            description={data.description} 
                        />
                    </div>

                    {/* Part 3: GitHub Contributors Section & Activity Grids */}
                    <div className="about-activity-content">
                        {data.showGithubGrid && (
                            <GithubContributionGrid
                                username={settings.githubUsername}
                            />
                        )}

                        {data.showLeetcodeGrid && (
                            <LeetCodeContributionGrid
                                username={settings.leetcodeUsername}
                            />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default React.memo(About);
