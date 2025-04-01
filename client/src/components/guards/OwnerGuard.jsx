import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { AuthContext } from "../../contexts/AuthContext";

const OwnerGuard = () => {
    const { id } = useParams();
    const { user, hasUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        const checkOwnership = async () => {
            try {
                if (!hasUser || !user?.uid) {
                    setIsOwner(false);
                    setLoading(false);
                    return;
                }

                const docRef = doc(db, "cars", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const carData = docSnap.data();
                    setIsOwner(carData.ownerId === user.uid);
                } else {
                    console.warn("Car not found.");
                    setIsOwner(false);
                }

                setLoading(false);
            } catch (err) {
                console.error("Error checking ownership:", err);
                setIsOwner(false);
                setLoading(false);
            }
        };

        checkOwnership();
    }, [id, hasUser, user]);

    if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
    console.warn("❌ NOT OWNER: redirecting to /403");
    if (!isOwner) return <Navigate to="/403" replace />;

    return <Outlet />;
};

export default OwnerGuard;
