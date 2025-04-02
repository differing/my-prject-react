import { useState, useEffect, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../contexts/AuthContext";
import styles from "./DetailsPage.module.css";

const DetailsPage = () => {
  const navigate = useNavigate();
  const { user, hasUser } = useContext(AuthContext);
  const { id } = useParams();

  const [car, setCar] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "cars", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return navigate("/404");

        const carData = docSnap.data();
        setCar(carData);

        if (hasUser && carData.ownerId === user.uid) {
          setIsOwner(true);
        }

        //  Брои харесванията
        const likesQ = query(collection(db, "likes"), where("carId", "==", id));
        const allLikes = await getDocs(likesQ);
        setLikesCount(allLikes.size);

        //  Проверка дали user вече е харесал
        if (hasUser && carData.ownerId !== user.uid) {
          const userLikeQ = query(
            collection(db, "likes"),
            where("carId", "==", id),
            where("userId", "==", user.uid)
          );
          const likeSnap = await getDocs(userLikeQ);
          setLiked(!likeSnap.empty);
        }
      } catch (err) {
        console.error("❌ Error loading details:", err);
        navigate("/404");
      }
    };

    if (hasUser) fetchData();
  }, [id, hasUser, user, navigate]);

  const deleteHandler = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${car.make} ${car.model}?`);
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "cars", id));
      navigate("/catalog");
    } catch (err) {
      console.error("❌ Error deleting car:", err);
    }
  };

  const handleBuyCar = async () => {
    const confirmBuy = window.confirm(`Are you sure you want to buy ${car.make} ${car.model}?`);
    if (!confirmBuy) return;

    try {
      await updateDoc(doc(db, "cars", id), {
        buyerId: user.uid,
        buyerEmail: user.email,
        isSold: true,
      });

      alert("✅ Car purchased successfully!");
      navigate("/profile");
    } catch (err) {
      console.error("❌ Error purchasing car:", err);
      alert("Something went wrong.");
    }
  };

  const handleLikeToggle = async () => {
    try {
      const likeRef = collection(db, "likes");
      const q = query(likeRef, where("carId", "==", id), where("userId", "==", user.uid));
      const likeSnap = await getDocs(q);

      if (!likeSnap.empty) {
        // Remove like
        await deleteDoc(likeSnap.docs[0].ref);
        setLiked(false);
        setLikesCount((prev) => prev - 1);
      } else {
        // Add like
        await addDoc(likeRef, {
          carId: id,
          userId: user.uid,
          timestamp: new Date(),
        });
        setLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error("❌ Error toggling like:", err);
    }
  };

  if (!car) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <section id="details-section">
      <h1 className={styles.item}>{car.make} {car.model}</h1>
      <div className={`${styles.item} ${styles.padded}`}>
        <main className={`${styles.layout} ${styles.right} ${styles.large}`}>
          <div className={styles.col}>
            <img src={car.image} alt="car" className={styles["img-large"]} />
          </div>
          <div className={`${styles.content} ${styles["pad-med"]}`}>
            <p>Mileage: <strong>{car.mileage} km</strong></p>
            <p>Description: {car.description}</p>
            <div className={styles["align-center"]}>
              <div>Price: <strong>{car.price}$</strong></div>
              <div>Horse Power: <strong>{car.horsePower} hp</strong></div>
              <div>Engine Size: <strong>{car.engineSize} cc</strong></div>
              <div>Fuel: <strong>{car.fuel}</strong></div>
              <div>Year: <strong>{car.year}</strong></div>
              <div>Location: <strong>{car.location}</strong></div>

              {car.equipmentId?.length > 0 && (
                <>
                  <h3 style={{ marginTop: "1rem" }}>Extras:</h3>
                  <ul className={styles["extras-list"]}>
                    {car.equipmentId.map(eq => (
                      <li key={eq}>✅ {eq.replace(/-/g, ' ')}</li>
                    ))}
                  </ul>
                </>
              )}

              {/* ❤️ Лайкове */}
              <p style={{ marginTop: "1rem", fontSize: "1rem", color: "#e91e63" }}>
                ❤️ Liked by <strong>{likesCount}</strong> {likesCount === 1 ? "user" : "users"}
              </p>

              {isOwner ? (
                <>
                  <Link className={styles.action} to={`/details/${id}/edit`}>Edit</Link>
                  <Link className={styles.action} to="#" onClick={deleteHandler}>Delete</Link>
                  <Link className={styles.action} to={`/catalog`}>Back to Catalog</Link>
                  <Link className={styles.action} to={`/details/${id}/decorate`}>Add Extras</Link>
                </>
              ) : (
                <>
                  {!car.isSold && (
                    <button
                      className={styles.action}
                      style={{ backgroundColor: "#4CAF50" }}
                      onClick={handleBuyCar}
                    >
                      Buy this car
                    </button>
                  )}

                  <p style={{ fontWeight: "bold" }}>
                    Contact Owner: {car.ownerEmail || "Not available"}
                  </p>

                  <button
                    className={styles.action}
                    style={{
                      backgroundColor: liked ? "#f44336" : "#2196F3",
                      marginTop: "1rem"
                    }}
                    onClick={handleLikeToggle}
                  >
                    {liked ? "💔 Unlike" : "❤️ Like"}
                  </button>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};

export default DetailsPage;
