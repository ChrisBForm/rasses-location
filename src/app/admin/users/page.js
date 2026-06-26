"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";
import useRequireAuth from "@/hooks/useRequireAuth";
import { useTranslations } from "next-intl";

export default function AdminUsersPage() {
  const { user, loading } = useRequireAuth();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [createError, setCreateError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("user");
  const [editStatus, setEditStatus] = useState("active");
  const [editingUser, setEditingUser] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const t = useTranslations("Admin");

  const fetchUsers = useCallback(async () => {
    if (!user) return;

    setFetchingUsers(true);
    setFetchError("");

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const responseBody = await response.text();
        throw new Error(responseBody || response.statusText);
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
      setFetchError("Unable to load users. Make sure you have admin access.");
    } finally {
      setFetchingUsers(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchUsers();
  }, [user, fetchUsers]);

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setCreatingUser(true);
    setCreateError("");

    if (!newUserEmail || !newUserPassword) {
      setCreateError(t('missing-fields') || "Email and password are required.");
      setCreatingUser(false);
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
          body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
        }),
      });

      if (!response.ok) {
        const responseBody = await response.text();
        throw new Error(responseBody || response.statusText);
      }

      setNewUserEmail("");
      setNewUserPassword("");
      setShowCreateForm(false);
      await fetchUsers();
    } catch (error) {
      console.error("Failed to create user:", error);
      setCreateError(error?.message || t('create-user-error') || "Unable to create user.");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleManageUser = (userItem) => {
    if (selectedUser?.uid === userItem.uid) {
      setSelectedUser(null);
      setEditError("");
      return;
    }

    setSelectedUser(userItem);
    setShowCreateForm(false);
    setEditPassword("");
    setEditRole(userItem.customClaims?.admin ? "admin" : "user");
    setEditStatus(userItem.disabled ? "disabled" : "active");
    setEditError("");
  };

  const handleUpdateUser = async (event) => {
    event.preventDefault();
    if (!selectedUser) return;

    setEditingUser(true);
    setEditError("");

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid: selectedUser.uid,
          password: editPassword || undefined,
          role: editRole,
          status: editStatus,
        }),
      });

      if (!response.ok) {
        const responseBody = await response.text();
        throw new Error(responseBody || response.statusText);
      }

      setSelectedUser(null);
      await fetchUsers();
    } catch (error) {
      console.error("Failed to update user:", error);
      setEditError(error?.message || t('update-user-error') || "Unable to update user.");
    } finally {
      setEditingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    const confirmed = window.confirm(t('confirm-delete-user') || "Delete this user?");
    if (!confirmed) return;

    setDeleteLoading(true);
    setEditError("");

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid: selectedUser.uid }),
      });

      if (!response.ok) {
        const responseBody = await response.text();
        throw new Error(responseBody || response.statusText);
      }

      setSelectedUser(null);
      await fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      setEditError(error?.message || t('delete-user-error') || "Unable to delete user.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return users;

    return users.filter((item) => {
      const role = item.customClaims?.admin ? "admin" : "user";
      const status = item.disabled ? "disabled" : "active";
      return (
        item.email.toLowerCase().includes(normalizedQuery) ||
        item.displayName.toLowerCase().includes(normalizedQuery) ||
        role.includes(normalizedQuery) ||
        status.includes(normalizedQuery)
      );
    });
  }, [query, users]);

  const adminCount = users.filter((item) => item.customClaims?.admin).length;

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!user) {
    return <div className={styles.error}>Please sign in to continue.</div>;
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.topRow}>
          <div className={styles.pageIntro}>
            <h1 className={styles.title}>{t('users')}</h1>
            <p className={styles.description}>
              {t('users-subtitle')}
            </p>
          </div>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => {
              setShowCreateForm((current) => !current);
              setCreateError("");
            }}
          >
            {showCreateForm ? t('cancel') : t('new-user')}
          </button>
        </section>

        <div className={styles.statsRow}>
          <div className={`${styles.statCard} ${styles.statCardPurple}`}>
            <span className={styles.statLabel}>{t('total')}</span>
            <span className={styles.statValue}>{users.length}</span>
          </div>
          <div className={`${styles.statCard} ${styles.statCardPink}`}>
            <span className={styles.statLabel}>{t('total-admin')}</span>
            <span className={styles.statValue}>{adminCount}</span>
          </div>
        </div>

        {showCreateForm && (
          <section className={`${styles.panel} ${styles.panelMuted}`}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>{t('create-user')}</h2>
                <p className={styles.panelSubtitle}>
                  {t('create-user-desc')}
                </p>
              </div>
            </div>

            <form className={styles.createForm} onSubmit={handleCreateUser}>
              <div className={styles.formRow}>
                <label className={styles.inputLabel} htmlFor="new-user-email">
                  {t('email')}
                </label>
                <input
                  id="new-user-email"
                  type="email"
                  value={newUserEmail}
                  onChange={(event) => setNewUserEmail(event.target.value)}
                  placeholder={t('email-placeholder')}
                  className={styles.inputField}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <label className={styles.inputLabel} htmlFor="new-user-password">
                  {t('password')}
                </label>
                <input
                  id="new-user-password"
                  type="password"
                  value={newUserPassword}
                  onChange={(event) => setNewUserPassword(event.target.value)}
                  placeholder={t('password-placeholder')}
                  className={styles.inputField}
                  required
                  minLength={6}
                />
              </div>

              {createError ? (
                <div className={styles.formError}>{createError}</div>
              ) : null}

              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={creatingUser}
                >
                  {creatingUser ? t('creating-user') : t('create-user')}
                </button>
              </div>
            </form>
          </section>
        )}

        {selectedUser && (
          <section className={`${styles.panel} ${styles.panelMuted}`}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>{t('edit-user')}</h2>
                <p className={styles.panelSubtitle}>
                  {t('edit-user-desc')}
                </p>
              </div>
            </div>

            <form className={styles.createForm} onSubmit={handleUpdateUser}>
              <div className={styles.formRow}>
                <label className={styles.inputLabel}>{t('email')}</label>
                <div>{selectedUser.email || selectedUser.displayName || t('unknown')}</div>
              </div>

              <div className={styles.formRow}>
                <label className={styles.inputLabel} htmlFor="edit-password">
                  {t('change-password')}
                </label>
                <input
                  id="edit-password"
                  type="password"
                  value={editPassword}
                  onChange={(event) => setEditPassword(event.target.value)}
                  placeholder={t('password-placeholder')}
                  className={styles.inputField}
                />
                <p className={styles.helpText}>{t('password-hint')}</p>
              </div>

              <div className={styles.formRow}>
                <label className={styles.inputLabel} htmlFor="edit-role">
                  {t('role')}
                </label>
                <select
                  id="edit-role"
                  value={editRole}
                  onChange={(event) => setEditRole(event.target.value)}
                  className={styles.selectField}
                >
                  <option value="user">{t('role-user')}</option>
                  <option value="admin">{t('role-admin')}</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <label className={styles.inputLabel} htmlFor="edit-status">
                  {t('status')}
                </label>
                <select
                  id="edit-status"
                  value={editStatus}
                  onChange={(event) => setEditStatus(event.target.value)}
                  className={styles.selectField}
                >
                  <option value="active">{t('status-active')}</option>
                  <option value="disabled">{t('status-disable')}</option>
                </select>
              </div>

              {editError ? (
                <div className={styles.formError}>{editError}</div>
              ) : null}

              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={editingUser}
                >
                  {editingUser ? t('updating-user') : t('save-changes')}
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleDeleteUser}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? t('deleting-user') : t('delete-user')}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className={`${styles.panel} ${styles.panelMuted}`}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>{t('user-dir')}</h2>
              <p className={styles.panelSubtitle}>
                {t('dir-desc')}
              </p>
            </div>
            <div className={styles.searchField}>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('search')}
                className={styles.searchInput}
              />
            </div>
          </div>

          {fetchError ? (
            <div className={styles.emptyText}>{fetchError}</div>
          ) : (
            <div className={styles.userTable}>
              <div className={`${styles.tableRow} ${styles.tableHeader}`}>
                <span>{t('email')}</span>
                <span>{t('role')}</span>
                <span>{t('status')}</span>
                <span>{t('action')}</span>
              </div>

              {fetchingUsers ? (
                <div className={styles.emptyText}>{t('loading')}…</div>
              ) : filteredUsers.length === 0 ? (
                <div className={styles.emptyText}>{t('no-users')}</div>
              ) : (
                filteredUsers.map((userItem) => {
                  const role = userItem.customClaims?.admin ? t('role-admin') : t('role-user');
                  const status = userItem.disabled ? t('status-disable') : t('status-active');
                  return (
                    <div key={userItem.uid} className={styles.tableRow}>
                      <span>{userItem.email || userItem.displayName || t('unknown')}</span>
                      <span>{role}</span>
                      <span>{status}</span>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => handleManageUser(userItem)}
                      >
                        {selectedUser?.uid === userItem.uid ? t('close') : t('action-bttn')}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
