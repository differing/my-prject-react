import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase";

import styles from "./CatalogPage.module.css";

const CatalogPage = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "cars"));
                const carsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // ❗️Показваме само коли, които НЕ са продадени
                const availableCars = carsData.filter(car => !car.isSold);
                setCars(availableCars);
                setLoading(false);
            } catch (err) {
                console.error("Грешка при зареждане на коли:", err);
            }
        };

        fetchCars();
    }, []);

    if (loading) return <p style={{ textAlign: "center" }}>Loading cars...</p>;

    return (
        <section id="catalog-section">
            <h1 style={{ textAlign: "center" }}>All Available Cars</h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
                {cars.map(car => (
                    <div key={car.id} style={{ border: "1px solid #ccc", padding: "1rem", width: "250px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                        <img src={car.image} alt={car.model} style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "6px" }} />
                        <h3>{car.make} {car.model}</h3>
                        <p>Year: {car.year}</p>
                        <p>Price: ${car.price}</p>
                        <Link to={`/details/${car.id}`} style={{ textDecoration: "none", color: "#fff", background: "#2d7a91", padding: "0.4rem 0.8rem", borderRadius: "5px", display: "inline-block", marginTop: "0.5rem" }}>View Details</Link>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CatalogPage;
