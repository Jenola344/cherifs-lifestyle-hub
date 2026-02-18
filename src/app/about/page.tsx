import About from '@/components/home/About';
import Services from '@/components/home/Services';
import styles from './AboutPage.module.css';
import Reveal from '@/components/ui/Reveal';

export default function AboutPage() {
    return (
        <main className={styles.main}>
            <header className={styles.hero}>
                <Reveal>
                    <h1 className={styles.title}>The Vision Behind the Hub</h1>
                    <p className={styles.subtitle}>Where interior architecture meets curated art.</p>
                </Reveal>
            </header>

            <About />

            <section className={styles.philosophy}>
                <div className={styles.container}>
                    <div className={styles.phiGrid}>
                        <Reveal className={styles.phiContent}>
                            <span className={styles.label}>Our Philosophy</span>
                            <h2>Timeless Luxury, Personal Connection</h2>
                            <p>
                                We believe that luxury is not about excess, but about the quality of the soul within a space. Every piece of art we curate and every room we design is a chapter in a larger story—your story.
                            </p>
                            <p>
                                Our process is collaborative and deeply personal. We don’t just fill rooms; we compose environments that resonate with the people who inhabit them.
                            </p>
                        </Reveal>
                        <Reveal delay={200} className={styles.phiImage}>
                            <div style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200)' }} />
                        </Reveal>
                    </div>
                </div>
            </section>

            <Services />

            <section className={styles.cta}>
                <Reveal>
                    <h2>Ready to transform your space?</h2>
                    <p>Book a consultation with our design concierge today.</p>
                    <div className={styles.btnGroup}>
                        <a href={process.env.NEXT_PUBLIC_CALENDLY_LINK || "https://calendly.com/cheriflifestyle1/30min"} target="_blank" className={styles.primaryBtn}>Book 30min Discovery Call</a>
                    </div>
                </Reveal>
            </section>
        </main>
    );
}
