'use client';
import { useState } from 'react';
import { Mail, Phone, Instagram, MapPin, Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';
import styles from './Contact.module.css';

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
    };

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <Reveal>
                    <h1 className={styles.title}>Get in Touch</h1>
                    <p className={styles.subtitle}>Let’s discuss your next artistic masterpiece or interior project.</p>
                </Reveal>

                <div className={styles.grid}>
                    <div className={styles.formSection}>
                        <Reveal delay={200}>
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.row}>
                                    <div className={styles.group}>
                                        <label>Full Name</label>
                                        <input type="text" placeholder="John Doe" required />
                                    </div>
                                    <div className={styles.group}>
                                        <label>Email Address</label>
                                        <input type="email" placeholder="hello@example.com" required />
                                    </div>
                                </div>
                                <div className={styles.group} style={{ marginTop: '2rem' }}>
                                    <label>Subject</label>
                                    <select>
                                        <option>Art Acquisition</option>
                                        <option>Interior Design Inquiry</option>
                                        <option>Lifestyle Consulting</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className={styles.group} style={{ marginTop: '2rem' }}>
                                    <label>Your Message</label>
                                    <textarea rows={6} placeholder="Tell us about your vision..." required />
                                </div>

                                <Button type="submit" variant="primary" className={styles.submitBtn}>
                                    {submitted ? 'Inquiry Sent Successfully' : 'Send Inquiry'} <Send size={18} />
                                </Button>
                            </form>
                        </Reveal>
                    </div>

                    <div className={styles.infoSection}>
                        <Reveal delay={400}>
                            <div className={styles.card}>
                                <h2>Studio Concierge</h2>
                                <div className={styles.contactItem}>
                                    <Mail size={24} />
                                    <div>
                                        <h3>Email Us</h3>
                                        <p>hello@cherifslifestylehub.com</p>
                                    </div>
                                </div>
                                <div className={styles.contactItem}>
                                    <Phone size={24} />
                                    <div>
                                        <h3>WhatsApp</h3>
                                        <p>{process.env.NEXT_PUBLIC_CONTACT_NUMBER || "+234 813 800 3389"}</p>
                                    </div>
                                </div>
                                <div className={styles.contactItem}>
                                    <Instagram size={24} />
                                    <div>
                                        <h3>Social</h3>
                                        <p>@cherifslifestylehub</p>
                                    </div>
                                </div>
                                <div className={styles.contactItem}>
                                    <MapPin size={24} />
                                    <div>
                                        <h3>Creative Studio</h3>
                                        <p>Lagos, Nigeria • Global Consultation</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </div>
        </main>
    );
}
