import styles from "./footer.module.css"

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerSquare} />
      <div className={styles.footerInfo}>
        <div className={styles.footerText}>Company Infos</div>
        <div className={styles.footerText}>Useful links</div>
        <div className={styles.footerText}>
          Address<br />Phone<br />E-mail<br />Links
        </div>
      </div>
      <a className={styles.adminLogin} href="/admin">
        Admin
      </a>
    </footer>
  );
}