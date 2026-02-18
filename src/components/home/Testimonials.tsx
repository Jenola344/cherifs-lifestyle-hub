import { Star } from 'lucide-react';
import styles from './Testimonials.module.css';

const testimonials = [
    { text: '“Cherif transformed our space into a timeless masterpiece.”', author: 'Sarah J.' },
    { text: '“Every detail was curated with elegance and artistic vision.”', author: 'Michael R.' },
    { text: '“A perfect blend of luxury, comfort, and modern design.”', author: 'Elena D.' }
];

export default function Testimonials() {
    return (
        <section className={styles.section} id="testimonials">
            <div className={styles.container}>
                <h2 className={styles.heading}>Client Experiences</h2>
                <div className={styles.grid}>
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.stars}>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill="#111" stroke="#111" />
                                ))}
                            </div>
                            <p className={styles.text}>{testimonial.text}</p>
                            <span className={styles.author}>— {testimonial.author}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
