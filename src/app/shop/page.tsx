'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import styles from './Shop.module.css';
import Button from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';
import { X, Heart, Star, MessageSquare, Send } from 'lucide-react';

export default function Shop() {
    const { addToCart } = useCart();
    const { user, toggleFavorite, isAuthenticated } = useUser();
    const [artCollection, setArtCollection] = useState<any[]>([]);
    const [filter, setFilter] = useState('All');
    const [selectedArt, setSelectedArt] = useState<any | null>(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedFrame, setSelectedFrame] = useState<'Framed' | 'Frameless'>('Frameless');
    const [loading, setLoading] = useState(true);

    // Reviews state
    const [reviews, setReviews] = useState<any[]>([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        fetchArt();
    }, []);

    const fetchArt = () => {
        fetch('/api/art')
            .then(res => res.json())
            .then(data => {
                setArtCollection(data);
                setLoading(false);
            });
    }

    useEffect(() => {
        if (selectedArt) {
            fetchReviews(selectedArt.id);
        }
    }, [selectedArt]);

    const fetchReviews = (artId: string) => {
        fetch(`/api/reviews?artId=${artId}`)
            .then(res => res.json())
            .then(setReviews);
    };

    const categories = ['All', ...Array.from(new Set(artCollection.map(item => item.category)))];

    const filteredItems = filter === 'All'
        ? artCollection
        : artCollection.filter(item => item.category === filter);

    const handleOpenArt = (item: any) => {
        setSelectedArt(item);
        setSelectedSize(item.sizes?.[0] || '');
        setSelectedFrame('Frameless');
        setNewReview({ rating: 5, comment: '' });
    };

    const handleAddToCart = () => {
        if (!selectedArt || selectedArt.status === 'sold out') return;

        addToCart({
            id: selectedArt.id,
            title: selectedArt.title,
            image: selectedArt.image,
            price: selectedArt.price,
            category: selectedArt.category
        }, selectedSize, selectedFrame);

        setSelectedArt(null);
        alert(`${selectedArt.title} added to cart!`);
    };

    const handleFavorite = (e: React.MouseEvent, artId: string) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            alert('Please sign in to save favorites');
            return;
        }
        toggleFavorite(artId);
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert('Sign in to leave a review');
            return;
        }
        setIsSubmittingReview(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    artId: selectedArt.id,
                    userName: user?.name,
                    rating: newReview.rating,
                    comment: newReview.comment
                })
            });
            if (res.ok) {
                fetchReviews(selectedArt.id);
                setNewReview({ rating: 5, comment: '' });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (loading) return <div className={styles.loader}>Loading Masterpieces...</div>;

    return (
        <main className={styles.main}>
            <header className={styles.header}>
                <Reveal>
                    <h1 className={styles.title}>The Art Collection</h1>
                    <p className={styles.subtitle}>Bespoke pieces curated for timeless luxury.</p>
                </Reveal>
            </header>

            <div className={styles.filterBar}>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        className={`${styles.filterBtn} ${filter === cat ? styles.active : ''}`}
                        onClick={() => setFilter(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className={styles.grid}>
                {filteredItems.map((item, index) => {
                    const isFav = user?.favorites?.includes(item.id);
                    return (
                        <Reveal key={item.id} delay={(index % 3) * 100}>
                            <div className={styles.card} onClick={() => handleOpenArt(item)}>
                                <div
                                    className={styles.imageWrapper}
                                    style={{ backgroundImage: `url(${item.image})` }}
                                >
                                    <button
                                        className={`${styles.favBtn} ${isFav ? styles.isFav : ''}`}
                                        onClick={(e) => handleFavorite(e, item.id)}
                                    >
                                        <Heart size={20} fill={isFav ? "white" : "none"} />
                                    </button>
                                    {item.status === 'sold out' && <span className={styles.soldBadge}>Sold Out</span>}
                                </div>
                                <div className={styles.info}>
                                    <span className={styles.category}>{item.category}</span>
                                    <h3 className={styles.itemTitle}>{item.title}</h3>
                                    <p className={styles.artist}>by {item.artist}</p>
                                    <div className={styles.bottom}>
                                        <span className={styles.price}>₦{item.price.toLocaleString()}</span>
                                        <button className={styles.viewBtn}>View Details</button>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    );
                })}
            </div>

            {/* Art Details Modal */}
            {selectedArt && (
                <div className={styles.modalOverlay} onClick={() => setSelectedArt(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setSelectedArt(null)}><X /></button>
                        <div className={styles.modalGrid}>
                            <div
                                className={styles.modalImage}
                                style={{ backgroundImage: `url(${selectedArt.image})` }}
                            >
                                {selectedArt.status === 'sold out' && <span className={styles.soldBadgeLarge}>Sold Out</span>}
                            </div>
                            <div className={styles.modalInfo}>
                                <div className={styles.modalScroll}>
                                    <span className={styles.modalCategory}>{selectedArt.category}</span>
                                    <h2 className={styles.modalTitle}>{selectedArt.title}</h2>
                                    <p className={styles.modalArtist}>by {selectedArt.artist}</p>
                                    <p className={styles.modalDesc}>{selectedArt.description}</p>

                                    <div className={styles.options}>
                                        <div className={styles.optionGroup}>
                                            <label>Select Size</label>
                                            <div className={styles.optionGrid}>
                                                {selectedArt.sizes?.map((size: string) => (
                                                    <button
                                                        key={size}
                                                        className={`${styles.optBtn} ${selectedSize === size ? styles.optActive : ''}`}
                                                        onClick={() => setSelectedSize(size)}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={styles.optionGroup}>
                                            <label>Framing Style</label>
                                            <div className={styles.optionGrid}>
                                                <button
                                                    className={`${styles.optBtn} ${selectedFrame === 'Frameless' ? styles.optActive : ''}`}
                                                    onClick={() => setSelectedFrame('Frameless')}
                                                >
                                                    Frameless
                                                </button>
                                                <button
                                                    className={`${styles.optBtn} ${selectedFrame === 'Framed' ? styles.optActive : ''}`}
                                                    onClick={() => setSelectedFrame('Framed')}
                                                >
                                                    Framed (+ ₦150)
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.reviewSection}>
                                        <h3>Artistic Critiques ({reviews.length})</h3>
                                        <div className={styles.reviewsList}>
                                            {reviews.map(r => (
                                                <div key={r.id} className={styles.reviewCard}>
                                                    <div className={styles.reviewHeader}>
                                                        <strong>{r.userName}</strong>
                                                        <div className={styles.stars}>
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} size={12} fill={i < r.rating ? "currentColor" : "none"} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p>{r.comment}</p>
                                                </div>
                                            ))}
                                            {reviews.length === 0 && <p className={styles.noReviews}>No critiques yet. Be the first to share your thoughts.</p>}
                                        </div>

                                        {isAuthenticated && (
                                            <form onSubmit={submitReview} className={styles.reviewForm}>
                                                <div className={styles.starsInput}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <button
                                                            key={i}
                                                            type="button"
                                                            onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
                                                        >
                                                            <Star size={20} fill={i < newReview.rating ? "currentColor" : "none"} />
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className={styles.commentInput}>
                                                    <input
                                                        placeholder="Add your critique..."
                                                        value={newReview.comment}
                                                        onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                                                        required
                                                    />
                                                    <button type="submit" disabled={isSubmittingReview}>
                                                        <Send size={18} />
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.modalFooter}>
                                    <div className={styles.modalPrice}>
                                        ₦{(selectedArt.price + (selectedFrame === 'Framed' ? 150 : 0)).toLocaleString()}
                                    </div>
                                    <Button
                                        onClick={handleAddToCart}
                                        variant="primary"
                                        className={styles.addBtn}
                                        disabled={selectedArt.status === 'sold out'}
                                    >
                                        {selectedArt.status === 'sold out' ? 'Sold Out' : 'Acquire for Collection'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
