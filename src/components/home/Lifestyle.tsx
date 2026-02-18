import Link from 'next/link';
import styles from './Lifestyle.module.css';

const articles = [
    { title: 'Top Interior Trends for Modern Homes', category: 'Trends', date: 'Feb 10, 2026' },
    { title: 'How to Style a Luxury Minimal Space', category: 'Styling', date: 'Feb 05, 2026' },
    { title: 'Art Pieces That Transform Interiors', category: 'Art', date: 'Jan 28, 2026' }
];

export default function Lifestyle() {
    return (
        <section className={styles.section} id="lifestyle">
            <div className={styles.container}>
                <h2 className={styles.heading}>Lifestyle & Design Journal</h2>
                <div className={styles.grid}>
                    {articles.map((article, index) => (
                        <Link key={index} href={`/blog/${index}`} className={styles.card}>
                            <div className={styles.imagePlaceholder} />
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
