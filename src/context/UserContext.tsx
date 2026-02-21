'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

interface User {
    id: string;
    name: string;
    email: string;
    favorites?: string[];
    role?: string;
}

interface UserContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    toggleFavorite: (artId: string) => Promise<void>;
    isAuthenticated: boolean;
    loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            setUser({
                id: (session.user as any).id || '',
                name: session.user.name || '',
                email: session.user.email || '',
                role: (session.user as any).role || 'user'
            });
            setLoading(false);
        } else if (status === 'unauthenticated') {
            const savedUser = localStorage.getItem('cherif_user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            } else {
                setUser(null);
            }
            setLoading(false);
        }
    }, [session, status]);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('cherif_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('cherif_user');
        if (status === 'authenticated') {
            signOut({ redirect: false });
        }
    };

    const toggleFavorite = async (artId: string) => {
        if (!user) return;

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'toggle-favorite',
                    userId: user.id,
                    favoriteId: artId
                })
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setUser(updatedUser);
                if (status !== 'authenticated') {
                    localStorage.setItem('cherif_user', JSON.stringify(updatedUser));
                }
            }
        } catch (error) {
            console.error('Failed to toggle favorite');
        }
    };

    return (
        <UserContext.Provider value={{
            user,
            login,
            logout,
            toggleFavorite,
            isAuthenticated: !!user,
            loading: status === 'loading' || loading
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
