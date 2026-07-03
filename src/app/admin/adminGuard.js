"use client";
import { useEffect } from "react";
import useRequireAdmin from "@/hooks/useRequireAdmin";

export default function AdminGuard({ children }) {
  const { user, loading } = useRequireAdmin();

  if (loading) return null;
  if (!user) return null;

  return children;
}