import styles from './Hero.module.css';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.overlay} />
            <div className={styles.content}>
                <Reveal>
                    <span className={styles.subtitle}>Art & Interior Design</span>
                </Reveal>
                <Reveal delay={200}>
                    <h1 className={styles.title}>Cherif’s Lifestyle Hub</h1>
                </Reveal>
                <Reveal delay={400}>
                    <p className={styles.tagline}>
                        “Curating timeless interiors, artistic living, and elegant lifestyle spaces.”
                    </p>
                </Reveal>
                <Reveal delay={600}>
                    <div className={styles.actions}>
                        <Button href="/shop" variant="primary">
                            Explore Portfolio
                        </Button>
                        <Button href={process.env.NEXT_PUBLIC_CALENDLY_LINK || "#"} variant="outline" external>
                            Book a Consultation
                        </Button>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
