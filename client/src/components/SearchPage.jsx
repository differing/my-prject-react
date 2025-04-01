import { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import CatalogItem from "./CatalogItem";
import styles from "./SearchPage.module.css";

const formInitialState = {
  make: "",
  model: "",
  from: "",
  to: "",
};

const SearchPage = () => {
  const [formValues, setFormValues] = useState(formInitialState);
  const [cars, setCars] = useState([]);

  const changeHandler = (e) => {
    const { name, value } = e.target;

    setFormValues((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "from" && +value > +prev.to) {
        updated.to = value;
      } else if (name === "to" && +value < +prev.from) {
        updated.from = value;
      }

      return updated;
    });
  };

  const searchHandler = async (e) => {
    e.preventDefault();

    const make = formValues.make.trim().toLowerCase();
    const model = formValues.model.trim().toLowerCase();
    const fromYear = parseInt(formValues.from) || 1900;
    const toYear = parseInt(formValues.to) || 2025;

    try {
      const snapshot = await getDocs(collection(db, "cars"));
      const allCars = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filtered = allCars.filter((car) => {
        const carMake = car.make?.toLowerCase() || "";
        const carModel = car.model?.toLowerCase() || "";
        const carYear = Number(car.year) || 0;

        return (
          (!car.isSold) && // 👈 Покажи само налични коли
          (!make || carMake.includes(make)) &&
          (!model || carModel.includes(model)) &&
          carYear >= fromYear &&
          carYear <= toYear
        );
      });

      setCars(filtered);
    } catch (err) {
      console.error("Error searching cars:", err);
    }
  };

  return (
    <>
      <section id="search-section">
        <h1 className={styles.item}>Search Form</h1>
        <div className={styles.padded}>
          <main className={`${styles.item} ${styles["align-center"]}`}>
            <form
              className={`${styles.layout} ${styles.left} ${styles.large}`}
              onSubmit={searchHandler}
            >
              <div className={styles.aligned}>
                <label>
                  <span>Make</span>
                  <input
                    type="text"
                    name="make"
                    placeholder="Make..."
                    value={formValues.make}
                    onChange={changeHandler}
                  />
                </label>
                <label>
                  <span>Model</span>
                  <input
                    type="text"
                    name="model"
                    placeholder="Model..."
                    value={formValues.model}
                    onChange={changeHandler}
                  />
                </label>
                <label>
                  <span>Year</span>
                  <input
                    type="number"
                    name="from"
                    placeholder="From..."
                    value={formValues.from}
                    onChange={changeHandler}
                    min={1900}
                    max={2025}
                  />
                </label>
                <label>
                  <span>Year</span>
                  <input
                    type="number"
                    name="to"
                    placeholder="To..."
                    value={formValues.to}
                    onChange={changeHandler}
                    min={1900}
                    max={2025}
                  />
                </label>
                <input
                  className={`${styles.cta} ${styles.action}`}
                  type="submit"
                  value="Search"
                />
              </div>
            </form>
          </main>
        </div>
      </section>

      <section id="catalog-section" className={styles.spaced}>
        <h1 className={styles.item}>Search Results</h1>
        <ul className={`${styles.catalog} ${styles.cards}`}>
          {cars.map((car) => (
            <CatalogItem key={car.id} {...car} _id={car.id} />
          ))}
        </ul>
        {cars.length === 0 && (
          <main className={`${styles.item} ${styles["align-center"]}`}>
            <p><strong>No Results!</strong></p>
          </main>
        )}
      </section>
    </>
  );
};

export default SearchPage;
