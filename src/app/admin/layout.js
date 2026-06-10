import Sidebar from "@/component/sidebar";
import styles from "../layout.module.css";

export const metadata = {
  title: "Admin - Rasses Location",
};

export default function AdminLayout({ children }) {
  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
