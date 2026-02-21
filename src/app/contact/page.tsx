'use client';
import { useState } from 'react';
import { Mail, Phone, Instagram, MapPin, Send, MessageCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';
import { APP_CONFIG } from '@/lib/config';
import styles from './Contact.module.css';

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'Art Acquisition',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Construct the mailto link
        const subject = encodeURIComponent(`${formData.subject} - Inquiry from ${formData.name}`);
        const body = encodeURIComponent(
            `Name: ${formData.name}\n` +
            `Email: ${formData.email}\n\n` +
            `Message:\n${formData.message}`
        );

        window.location.href = `mailto:${APP_CONFIG.contactEmail}?subject=${subject}&body=${body}`;

        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
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
                                        <input
                                            name="name"
                                            type="text"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className={styles.group}>
                                        <label>Email Address</label>
                                        <input
                                            name="email"
                                            type="email"
                                            placeholder="hello@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className={styles.group} style={{ marginTop: '2rem' }}>
                                    <label>Subject</label>
                                    <select name="subject" value={formData.subject} onChange={handleChange}>
                                        <option>Art Acquisition</option>
                                        <option>Interior Design Inquiry</option>
                                        <option>Lifestyle Consulting</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className={styles.group} style={{ marginTop: '2rem' }}>
                                    <label>Your Message</label>
                                    <textarea
                                        name="message"
                                        rows={6}
                                        placeholder="Tell us about your vision..."
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                    />
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
                                        <p><a href={`mailto:${APP_CONFIG.contactEmail}`} className={styles.link}>{APP_CONFIG.contactEmail}</a></p>
                                    </div>
                                </div>
                                <div className={styles.contactItem}>
                                    <MessageCircle size={24} />
                                    <div>
                                        <h3>WhatsApp</h3>
                                        <p><a href={APP_CONFIG.socials.whatsapp} target="_blank" rel="noopener noreferrer" className={styles.link}>{APP_CONFIG.whatsappNumber}</a></p>
                                    </div>
                                </div>
                                <div className={styles.contactItem}>
                                    <Instagram size={24} />
                                    <div>
                                        <h3>Social</h3>
                                        <p><a href={APP_CONFIG.socials.instagram} target="_blank" rel="noopener noreferrer" className={styles.link}>@cheriflifestylegallery</a></p>
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
