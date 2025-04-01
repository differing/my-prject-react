import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import styles from "./RegisterPage.module.css";
import Errors from "./Errors";

const formInitialState = {
  email: "",
  username: "",
  phone: "",
  location: "",
  password: "",
  repass: "",
};

const RegisterPage = () => {
  const { onRegister } = useContext(AuthContext);
  const [formValues, setFormValues] = useState(formInitialState);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");

  const changeHandler = (e) => {
    setFormValues((state) => ({
      ...state,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    for (const [key, value] of Object.entries(formValues)) {
      if (!value.trim()) newErrors[key] = `${key} is required!`;
    }

    if (formValues.password !== formValues.repass) {
      newErrors.repass = "Passwords don't match!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const registerHandler = async (e) => {
    e.preventDefault();
    setGlobalError("");

    if (!validate()) return;

    try {
      await onRegister(formValues);
    } catch (err) {
      setGlobalError(err.message || "Registration failed!");
    }
  };

  return (
    <section id="register-section">
      <h1 className={styles.item}>Register</h1>
      <div className={styles.padded}>
        <main className={`${styles.item} ${styles["align-center"]}`}>
          <form
            className={`${styles.layout} ${styles.left} ${styles.large}`}
            onSubmit={registerHandler}
          >
            {globalError && <Errors errMessage={globalError} />}

            <div className={styles.aligned}>
              {["email", "username", "phone", "location", "password", "repass"].map((field) => (
                <label key={field}>
                  <span>{field.charAt(0).toUpperCase() + field.slice(1)}</span>
                  <input
                    type={field.includes("pass") ? "password" : "text"}
                    name={field}
                    value={formValues[field]}
                    onChange={changeHandler}
                    className={errors[field] ? styles["field-error"] : ""}
                  />
                  {errors[field] && <Errors errMessage={errors[field]} />}
                </label>
              ))}
            </div>

            <input
              className={`${styles.cta} ${styles.action}`}
              type="submit"
              value="Sign Up"
            />
          </form>
        </main>
        <footer>
          Already have an account? <Link to="/auth/login">Sign in here</Link>
        </footer>
      </div>
    </section>
  );
};

export default RegisterPage;
