import Link from 'next/link';
import styles from './Button.module.css';

interface ButtonProps {
    children: React.ReactNode;
    href?: string;
    onClick?: () => void;
    variant?: 'primary' | 'outline' | 'text';
    className?: string;
    external?: boolean;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
}

export default function Button({
    children,
    href,
    onClick,
    variant = 'primary',
    className = '',
    external = false,
    type = 'button',
    disabled = false
}: ButtonProps) {
    const btnClass = `${styles.btn} ${styles[variant]} ${className}`;

    if (href) {
        if (external) {
            return (
                <a href={href} className={btnClass} target="_blank" rel="noopener noreferrer">
                    {children}
                </a>
            );
        }
        return (
            <Link href={href} className={btnClass}>
                {children}
            </Link>
        );
    }

    return (
        <button className={btnClass} onClick={onClick} type={type} disabled={disabled}>
            {children}
        </button>
    );
}
