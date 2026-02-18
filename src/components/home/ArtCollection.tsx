import styles from './ArtCollection.module.css';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';

export default function ArtCollection() {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <Reveal>
                        <h2 className={styles.heading}>Where Art Meets Interior Architecture</h2>
                        <p className={styles.text}>
                            “We believe art is the soul of every interior. Our curated pieces bring depth, texture, and meaning into each space, transforming a room into an artistic experience.”
                        </p>
                    </Reveal>
                    <Reveal delay={200}>
                        <Button href="/shop" variant="primary">Explore Art Collection</Button>
                    </Reveal>
                </div>
                <Reveal delay={400} className={styles.imageWrapper}>
                    <div
                        className={styles.image}
                        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1200)' }}
                    />
                </Reveal>
            </div>
        </section>
    );
}
