'use client';
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { CheckCircle, Clock, History, LayoutDashboard, LogOut, Users, Palette, ShoppingCart, Plus, Trash2, Edit, MessageSquare, Star, BookOpen, X } from 'lucide-react';
import styles from './Admin.module.css';

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [orders, setOrders] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [art, setArt] = useState<any[]>([]);
    const [blog, setBlog] = useState<any[]>([]);
    const [feedback, setFeedback] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'orders' | 'users' | 'art' | 'blog' | 'feedback' | 'broadcast'>('orders');
    const [view, setView] = useState<'all' | 'pending' | 'completed'>('all');

    // Blog form state
    const [showBlogModal, setShowBlogModal] = useState(false);
    const [editingBlog, setEditingBlog] = useState<any | null>(null);
    const [newPost, setNewPost] = useState({
        title: '',
        category: '',
        excerpt: '',
        content: '',
        author: "Cherif's Editorial"
    });
    const [blogImage, setBlogImage] = useState<File | null>(null);

    // Art form state
    const [showArtModal, setShowArtModal] = useState(false);
    const [editingArt, setEditingArt] = useState<any | null>(null);
    const [newArt, setNewArt] = useState({
        title: '',
        artist: '',
        price: '',
        category: '',
        sizes: '',
        description: '',
        status: 'available'
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [broadcast, setBroadcast] = useState({ title: '', message: '', type: 'general' });

    useEffect(() => {
        if (isAuthenticated) {
            fetchAllData();
        }
    }, [isAuthenticated]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [ordersRes, usersRes, artRes, blogRes, feedbackRes] = await Promise.all([
                fetch('/api/orders'),
                fetch('/api/users'),
                fetch('/api/art'),
                fetch('/api/blog'),
                fetch('/api/feedback')
            ]);

            if (ordersRes.ok) setOrders(await ordersRes.json());
            if (usersRes.ok) setUsers(await usersRes.json());
            if (artRes.ok) setArt(await artRes.json());
            if (blogRes.ok) setBlog(await blogRes.json());
            if (feedbackRes.ok) setFeedback(await feedbackRes.json());
        } catch (error) {
            console.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            if (data.success) {
                setIsAuthenticated(true);
            } else {
                alert(data.message || 'Invalid Access Code');
            }
        } catch (error) {
            alert('Authentication error');
        }
    };

    const handleApprove = async (orderId: string) => {
        try {
            const res = await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: 'Completed' })
            });
            if (res.ok) fetchAllData();
        } catch (error) { alert('Update failed'); }
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to cancel this order? This will be visible to the customer.')) return;
        try {
            const res = await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: 'Cancelled' })
            });
            if (res.ok) fetchAllData();
        } catch (error) { alert('Failed to cancel order'); }
    };

    const handleSaveArt = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', newArt.title);
        formData.append('artist', newArt.artist);
        formData.append('price', newArt.price);
        formData.append('category', newArt.category);
        formData.append('description', newArt.description);
        formData.append('sizes', newArt.sizes);
        formData.append('status', newArt.status);
        if (imageFile) {
            formData.append('image', imageFile);
        }
        if (editingArt) {
            formData.append('id', editingArt.id);
        }

        try {
            const res = await fetch('/api/art', {
                method: editingArt ? 'PUT' : 'POST',
                body: formData
            });
            if (res.ok) {
                setShowArtModal(false);
                setEditingArt(null);
                setNewArt({ title: '', artist: '', price: '', category: '', sizes: '', description: '', status: 'available' });
                setImageFile(null);
                fetchAllData();
            }
        } catch (error) { alert('Failed to save art'); }
    };

    const handleDeleteArt = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            const res = await fetch(`/api/art?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchAllData();
        } catch (error) { alert('Delete failed'); }
    };

    const handleSaveBlog = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', newPost.title);
        formData.append('category', newPost.category);
        formData.append('excerpt', newPost.excerpt);
        formData.append('content', newPost.content);
        formData.append('author', newPost.author);

        if (blogImage) {
            formData.append('image', blogImage);
        }
        if (editingBlog) {
            formData.append('id', editingBlog.id);
        }

        try {
            const res = await fetch('/api/blog', {
                method: editingBlog ? 'PUT' : 'POST',
                body: formData
            });
            if (res.ok) {
                setShowBlogModal(false);
                setEditingBlog(null);
                setNewPost({ title: '', category: '', excerpt: '', content: '', author: "Cherif's Editorial" });
                setBlogImage(null);
                fetchAllData();
            }
        } catch (error) { alert('Failed to save post'); }
    };

    const handleDeleteBlog = async (id: string) => {
        if (!confirm('Delete this journal entry?')) return;
        try {
            const res = await fetch(`/api/blog?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchAllData();
        } catch (error) { alert('Delete failed'); }
    };

    const openEditModal = (item: any) => {
        setEditingArt(item);
        setNewArt({
            title: item.title,
            artist: item.artist,
            price: item.price.toString(),
            category: item.category,
            sizes: item.sizes.join(', '),
            description: item.description,
            status: item.status || 'available'
        });
        setShowArtModal(true);
    };

    const openEditBlogModal = (item: any) => {
        setEditingBlog(item);
        setNewPost({
            title: item.title,
            category: item.category,
            excerpt: item.excerpt,
            content: item.content,
            author: item.author
        });
        setShowBlogModal(true);
    };

    const handleSendBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'all',
                    ...broadcast
                })
            });
            if (res.ok) {
                alert('Broadcast sent successfully!');
                setBroadcast({ title: '', message: '', type: 'general' });
            }
        } catch (error) { alert('Broadcast failed'); }
    };

    if (!isAuthenticated) {
        return (
            <main className={styles.loginContainer}>
                <div className={styles.loginBox}>
                    <h1>Cherif Admin</h1>
                    <form onSubmit={handleLogin}>
                        <input type="password" placeholder="Access Code" value={password} onChange={(e) => setPassword(e.target.value)} className={styles.input} />
                        <Button type="submit" variant="primary" className={styles.loginBtn}>Access Hub</Button>
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.dashboard}>
            <aside className={styles.sidebar}>
                <div className={styles.brand}>Hub Admin</div>
                <nav className={styles.nav}>
                    <button className={`${styles.navBtn} ${activeTab === 'orders' ? styles.active : ''}`} onClick={() => setActiveTab('orders')}>
                        <ShoppingCart size={18} /> Orders
                    </button>
                    <button className={`${styles.navBtn} ${activeTab === 'users' ? styles.active : ''}`} onClick={() => setActiveTab('users')}>
                        <Users size={18} /> Customers
                    </button>
                    <button className={`${styles.navBtn} ${activeTab === 'art' ? styles.active : ''}`} onClick={() => setActiveTab('art')}>
                        <Palette size={18} /> Art Collection
                    </button>
                    <button className={`${styles.navBtn} ${activeTab === 'blog' ? styles.active : ''}`} onClick={() => setActiveTab('blog')}>
                        <BookOpen size={18} /> Lifestyle Journal
                    </button>
                    <button className={`${styles.navBtn} ${activeTab === 'feedback' ? styles.active : ''}`} onClick={() => setActiveTab('feedback')}>
                        <Star size={18} /> Service Feedback
                    </button>
                    <button className={`${styles.navBtn} ${activeTab === 'broadcast' ? styles.active : ''}`} onClick={() => setActiveTab('broadcast')}>
                        <MessageSquare size={18} /> Send Broadcast
                    </button>
                </nav>
                <button onClick={() => setIsAuthenticated(false)} className={styles.logoutBtn}><LogOut size={18} /> Logout</button>
            </aside>

            <div className={styles.mainContent}>
                {activeTab === 'orders' && (
                    <>
                        <div className={styles.tabHeader}>
                            <h2>Order Management</h2>
                            <div className={styles.filters}>
                                <button onClick={() => setView('all')} className={view === 'all' ? styles.activeFilter : ''}>All</button>
                                <button onClick={() => setView('pending')} className={view === 'pending' ? styles.activeFilter : ''}>Pending</button>
                                <button onClick={() => setView('completed')} className={view === 'completed' ? styles.activeFilter : ''}>Completed</button>
                            </div>
                        </div>

                        <div className={styles.tableCard}>
                            <table className={styles.table}>
                                <thead>
                                    <tr><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr>
                                </thead>
                                <tbody>
                                    {orders.filter(o => view === 'all' || o.status.toLowerCase() === view).map(order => (
                                        <tr key={order.id}>
                                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td>{order.customerName}</td>
                                            <td>
                                                <button className={styles.itemsCountBtn} onClick={() => setSelectedOrder(order)}>
                                                    {order.items.length} items
                                                </button>
                                            </td>
                                            <td>₦{order.totalPrice.toLocaleString()}</td>
                                            <td><span className={`${styles.badge} ${styles[order.status.toLowerCase()]}`}>{order.status}</span></td>
                                            <td>
                                                <div className={styles.artActions}>
                                                    {order.status === 'Pending' && (
                                                        <>
                                                            <button className={styles.actionBtn} onClick={() => handleApprove(order.id)}>Approve</button>
                                                            <button className={styles.cancelBtn} onClick={() => handleCancelOrder(order.id)}>Cancel</button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {activeTab === 'users' && (
                    <>
                        <div className={styles.tabHeader}>
                            <h2>Registered Customers</h2>
                            <p>{users.length} total members</p>
                        </div>
                        <div className={styles.tableCard}>
                            <table className={styles.table}>
                                <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Orders</th></tr></thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td>{u.name}</td>
                                            <td>{u.email}</td>
                                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td>{orders.filter(o => o.userEmail === u.email).length}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {activeTab === 'art' && (
                    <>
                        <div className={styles.tabHeader}>
                            <h2>Art Collection</h2>
                            <button className={styles.addBtn} onClick={() => { setEditingArt(null); setShowArtModal(true); }}><Plus size={18} /> Add Artwork</button>
                        </div>
                        <div className={styles.artGrid}>
                            {art.map(item => (
                                <div key={item.id} className={styles.artCard}>
                                    <div className={styles.artImg} style={{ backgroundImage: `url(${item.image})` }}>
                                        {item.status === 'sold out' && <span className={styles.soldBadge}>Sold Out</span>}
                                    </div>
                                    <div className={styles.artInfo}>
                                        <h3>{item.title}</h3>
                                        <p>{item.artist} • ₦{item.price}</p>
                                        <div className={styles.artActions}>
                                            <button onClick={() => openEditModal(item)} className={styles.editBtn}><Edit size={16} /></button>
                                            <button onClick={() => handleDeleteArt(item.id)} className={styles.delBtn}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'blog' && (
                    <>
                        <div className={styles.tabHeader}>
                            <h2>Lifestyle Journal</h2>
                            <button className={styles.addBtn} onClick={() => { setEditingBlog(null); setShowBlogModal(true); }}><Plus size={18} /> New Article</button>
                        </div>
                        <div className={styles.artGrid}>
                            {blog.map(post => (
                                <div key={post.id} className={styles.artCard}>
                                    <div className={styles.artImg} style={{ backgroundImage: `url(${post.image})` }} />
                                    <div className={styles.artInfo}>
                                        <span className={styles.categoryBadge}>{post.category}</span>
                                        <h3>{post.title}</h3>
                                        <p>{post.date} • By {post.author}</p>
                                        <div className={styles.artActions}>
                                            <button onClick={() => openEditBlogModal(post)} className={styles.editBtn}><Edit size={16} /></button>
                                            <button onClick={() => handleDeleteBlog(post.id)} className={styles.delBtn}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'feedback' && (
                    <>
                        <div className={styles.tabHeader}>
                            <h2>Service Feedback</h2>
                            <p>{feedback.length} total reviews</p>
                        </div>
                        <div className={styles.feedbackList}>
                            {feedback.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(f => (
                                <div key={f.id} className={styles.feedbackCard}>
                                    <div className={styles.feedbackHeader}>
                                        <strong>{f.userName}</strong>
                                        <div className={styles.stars}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < f.rating ? "currentColor" : "none"} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className={styles.feedbackMsg}>{f.message}</p>
                                    <span className={styles.feedbackDate}>{new Date(f.createdAt).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'broadcast' && (
                    <div className={styles.tableCard} style={{ padding: '3rem' }}>
                        <h2 className={styles.heading}>Send Hub-wide Broadcast</h2>
                        <p style={{ marginBottom: '2rem', color: '#666' }}>This message will be visible in the notification center of every registered member.</p>

                        <form onSubmit={handleSendBroadcast} className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label>Broadcast Title</label>
                                <input
                                    placeholder="e.g., Seasonal Discount 20% Off"
                                    value={broadcast.title}
                                    onChange={e => setBroadcast({ ...broadcast, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Notification Type</label>
                                <select value={broadcast.type} onChange={e => setBroadcast({ ...broadcast, type: e.target.value })}>
                                    <option value="general">General Update</option>
                                    <option value="discount">Seasonal Discount</option>
                                    <option value="greeting">Hub Greeting</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Your Message</label>
                                <textarea
                                    rows={5}
                                    placeholder="Craft your message to the hub family..."
                                    value={broadcast.message}
                                    onChange={e => setBroadcast({ ...broadcast, message: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className={styles.saveBtn} style={{ marginTop: '1rem' }}>Dispatch Broadcast</button>
                        </form>
                    </div>
                )}
            </div>

            {showArtModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>{editingArt ? 'Edit Artwork' : 'Add New Artwork'}</h3>
                        <form onSubmit={handleSaveArt} className={styles.modalForm}>
                            <div className={styles.modalGrid2Col}>
                                <div className={styles.formGroup}>
                                    <label>Title</label>
                                    <input value={newArt.title} onChange={e => setNewArt({ ...newArt, title: e.target.value })} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Artist</label>
                                    <input value={newArt.artist} onChange={e => setNewArt({ ...newArt, artist: e.target.value })} required />
                                </div>
                            </div>
                            <div className={styles.modalGrid2Col}>
                                <div className={styles.formGroup}>
                                    <label>Price (₦)</label>
                                    <input type="number" value={newArt.price} onChange={e => setNewArt({ ...newArt, price: e.target.value })} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Category</label>
                                    <input value={newArt.category} onChange={e => setNewArt({ ...newArt, category: e.target.value })} required />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Sizes (comma separated)</label>
                                <input placeholder="18x24, 24x36" value={newArt.sizes} onChange={e => setNewArt({ ...newArt, sizes: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Availability</label>
                                <select value={newArt.status} onChange={e => setNewArt({ ...newArt, status: e.target.value })}>
                                    <option value="available">Available</option>
                                    <option value="sold out">Sold Out</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Artwork Image ({editingArt ? 'Optional update' : 'Required'})</label>
                                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} required={!editingArt} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea value={newArt.description} onChange={e => setNewArt({ ...newArt, description: e.target.value })} rows={3} />
                            </div>
                            <div className={styles.modalBtns}>
                                <button type="button" onClick={() => { setShowArtModal(false); setEditingArt(null); }}>Cancel</button>
                                <button type="submit" className={styles.saveBtn}>Save Artwork</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showBlogModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>{editingBlog ? 'Edit Article' : 'Write New Journal Entry'}</h3>
                            <button onClick={() => setShowBlogModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveBlog} className={styles.modalForm}>
                            <div className={styles.modalGrid2Col}>
                                <div className={styles.formGroup}>
                                    <label>Article Title</label>
                                    <input value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Category</label>
                                    <select value={newPost.category} onChange={e => setNewPost({ ...newPost, category: e.target.value })} required>
                                        <option value="">Select Category</option>
                                        <option value="Trends">Design Trends</option>
                                        <option value="Lifestyle">Lifestyle</option>
                                        <option value="Art Curating">Art Curating</option>
                                        <option value="Architecture">Architecture</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Short Excerpt (Displayed in Grid)</label>
                                <textarea rows={2} value={newPost.excerpt} onChange={e => setNewPost({ ...newPost, excerpt: e.target.value })} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Header Image ({editingBlog ? 'Optional update' : 'Required'})</label>
                                <input type="file" accept="image/*" onChange={e => setBlogImage(e.target.files?.[0] || null)} required={!editingBlog} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Main Content (Markdown supported)</label>
                                <textarea rows={10} value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} required />
                            </div>
                            <div className={styles.modalBtns}>
                                <button type="button" onClick={() => setShowBlogModal(false)}>Cancel</button>
                                <button type="submit" className={styles.saveBtn}>Publish to Journal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedOrder && (
                <div className={styles.modal} onClick={() => setSelectedOrder(null)}>
                    <div className={styles.orderDetailModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.orderHeader}>
                            <h2>Acquisition Details</h2>
                            <p>Order ID: {selectedOrder.id}</p>
                            <p>Date: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                            <p>Status: <span className={`${styles.badge} ${styles[selectedOrder.status.toLowerCase()]}`}>{selectedOrder.status}</span></p>
                        </div>
                        <div className={styles.orderItemsList}>
                            {selectedOrder.items.map((item: any, idx: number) => (
                                <div key={idx} className={styles.orderItem}>
                                    <div className={styles.orderItemThumb} style={{ backgroundImage: `url(${item.image})` }} />
                                    <div className={styles.orderItemInfo}>
                                        <h4>{item.title}</h4>
                                        <p>{item.size} • {item.frame}</p>
                                        <p>Price: ₦{item.price.toLocaleString()} • Qty: {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className={styles.modalFooter} style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                            <div className={styles.total} style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                Total: ₦{selectedOrder.totalPrice.toLocaleString()}
                            </div>
                            <Button onClick={() => setSelectedOrder(null)} variant="outline">Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
