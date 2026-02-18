import { PenTool, Palette, Lightbulb } from 'lucide-react';
import styles from './Services.module.css';
import Reveal from '../ui/Reveal';

const services = [
    {
        icon: <PenTool size={40} className={styles.icon} />,
        title: 'Interior Design & Styling',
        desc: 'Luxury residential and commercial design concepts tailored to your personal aesthetic.'
    },
    {
        icon: <Palette size={40} className={styles.icon} />,
        title: 'Art & Decor Curation',
        desc: 'Hand-selected pieces that elevate every space with meaning and texture.'
    },
    {
        icon: <Lightbulb size={40} className={styles.icon} />,
        title: 'Lifestyle Design Consulting',
        desc: 'Designing environments that reflect modern living and enhance daily rituals.'
    }
];

export default function Services() {
    return (
        <section className={styles.section} id="services">
            <div className={styles.container}>
                <Reveal>
                    <div className={styles.header}>
                        <span className={styles.subtitle}>Our Expertise</span>
                        <h2 className={styles.heading}>What We Do</h2>
                    </div>
                </Reveal>

                <div className={styles.grid}>
                    {services.map((service, index) => (
                        <Reveal key={index} delay={index * 200}>
                            <div className={styles.card}>
                                <div className={styles.iconWrapper}>{service.icon}</div>
                                <h3 className={styles.cardTitle}>{service.title}</h3>
                                <p className={styles.cardDesc}>{service.desc}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
