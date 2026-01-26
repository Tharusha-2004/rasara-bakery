import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const AdminDataContext = createContext();

export const useAdminData = () => {
    const context = useContext(AdminDataContext);
    if (!context) {
        throw new Error('useAdminData must be used within AdminDataProvider');
    }
    return context;
};

export const AdminDataProvider = ({ children }) => {
    const cacheRef = useRef({
        products: { data: null, timestamp: null, loading: false },
        orders: { data: null, timestamp: null, loading: false },
        salesData: { data: null, timestamp: null, loading: false },
        stats: { data: null, timestamp: null, loading: false }
    });

    const [, forceUpdate] = useState({});

    // Cache expiry time (5 minutes)
    const CACHE_EXPIRY = 5 * 60 * 1000;

    const isCacheValid = useCallback((key) => {
        const cached = cacheRef.current[key];
        if (!cached.data || !cached.timestamp) return false;
        return Date.now() - cached.timestamp < CACHE_EXPIRY;
    }, []);

    const getCachedData = useCallback((key) => {
        return isCacheValid(key) ? cacheRef.current[key].data : null;
    }, [isCacheValid]);

    const setCachedData = useCallback((key, data) => {
        cacheRef.current[key] = { data, timestamp: Date.now(), loading: false };
        forceUpdate({});
    }, []);

    const setLoading = useCallback((key, loading) => {
        cacheRef.current[key] = { ...cacheRef.current[key], loading };
        forceUpdate({});
    }, []);

    const invalidateCache = useCallback((key) => {
        if (key) {
            cacheRef.current[key] = { data: null, timestamp: null, loading: false };
        } else {
            // Invalidate all cache
            cacheRef.current = {
                products: { data: null, timestamp: null, loading: false },
                orders: { data: null, timestamp: null, loading: false },
                salesData: { data: null, timestamp: null, loading: false },
                stats: { data: null, timestamp: null, loading: false }
            };
        }
        forceUpdate({});
    }, []);

    const value = {
        cache: cacheRef.current,
        getCachedData,
        setCachedData,
        setLoading,
        invalidateCache,
        isCacheValid
    };

    return (
        <AdminDataContext.Provider value={value}>
            {children}
        </AdminDataContext.Provider>
    );
};
