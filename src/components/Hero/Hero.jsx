"use client";

import React, { useMemo, useState } from "react";
import styles from "./Hero.module.css"
import Link from "next/link";

const Hero = ({ webinars }) => {
    const [searchText, setSearchText] = useState("");

    // Filter webinars by search text (case-insensitive)
    const filteredWebinars = useMemo(() => {
        if (!searchText) return webinars;

        const search = searchText.toLowerCase();

        return webinars.filter(w => {
            const titleMatch =
                w.title?.toLowerCase().includes(search);

            const providerMatch =
                w.provider?.toLowerCase().includes(search);

            const categoryMatch =
                Array.isArray(w.category) &&
                w.category.some(cat =>
                    cat.toLowerCase().includes(search)
                );

            return titleMatch || providerMatch || categoryMatch;
        });
    }, [searchText, webinars]);

    // Generate popular tags dynamically from filtered webinars
    const popularTags = useMemo(() => {
        // Flatten category arrays into single list
        const allCategories = filteredWebinars
            .flatMap(w => Array.isArray(w.category) ? w.category : [])
            .filter(Boolean);

        // Count usage of each category
        const tagCount = {};
        allCategories.forEach(cat => {
            tagCount[cat] = (tagCount[cat] || 0) + 1;
        });

        // Sort by most used
        const sortedTags = Object.keys(tagCount).sort(
            (a, b) => tagCount[b] - tagCount[a]
        );

        return sortedTags.slice(0, 4);
    }, [filteredWebinars]);

    return (
        <section className={styles.hero}>

            <div className="container">
                <div className={styles.heroeyebrow}>Global Education Hub</div>

                <h1>
                    Discover, Experience and Partner with 
                    <br />
                    Innovative <span className={styles.span}>Education Solutions</span>
                </h1>

                <p>Live webinars • <span className={styles.ptext}>Classroom-ready strategies</span></p>

                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="Search trainings by category...."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>

                <div className={styles.popularTags}>
                    {/* <span>NEP 2020</span>
                    <span>Formative Assessment</span>
                    <span>EdTech Integration</span>
                    <span>Differentiation</span> */}
                    {popularTags.map(tag => (
                        <Link
                            key={tag}
                            href={`/webinars?page=1&category=${encodeURIComponent(tag)}`}
                            className={styles.popularTagSpan} // style like a span
                        >
                            <span>{tag}</span>
                        </Link>))}
                </div>
            </div>
        </section>
    );
};

export default Hero;
