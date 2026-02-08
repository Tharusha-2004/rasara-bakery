import React, { useState, useEffect } from 'react';
import { Database, Wifi, WifiOff } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';

const ConnectionStatus = () => {
    const [status, setStatus] = useState('checking'); // checking, connected, disconnected, demo
    const { toast } = useToast();

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            // Check if Firebase is configured (dummy check for now since we use a real file)
            // In a real app, we might check if apiKey is present in config
            if (!db) {
                setStatus('disconnected');
                return;
            }

            // Try a lightweight query to check connection
            // We'll try to fetch 1 product, just to see if we can reach Firestore
            try {
                await getDocs(collection(db, 'products'));
                setStatus('connected');
            } catch (e) {
                console.warn("Firestore connection check failed, assuming demo/offline or permission issue", e);
                // If permission denied, we are technically connected but restricted.
                // For this UI, we might still show 'connected' or 'demo'
                setStatus('demo');
            }
        } catch (error) {
            console.error('Connection check error:', error);
            setStatus('disconnected');
        }
    };

    if (status === 'checking') return null;

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700">
            {status === 'connected' ? (
                <>
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-green-700 dark:text-green-400">Live Database</span>
                </>
            ) : status === 'demo' ? (
                <>
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    <span className="text-amber-700 dark:text-amber-400">Demo Mode (Local)</span>
                </>
            ) : (
                <>
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    <span className="text-red-700 dark:text-red-400">Connection Error</span>
                </>
            )}
        </div>
    );
};

export default ConnectionStatus;
