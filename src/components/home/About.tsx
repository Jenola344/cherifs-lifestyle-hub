import styles from './About.module.css';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';

export default function About() {
    return (
        <section className={styles.section} id="about">
            <div className={styles.container}>
                <Reveal className={styles.imageWrapper}>
                    <div
                        className={styles.image}
                        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200)' }}
                    />
                </Reveal>
                <div className={styles.content}>
                    <Reveal>
                        <span className={styles.tag}>About the Studio</span>
                        <h2 className={styles.heading}>Designing Spaces with Artistic Identity</h2>
                    </Reveal>
                    <Reveal delay={200}>
                        <p className={styles.text}>
                            At Cherif’s Lifestyle Hub, we believe that a home is more than just a physical space—it is a sanctuary of self-expression. Founded on the principles of luxury minimalism and artistic storytelling, our studio blends contemporary interior architecture with hand-curated art collections.
                        </p>
                        <p className={styles.text}>
                            Our mission is to create timeless, personal, and inspiring environments that reflect the unique lifestyle of our clients. From high-end residential styling to bespoke art curation, we handle every detail with meticulous care and an eye for artistic brilliance.
                        </p>
                    </Reveal>
                    <Reveal delay={400}>
                        <div className={styles.stats}>
                            <div className={styles.statItem}>
                                <span className={styles.statNum}>10+</span>
                                <span className={styles.statLabel}>Years of Design</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statNum}>200+</span>
                                <span className={styles.statLabel}>Curated Spaces</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statNum}>50+</span>
                                <span className={styles.statLabel}>Artist Partners</span>
                            </div>
                        </div>
                    </Reveal>

                </div>
            </div>
        </section>
    );
}
