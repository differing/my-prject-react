import { Link } from "react-router-dom";
import { useState, useContext } from "react";

import { AuthContext } from "../contexts/AuthContext";
import Errors from "./Errors";

import styles from "./LoginPage.module.css";

const formInitialState = {
  email: "",
  password: "",
};

const LoginPage = () => {
  const { onLogin } = useContext(AuthContext);

  const [formValues, setFormValues] = useState(formInitialState);
  const [showErrorFields, setshowErrorFields] = useState(formInitialState);
  const [showErrorBox, setShowErrorBox] = useState(formInitialState);

  const changeHandler = (e) => {
    setFormValues((state) => ({
      ...state,
      [e.target.name]: e.target.value,
    }));
    formFieldsValidator(e);
  };

  const loginHandler = async (e) => {
    setshowErrorFields(formInitialState);
    setShowErrorBox(formInitialState);
    e.preventDefault();

    const trimmed = Object.fromEntries(
      Object.entries(formValues).map(([k, v]) => [k, v.trim()])
    );

    try {
      entireFormValidator(trimmed);
      await onLogin(trimmed); // Firebase login
    } catch (err) {
      const message = err?.message || "Login failed!";
      setShowErrorBox((state) => ({
        ...state,
        message,
      }));
    }
  };

  function formFieldsValidator(e) {
    const currField = e.target.name;
    const currFieldValue = e.target.value;

    setshowErrorFields((state) => ({
      ...state,
      [currField]: currFieldValue === "" ? `${currField} is required!` : "",
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
      throw new Error("All fields are required!");
    }
  }

  return (
    <section id="login-section">
      <h1 className={styles["item"]}>Login</h1>
      <div className={styles["padded"]}>
        <main className={`${styles["item"]} ${styles["align-center"]}`}>
          <form
            className={`${styles["layout"]} ${styles["left"]} ${styles["large"]}`}
            method="post"
            onSubmit={loginHandler}
          >
            {showErrorBox && Object.values(showErrorBox).some((v) => v) && (
              <div className={styles["error-box"]}>
                {Object.entries(showErrorBox).map(([key, msg]) =>
                  msg ? <Errors key={key} errMessage={msg} /> : null
                )}
              </div>
            )}

            <div className={styles["aligned"]}>
              <label>
                <span>Email</span>
                <input
                  type="text"
                  name="email"
                  value={formValues.email}
                  className={
                    showErrorFields["email"] && styles["field-error"]
                  }
                  onChange={changeHandler}
                />
              </label>
              <label>
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  value={formValues.password}
                  className={
                    showErrorFields["password"] && styles["field-error"]
                  }
                  onChange={changeHandler}
                />
              </label>
            </div>

            <input
              className={`${styles["cta"]} ${styles["action"]}`}
              type="submit"
              value="Sign In"
            />
          </form>
        </main>
        <footer>
          Don&apos;t have an account?{" "}
          <Link to="/auth/register">Sign up here</Link>
        </footer>
      </div>
    </section>
  );
};

export default LoginPage;
