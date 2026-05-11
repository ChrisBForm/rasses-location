import styles from "./Footer.module.css"

export default function Footer() {
  return (
    <footer className={styles.Footer}>
      <div className="logo">Rasses Location</div>
      <nav>
        <div className="footer-info">Company Infos</div>
        <div className="footer-info">Useful links</div>
        <div className="footer-info">Adress<br/>Phone<br/>E-mail<br/>Links</div>
        <a className="admin-login" href="/admin">Admin</a>
      </nav>
    </footer>
  );
}