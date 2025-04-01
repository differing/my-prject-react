import { useEffect, useState, useContext } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { db } from "../firebase";
import ProfileItem from "./ProfileItem";
import styles from "./ProfilePage.module.css";

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [publishedCars, setPublishedCars] = useState([]);
  const [likedCars, setLikedCars] = useState([]);
  const [purchasedCars, setPurchasedCars] = useState([]);

  // 🔵 Зареждане на потребителска информация
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user?.uid) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserInfo(userDoc.data());
        }
      } catch (err) {
        console.error("❌ Error loading user info:", err);
      }
    };

    fetchUserInfo();
  }, [user]);

  // 🟢 Публикувани коли
  useEffect(() => {
    if (!user?.uid) return;

    const fetchPublishedCars = async () => {
      try {
        const carsRef = collection(db, "cars");
        const q = query(carsRef, where("ownerId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const carList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPublishedCars(carList);
      } catch (err) {
        console.error("❌ Error loading published cars:", err);
      }
    };

    fetchPublishedCars();
  }, [user]);

  // ❤️ Харесани коли
  useEffect(() => {
    if (!user?.uid) return;

    const fetchLikedCars = async () => {
      try {
        const likesRef = collection(db, "likes");
        const q = query(likesRef, where("userId", "==", user.uid));
        const likeSnapshot = await getDocs(q);

        const likedCarIds = likeSnapshot.docs.map(doc => doc.data().carId);

        const likedCarsData = await Promise.all(
          likedCarIds.map(async (carId) => {
            const carDoc = await getDoc(doc(db, "cars", carId));
            if (carDoc.exists()) {
              return {
                id: carId,
                ...carDoc.data(),
              };
            }
            return null;
          })
        );

        const filtered = likedCarsData.filter(Boolean);
        setLikedCars(filtered);
      } catch (err) {
        console.error("❌ Error loading liked cars:", err);
      }
    };

    fetchLikedCars();
  }, [user]);

  // 🟣 Купени коли
  useEffect(() => {
    if (!user?.uid) return;

    const fetchPurchasedCars = async () => {
      try {
        const carsRef = collection(db, "cars");
        const q = query(carsRef, where("buyerId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const cars = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPurchasedCars(cars);
      } catch (err) {
        console.error("❌ Error loading purchased cars:", err);
      }
    };

    fetchPurchasedCars();
  }, [user]);

  return (
    <section id="profile-section">
      <h1 className={styles.item}>User Profile</h1>

      <div className={`${styles.item} ${styles.padded}`}>
        <main className={`${styles.item} ${styles["pad-large"]} ${styles["align-center"]}`}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              <img src="/static/images/profilePic.png" alt="Profile" />
            </div>
            <h2>{user.email}</h2>
            {userInfo && (
              <>
                <p><strong>Username:</strong> {userInfo.username}</p>
                <p><strong>Phone:</strong> {userInfo.phone}</p>
                <p><strong>Location:</strong> {userInfo.location}</p>
              </>
            )}
            <button
              className={styles.action}
              style={{ marginTop: "1rem" }}
              onClick={() => navigate("/profile/edit")}
            >
              ✏️ Edit Profile
            </button>
          </div>
        </main>
      </div>

      {/* 🟢 Published */}
      <h2 className={styles["section-title"]}>Published Cars</h2>
      <div className={styles.board}>
        {publishedCars.length > 0 ? (
          publishedCars.map(car => (
            <div key={car.id}>
              <ProfileItem {...car} _id={car.id} />
              {car.buyerEmail && (
                <p style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: 'green',
                  marginTop: '0.5rem'
                }}>
                  ✅ Sold to: <strong>{car.buyerEmail}</strong>
                </p>
              )}
            </div>
          ))
        ) : (
          <p className={styles["align-center"]}>No published cars yet.</p>
        )}
      </div>

      {/* 🟣 Purchased */}
      <h2 className={styles["section-title"]}>Purchased Cars</h2>
      <div className={styles.board}>
        {purchasedCars.length > 0 ? (
          purchasedCars.map(car => (
            <ProfileItem key={car.id} {...car} _id={car.id} />
          ))
        ) : (
          <p className={styles["align-center"]}>You haven't bought any cars yet.</p>
        )}
      </div>

      {/* ❤️ Liked */}
      <h2 className={styles["section-title"]} style={{ marginTop: "2rem" }}>Liked Cars</h2>
      <div className={styles.board}>
        {likedCars.length > 0 ? (
          likedCars.map(car => (
            <ProfileItem key={car.id} {...car} _id={car.id} />
          ))
        ) : (
          <p className={styles["align-center"]}>You haven’t liked any cars yet.</p>
        )}
      </div>
    </section>
  );
};

export default ProfilePage;
