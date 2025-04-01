import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../contexts/AuthContext";
import styles from "./EditPage.module.css";

const formInitialState = {
    make: '',
    model: '',
    mileage: '',
    fuel: '',
    year: '',
    location: '',
    image: '',
    price: '',
    horsePower: '',
    engineSize: '',
    description: '',
    equipmentId: []
};

const EditPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { id } = useParams();

    const [formValues, setFormValues] = useState(formInitialState);
    const [showErrorFields, setshowErrorFields] = useState({});
    const [showErrorBox, setShowErrorBox] = useState({});

    useEffect(() => {
        const fetchCar = async () => {
            try {
                const docRef = doc(db, "cars", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const carData = docSnap.data();
                    setFormValues(carData);
                } else {
                    navigate("/404");
                }
            } catch (err) {
                console.error("Грешка при зареждане на колата:", err);
                navigate("/404");
            }
        };

        fetchCar();
    }, [id, navigate]);

    const changeHandler = (e) => {
        setFormValues(state => ({
            ...state,
            [e.target.name]: e.target.value,
        }));
        formFieldsValidator(e);
    };

    const updateHandler = async (e) => {
        e.preventDefault();
        const trimedFormValues = {};

        // Правим проверка дали стойността е стринг, преди да приложим trim()
        Object.entries(formValues).forEach(([key, value]) => {
            if (typeof value === 'string') {
                trimedFormValues[key] = value.trim();
            } else {
                trimedFormValues[key] = value;
            }
        });

        const options = {
            method: 'PUT',
            headers: { 'X-Authorization': user['accessToken'], 'Content-Type': 'application/json' },
            body: {}
        };

        try {
            entireFormValidator(trimedFormValues);
            const { make, model, mileage, fuel, year, location, image, price, description, equipmentId } = trimedFormValues;
            options.body = JSON.stringify({ make, model, mileage, fuel, year, location, image, price, description, equipmentId });

            const carRef = doc(db, "cars", id);
            await updateDoc(carRef, trimedFormValues);

            navigate(`/details/${id}`);
        } catch (err) {
            console.log(err.message);
        }
    };

    function formFieldsValidator(e) {
        const currField = e.target.name;
        const currFieldValue = e.target.value;
        if (currFieldValue === '') {
            setshowErrorFields(state => ({
                ...state,
                [currField]: `${currField} is required!`
            }));
        } else {
            setshowErrorFields(state => ({
                ...state,
                [currField]: ''
            }));
        }
    }

    function entireFormValidator(trimedFormValues) {
        const errors = {};
        for (const [key, value] of Object.entries(trimedFormValues)) {
            if (value === '') {
                errors[key] = `${key} is required!`;
            } else {
                errors[key] = '';
            }
        }

        setshowErrorFields(state => ({
            ...state,
            ...errors
        }));

        setShowErrorBox(state => ({
            ...state,
            ...errors
        }));
        if (Object.values(errors).some(v => v)) {
            throw Error('All fields are required!');
        }
    }

    if (!formValues) return <p style={{ textAlign: "center" }}>Loading...</p>;

    return (
        <section id="create-section">
            <h1 className={styles["item"]}>Edit Ad</h1>
            <main className={`${styles["item"]} ${styles["padded"]} ${styles["align-center"]}`}>
                <form className={`${styles["layout"]} ${styles["left"]} ${styles["large"]}`} method="post" onSubmit={updateHandler}>
                    {showErrorBox && Object.values(showErrorBox).some(v => v) && (
                        <div className={styles["error-box"]}>
                            {Object.entries(showErrorBox).map((err) =>
                                <div key={err[0]}>{err[1]}</div>
                            )}
                        </div>
                    )}
                    <div className={`${styles["col"]} ${styles["aligned"]}`}>
                        <label><span>Make</span><input type="text" name="make" value={formValues.make} className={showErrorFields['make'] && styles["field-error"]} onChange={changeHandler} /></label>
                        <label><span>Model</span><input type="text" name="model" value={formValues.model} className={showErrorFields['model'] && styles["field-error"]} onChange={changeHandler} /></label>
                        <label><span>Mileage</span><input type="number" name="mileage" value={formValues.mileage} className={showErrorFields['mileage'] && styles["field-error"]} onChange={changeHandler} /></label>
                        <label><span>Fuel</span><input type="text" name="fuel" value={formValues.fuel} className={showErrorFields['fuel'] && styles["field-error"]} onChange={changeHandler} /></label>
                        <label><span>Horse Power</span><input type="number" name="horsePower" value={formValues.horsePower} onChange={changeHandler} /></label>
                        <label><span>Engine Size (cc)</span><input type="number" name="engineSize" value={formValues.engineSize} onChange={changeHandler} /></label>
                        <label><span>Year</span><input type="number" name="year" value={formValues.year} className={showErrorFields['year'] && styles["field-error"]} onChange={changeHandler} /></label>
                        <label><span>Location</span><input type="text" name="location" value={formValues.location} className={showErrorFields['location'] && styles["field-error"]} onChange={changeHandler} /></label>
                        <label><span>Image</span><input type="text" name="image" value={formValues.image} className={showErrorFields['image'] && styles["field-error"]} onChange={changeHandler} /></label>
                        <label><span>Price</span><input type="number" step="any" name="price" value={formValues.price} className={showErrorFields['price'] && styles["field-error"]} onChange={changeHandler} /></label>
                    </div>
                    <div className={`${styles["content"]} ${styles["pad-med"]} ${styles["align-center"]} ${styles["vertical"]}`}>
                        <label><span>Description</span><textarea name="description" value={formValues.description} className={showErrorFields['description'] && styles["field-error"]} onChange={changeHandler} ></textarea></label>
                        <div className={styles["align-center"]}>
                            <input className={styles["action"]} type="submit" value="Update Item" />
                            <Link className={styles["action"]} to={`/details/${id}`}>Back to Details</Link>
                        </div>
                    </div>
                </form>
            </main>
        </section>
    );
};

export default EditPage;

