'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, User, Tag } from 'lucide-react';
import styles from './BlogPost.module.css';

export default function BlogPostPage() {
    const { id } = useParams();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        fetch('/api/blog')
            .then(res => res.json())
            .then(data => {
                const found = data.find((p: any) => p.id === id);
                setPost(found);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className={styles.loaderContainer}>
                <div className={styles.loader}>Loading Masterpiece...</div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className={styles.errorContainer}>
                <h1>Article Not Found</h1>
                <p>The journal entry you are looking for has been moved or curated elsewhere.</p>
                <Link href="/" className={styles.backLink}>Return to Hub</Link>
            </div>
        );
    }

    return (
        <main className={styles.main}>
            <div className={styles.header} style={{ backgroundImage: `url(${post.image})` }}>
                <div className={styles.overlay} />
                <div className={styles.headerContent}>
                    <Link href="/" className={styles.backBtn}>
                        <ArrowLeft size={18} /> Back to Hub
                    </Link>
                    <span className={styles.category}>{post.category}</span>
                    <h1 className={styles.title}>{post.title}</h1>
                    <div className={styles.meta}>
                        <div className={styles.metaItem}><User size={16} /> {post.author}</div>
                        <div className={styles.metaItem}><Clock size={16} /> {post.date}</div>
                    </div>
                </div>
            </div>

            <article className={styles.content}>
                <div className={styles.container}>
                    <p className={styles.excerpt}>{post.excerpt}</p>
                    <div className={styles.body}>
                        {post.content.split('\n').map((para: string, i: number) => (
                            para.trim() && <p key={i}>{para}</p>
                        ))}
                    </div>
                </div>
            </article>

            <section className={styles.footer}>
                <div className={styles.container}>
                    <div className={styles.shareBox}>
                        <h3>Share this Insight</h3>
                        <p>Spread the philosophy of elegant living.</p>
                    </div>
                </div>
            </section>
        </main>
    );
}
