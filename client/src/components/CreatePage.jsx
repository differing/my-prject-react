import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../contexts/AuthContext";
import Errors from "./Errors";
import styles from "./CreatePage.module.css";

const formInitialState = {
  make: "",
  model: "",
  mileage: "",
  fuel: "",
  horsePower: "",
  engineSize: "",
  year: "",
  location: "",
  image: "",
  price: "",
  description: "",
  equipmentId: [],
};

const CreatePage = () => {
  const navigateFunc = useNavigate();
  const { user } = useContext(AuthContext);

  const [formValues, setFormValues] = useState(formInitialState);
  const [showErrorFields, setshowErrorFields] = useState(formInitialState);
  const [showErrorBox, setShowErrorBox] = useState(
    Object.fromEntries(Object.entries(formInitialState).slice(0, 9))
  );

  const changeHandler = (e) => {
    setFormValues((state) => ({
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

    try {
      const trimmed = {};
      Object.entries(formValues).forEach(([key, value]) => {
        trimmed[key] = key !== "equipmentId" ? value.trim() : value;
      });

      entireFormValidator(trimmed);

      const carData = {
        ...trimmed,
        mileage: Number(trimmed.mileage),
        horsePower: Number(trimmed.horsePower),
        engineSize: Number(trimmed.engineSize),
        year: Number(trimmed.year),
        price: Number(trimmed.price),
        ownerId: user?.uid || "anonymous",
        ownerEmail: user?.email || "unknown",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "cars"), carData);

      resetFormHandler();
      navigateFunc(`/details/${docRef.id}`);
    } catch (err) {
      console.error("❌ Error creating car:", err.message);
    }
  };

  function formFieldsValidator(e) {
    const field = e.target.name;
    const value = e.target.value;

    setshowErrorFields((state) => ({
      ...state,
      [field]: value === "" ? `${field} is required!` : "",
    }));
  }

  function entireFormValidator(values) {
    const errors = {};
    for (const [key, value] of Object.entries(values)) {
      errors[key] = value === "" ? `${key} is required!` : "";
    }

    setshowErrorFields((state) => ({ ...state, ...errors }));
    setShowErrorBox((state) => ({ ...state, ...errors }));

    if (Object.values(errors).some((v) => v)) {
      throw Error("All fields are required!");
    }
  }

  return (
    <section>
      <form onSubmit={publishHandler} className={styles["form-container"]}>
        <h1>Publish Ad</h1>

        {showErrorBox && Object.values(showErrorBox).some((v) => v) && (
          <div className={styles["error-box"]}>
            {Object.entries(showErrorBox).map(
              ([key, msg]) => msg && <Errors key={key} errMessage={msg} />
            )}
          </div>
        )}

        {[
          ["Make", "make"],
          ["Model", "model"],
          ["Mileage", "mileage", "number"],
          ["Fuel", "fuel"],
          ["Horse Power", "horsePower", "number"],
          ["Engine Size (cc)", "engineSize", "number"],
          ["Year", "year", "number"],
          ["Location", "location"],
          ["Image", "image"],
          ["Price", "price", "number"],
        ].map(([label, name, type = "text"]) => (
          <div className={styles["form-group"]} key={name}>
            <label>{label}</label>
            <input
              type={type}
              name={name}
              value={formValues[name]}
              onChange={changeHandler}
              className={
                showErrorFields[name] ? styles["field-error"] : undefined
              }
            />
          </div>
        ))}

        <div className={styles["form-group"]}>
          <label>Description</label>
          <textarea
            name="description"
            value={formValues.description}
            onChange={changeHandler}
            className={
              showErrorFields["description"] ? styles["field-error"] : undefined
            }
          ></textarea>
        </div>

        <button type="submit" className={styles["button-submit"]}>
          Publish Item
        </button>
      </form>
    </section>
  );
};

export default CreatePage;
