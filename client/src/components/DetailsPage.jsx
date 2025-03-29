import { useState, useEffect, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import EquipmentItem from "./EquipmentItem";
import { AuthContext } from "../contexts/AuthContext";
import { OwnerContext } from "../contexts/OwnerContext";

import styles from "./DetailsPage.module.css";

const carDetailsInitialState = {
    isOwner: false,
    canBuy: false
};

const DetailsPage = () => {
    const navigateFunc = useNavigate();
    const { user, hasUser } = useContext(AuthContext);
    const { isOwner } = useContext(OwnerContext);
    const { id } = useParams();

    const [car, setCar] = useState({});
    const [equipment, setEquipment] = useState([]);
    const [sold, setSold] = useState(0);
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [carDetails, setCarDetails] = useState(carDetailsInitialState);

    useEffect(() => {
        const abortController = new AbortController();

        const requests = [
            fetch(`http://localhost:3030/data/cars/${id}`, { signal: abortController.signal }),
            fetch('http://localhost:3030/data/equipment', { signal: abortController.signal }),
            fetch(`http://localhost:3030/data/bought?where=productId%3D%22${id}%22&distinct=_ownerId&count`, { signal: abortController.signal }),
            fetch(`http://localhost:3030/data/likes?where=carId%3D%22${id}%22&distinct=userId&count`, { signal: abortController.signal })
        ];

        Promise.all(requests)
            .then(async ([carRes, equipmentRes, boughtRes, likesRes]) => {
                const carData = await carRes.json();
                const equipmentData = await equipmentRes.json();
                const boughtCount = await boughtRes.json();
                const likesCount = await likesRes.json();

                const equipmentIds = carData.equipmentId || [];
                const selected = equipmentData.filter(e => equipmentIds.includes(e._id));

                setCar(carData);
                setEquipment(selected);
                setSold(boughtCount);
                setLikes(likesCount);

                if (hasUser) {
                    const isOwner = user._id === carData._ownerId;
                    setCarDetails({
                        isOwner,
                        canBuy: !isOwner && boughtCount === 0
                    });

                    // Проверка дали потребителят вече е харесал тази кола
                    const likeCheck = await fetch(`http://localhost:3030/data/likes?where=carId%3D%22${id}%22%20and%20userId%3D%22${user._id}%22`, {
                        headers: {
                            'X-Authorization': user.accessToken
                        }
                    });
                    const likeData = await likeCheck.json();
                    if (likeData.length > 0) {
                        setHasLiked(true);
                    }
                }
            })
            .catch(() => navigateFunc('/404'));

        return () => abortController.abort();
    }, [id, navigateFunc, user, hasUser]);

    const likeHandler = async () => {
        try {
            await fetch('http://localhost:3030/data/likes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Authorization': user.accessToken
                },
                body: JSON.stringify({
                    carId: id,
                    userId: user._id
                })
            });

            setLikes(prev => prev + 1);
            setHasLiked(true);
        } catch (err) {
            console.log("Like error:", err.message);
        }
    };

    const buyHandler = async (e) => {
        e.preventDefault();

        try {
            await fetch('http://localhost:3030/data/bought', {
                method: 'POST',
                headers: {
                    'X-Authorization': user.accessToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId: id })
            });

            await fetch(`http://localhost:3030/data/cars/${id}`, {
                method: 'PUT',
                headers: {
                    'X-Authorization': user.accessToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...car,
                    buyerId: user._id,
                    buyerEmail: user.email,
                    buyerUsername: user.username
                })
            });

            setSold(1);
            setCar(prev => ({
                ...prev,
                buyerId: user._id,
                buyerUsername: user.username,
                buyerEmail: user.email
            }));
            setCarDetails(prev => ({
                ...prev,
                canBuy: false
            }));
        } catch (err) {
            console.log(err.message);
        }
    };

    const deleteHandler = async (e) => {
        e.preventDefault();

        if (!isOwner) return navigateFunc('/auth/login');

        const confirmDelete = confirm(`Are you sure you want to delete ${car.make} ${car.model}?`);
        if (confirmDelete) {
            await fetch(`http://localhost:3030/data/cars/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-Authorization': user.accessToken
                }
            });
            navigateFunc('/catalog');
        }
    };

    return (
        <section id="details-section">
            <h1 className={styles.item}>{car.make} {car.model}</h1>
            <div className={`${styles.item} ${styles.padded}`}>
                <main className={`${styles.layout} ${styles.right} ${styles.large}`}>
                    <div className={styles.col}>
                        <img src={car.image} className={styles["img-large"]} />
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

                            <ul className={styles.catalog}>
                                {equipment.map((e) => (
                                    <EquipmentItem key={e._id} {...e} />
                                ))}
                            </ul>

                            {carDetails.isOwner && !sold && (
                                <>
                                    <Link className={styles.action} to={`/details/${id}/decorate`}>Decorate</Link>
                                    <Link className={styles.action} to={`/details/${id}/edit`}>Edit</Link>
                                    <Link className={styles.action} to={`/details/${id}/delete`} onClick={deleteHandler}>Delete</Link>
                                </>
                            )}

                            {!carDetails.isOwner && carDetails.canBuy && (
                                <Link className={styles.action} to={`/details/${id}/buy`} onClick={buyHandler}>Buy</Link>
                            )}

                            {!carDetails.isOwner && hasUser && !hasLiked && (
                                <button className={styles.action} onClick={likeHandler}>❤️ Like</button>
                            )}

                            {!carDetails.isOwner && hasUser && hasLiked && (
                                <p style={{ fontWeight: "bold", color: "green" }}>
                                    ❤️ You already liked this car
                                </p>
                            )}

                            <p><strong>❤️ Likes: {likes}</strong></p>

                            {hasUser && sold !== 0 && (
                                <div>
                                    <strong>
                                        The car was sold{typeof car.buyerUsername === 'string' ? ` to: ${car.buyerUsername}` : ''}!
                                    </strong>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </section>
    );
};

export default DetailsPage;
