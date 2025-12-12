import React, { useEffect, useState } from 'react';
import { Fab, Zoom } from '@mui/material';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';

const ScrollToTop = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);

    const handleScrollToTop = () => {
        const containers = [
            document.querySelector('.body'),
            document.querySelector('.main'),
            document.querySelector('.container-xxl'),
        ];

        for (const container of containers) {
            if (container && container.scrollTop > 0) {
                container.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        const handleScroll = () => {
            const containers = [
                document.querySelector('.body'),
                document.querySelector('.main'),
                document.querySelector('.container-xxl'),
            ];

            const scrollValues = containers
                .map(c => (c ? c.scrollTop : 0))
                .concat(window.scrollY || document.documentElement.scrollTop);

            const scrollTop = Math.max(...scrollValues);
            setShowScrollTop(scrollTop > 120);
        };

        const containers = [
            document.querySelector('.body'),
            document.querySelector('.main'),
            document.querySelector('.container-xxl'),
        ];

        window.addEventListener('scroll', handleScroll, true);
        containers.forEach(c => c && c.addEventListener('scroll', handleScroll));

        setTimeout(handleScroll, 100);

        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            containers.forEach(c => c && c.removeEventListener('scroll', handleScroll));
        };
    }, []);

    return (
        <Zoom in={showScrollTop}>
            <Fab
                aria-label="scroll to top"
                onClick={handleScrollToTop}
                className="btn btn-primary"
                sx={{
                    position: 'fixed',
                    bottom: 100,
                    right: 28,
                    zIndex: 2000,
                    width: 45,
                    height: 45,
                    borderRadius: '50%',
                    color: 'var(--white-color)',
                    background: 'var(--primary-color)',
                    boxShadow: '0 6px 16px var(--primary-color)',
                    backdropFilter: 'blur(6px)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        background: 'var(--secondary-color)',
                        transform: 'translateY(-4px) scale(1.08)',
                        boxShadow: '0 10px 22px var(--secondary-color)',
                    },
                    '&:active': {
                        transform: 'scale(0.96)',
                    },
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.4), transparent)',
                        opacity: 0.2,
                        transition: 'opacity 0.3s',
                    },
                    '&:hover::before': {
                        opacity: 0.35,
                    },
                }}
            >
                <ArrowUpwardRoundedIcon sx={{ fontSize: 28 }} />
            </Fab>
        </Zoom>
    );
};

export default ScrollToTop;
