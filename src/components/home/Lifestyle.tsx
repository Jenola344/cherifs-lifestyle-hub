'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Lifestyle.module.css';

export default function Lifestyle() {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/blog')
            .then(res => res.json())
            .then(data => {
                setArticles(data.slice(0, 3)); // Show top 3
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return null;

    return (
        <section className={styles.section} id="lifestyle">
            <div className={styles.container}>
                <h2 className={styles.heading}>Lifestyle & Design Journal</h2>
                <div className={styles.grid}>
                    {articles.map((article, index) => (
                        <Link key={article.id} href={`/blog/${article.id}`} className={styles.card}>
                            <div
                                className={styles.image}
                                style={{ backgroundImage: `url(${article.image})` }}
                            />
                            <div className={styles.content}>
                                <span className={styles.meta}>{article.category} • {article.date}</span>
                                <h3 className={styles.cardTitle}>{article.title}</h3>
                                <span className={styles.readMore}>Read Article</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
