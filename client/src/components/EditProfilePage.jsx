import { useContext, useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { db } from "../firebase";
import styles from "./ProfilePage.module.css";

const EditProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    location: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setFormData(userSnap.data());
        }
      } catch (err) {
        console.error("❌ Error loading profile:", err);
      }
    };

    loadProfile();
  }, [user]);

  const onChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      await setDoc(doc(db, "users", user.uid), formData);
      navigate("/profile");
    } catch (err) {
      console.error("❌ Error saving profile:", err);
    }
  };

  if (!user) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <section className={styles.item}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Edit Profile</h2>
      <form onSubmit={onSubmit} className={styles["pad-med"]} style={{ maxWidth: "400px", margin: "0 auto" }}>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          Username:
          <input
            name="username"
            value={formData.username}
            onChange={onChange}
            required
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.2rem" }}
          />
        </label>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          Phone:
          <input
            name="phone"
            value={formData.phone}
            onChange={onChange}
            required
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.2rem" }}
          />
        </label>
        <label style={{ display: "block", marginBottom: "1rem" }}>
          Location:
          <input
            name="location"
            value={formData.location}
            onChange={onChange}
            required
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.2rem" }}
          />
        </label>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
          <button className={styles["action"]}>💾 Save</button>
          <Link to="/profile" className={styles["action"]}>← Back to Profile</Link>
        </div>
      </form>
    </section>
  );
};

export default EditProfilePage;
