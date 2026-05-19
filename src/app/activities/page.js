"use client";
import Link from "next/link";
import { useMemo, useEffect, useState, useRef } from "react";
import styles from "./page.module.css";
import { storage } from "@/lib/firebase/config";
import { ref, listAll, getDownloadURL } from "firebase/storage";

export default function ActivitiesPage() {
    
}