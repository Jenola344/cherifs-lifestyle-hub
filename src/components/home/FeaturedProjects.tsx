import Link from 'next/link';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';
import styles from './FeaturedProjects.module.css';

const projects = [
    {
        title: 'Modern Living Room Concept',
        category: 'Interior',
        image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800'
    },
    {
        title: 'Luxury Bedroom Styling',
        category: 'Styling',
        image: 'https://images.unsplash.com/photo-1590608897129-79da98d15969?q=80&w=800'
    },
    {
        title: 'Minimalist Dining Space',
        category: 'Interior',
        image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=800'
    },
    {
        title: 'Artistic Studio Apartment',
        category: 'Architecture',
        image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=800'
    },
    {
        title: 'Contemporary Office Interior',
        category: 'Commercial',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800'
    },
    {
        title: 'Elegant Lounge Design',
        category: 'Interior',
        image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800'
    }
];

export default function FeaturedProjects() {
    return (
        <section className={styles.section} id="featured">
            <div className={styles.container}>
                <Reveal>
                    <div className={styles.header}>
                        <h2 className={styles.heading}>Featured Interiors</h2>
                        <p className={styles.subtext}>A selection of our finest work.</p>
                    </div>
                </Reveal>

                <div className={styles.grid}>
                    {projects.map((project, index) => (
                        <Reveal key={index} delay={(index % 3) * 100}>
                            <div className={styles.card}>
                                <div
                                    className={styles.image}
                                    style={{ backgroundImage: `url(${project.image})` }}
                                />
                                <div className={styles.overlay}>
                                    <span className={styles.category}>{project.category}</span>
                                    <h3 className={styles.projectTitle}>{project.title}</h3>
                                    <Link href="/shop" className={styles.link}>View Details</Link>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>

                <Reveal className={styles.footer}>
                    <Button href="/shop" variant="outline">View Full Portfolio</Button>
                </Reveal>
            </div>
        </section>
    );
}
