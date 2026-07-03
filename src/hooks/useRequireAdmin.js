// src/hooks/useRequireAdmin.js
"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export default function useRequireAdmin() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                router.replace("/auth");
                return;
            }

            const token = await firebaseUser.getIdTokenResult();

            if (!token.claims.admin) {
                router.replace("/");
                return;
            }

            setUser(firebaseUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    return { user, loading };
}