import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import Errors from "./Errors";
import { AuthContext } from "../contexts/AuthContext";

import styles from "./CreatePage.module.css";

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

const CreatePage = () => {
    const navigateFunc = useNavigate();
    const { user } = useContext(AuthContext);

    const [formValues, setFormValues] = useState(formInitialState);
    const [showErrorFields, setshowErrorFields] = useState(formInitialState);
    const [showErrorBox, setShowErrorBox] = useState(Object.fromEntries(Object.entries(formInitialState).slice(0, 9)));

    const changeHandler = (e) => {
        setFormValues(state => ({
            ...state,
            [e.target.name]: e.target.value,
        }));
        formFieldsValidator(e);
    };

    const resetFormHandler = () => {
        setFormValues(formInitialState);
    };

    const publishHandler = async (e) => {
        e.preventDefault();

        const trimedFormValues = {};
        Object.entries(formValues).forEach(([key, value]) => {
            trimedFormValues[key] = key !== 'equipmentId' ? value.trim() : value;
        });

        const options = {
            method: 'POST',
            headers: {
                'X-Authorization': user['accessToken'],
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(trimedFormValues)
        };

        try {
            entireFormValidator(trimedFormValues);

            const response = await fetch('http://localhost:3030/data/cars', options);

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const newCar = await response.json();

            if (!newCar._id) {
                console.error('⚠️ Сървърът не върна _id:', newCar);
                return navigateFunc('/404');
            }

            resetFormHandler();
            navigateFunc(`/details/${newCar._id}`);
        } catch (err) {
            console.error(err.message);
        }
    };

    function formFieldsValidator(e) {
        const currField = e.target.name;
        const currFieldValue = e.target.value;

        setshowErrorFields(state => ({
            ...state,
            [currField]: currFieldValue === '' ? `${currField} is required!` : ''
        }));
    }

    function entireFormValidator(trimedFormValues) {
        const errors = {};
        for (const [key, value] of Object.entries(trimedFormValues)) {
            errors[key] = value === '' ? `${key} is required!` : '';
        }

        setshowErrorFields(state => ({ ...state, ...errors }));
        setShowErrorBox(state => ({ ...state, ...errors }));

        if (Object.values(errors).some(v => v)) {
            throw Error('All fields are required!');
        }
    }

    return (
        <section id="create-section">
            <h1 className={styles["item"]}>Publish Ad</h1>
            <main className={`${styles["item"]} ${styles["padded"]} ${styles["align-center"]}`}>
                <form className={`${styles["layout"]} ${styles["left"]} ${styles["large"]}`} method="post" onSubmit={publishHandler}>
                    {showErrorBox && Object.values(showErrorBox).some(v => v) && (
                        <div className={styles["error-box"]}>
                            {Object.entries(showErrorBox).map(([key, msg]) =>
                                <Errors key={key} errMessage={msg} />
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
                        <label><span>Description</span><textarea name="description" value={formValues.description} className={showErrorFields['description'] && styles["field-error"]} onChange={changeHandler}></textarea></label>
                        <div className={styles["align-center"]}>
                            <input className={styles["action"]} type="submit" value="Publish Item" />
                        </div>
                    </div>
                </form>
            </main>
        </section>
    );
};

export default CreatePage;
