import Sidebar from "@/component/sidebar";
import styles from "../layout.module.css";
import AdminGuard from "./adminGuard";

export const metadata = {
  title: "Admin - Rasses Location",
};

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.main}>{children}</main>
      </div>
    </AdminGuard>
  );
}