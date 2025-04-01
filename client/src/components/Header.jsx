import { Link } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';

import { AuthContext } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

import styles from './Header.module.css';

const Header = () => {
  const { user, hasUser, onLogout } = useContext(AuthContext);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUsername = async () => {
      if (user?.uid) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            setUsername(data.username || user.email);
          } else {
            setUsername(user.email);
          }
        } catch (err) {
          console.error('Error fetching username:', err);
          setUsername(user.email);
        }
      }
    };

    if (hasUser) {
      fetchUsername();
    } else {
      setUsername('');
    }
  }, [hasUser, user]);

  const logoutHandler = async (e) => {
    e.preventDefault();
    try {
      await onLogout();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <header>
      <Link to="/" className={styles['title-logo']}>
        <img src="/static/images/logo.png" alt="Logo" />
        <span>Used Cars Market</span>
      </Link>

      {hasUser && (
        <div className={styles["user-info"]}>
          <img
            src="/static/images/profilePic.png"
            alt="Avatar"
            className={styles["avatar"]}
          />
          <span>
            Welcome, <strong>{username}</strong>
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className={`${styles['main-nav']} ${styles['nav-mid']}`}>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/search">Search</Link></li>
          <li><Link to="/catalog">Catalog</Link></li>

          {hasUser ? (
            <>
              <li><Link to="/create">Publish</Link></li>
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/auth/logout" onClick={logoutHandler}>Logout</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/auth/login">Login</Link></li>
              <li><Link to="/auth/register">Register</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;

