"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export default function useRequireAuth() { 
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => { 
            if (currentUser) {
                setUser(currentUser);
            } else {
                router.push("/auth");
            }
            setLoading(false);
        });
        return unsubscribe;
    }, [router]);

    return { user, loading };
}