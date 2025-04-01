import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../contexts/AuthContext";

import styles from "./DecoratePage.module.css";
import tooltipStyles from "./Tooltip.module.css";

const checkBoxesInitialState = {
  '4WD': false,
  'airbag': false,
  'air-conditioning': false,
  'alloy-wheels': false,
  'bluetooth': false,
  'cd': false,
  'cruise-control': false,
  'keyless': false,
  'led': false,
  'navigation': false,
  'parking-assist': false,
  'rain-sensor': false,
  'seat-heating': false,
  'usb': false,
};

const equipmentIcons = {
  '4WD': 'https://i.postimg.cc/XYsy7r2w/4x4.png',
  'airbag': 'https://i.postimg.cc/28FZMch9/airbag.png',
  'air-conditioning': 'https://i.postimg.cc/8zp6SRbp/aircon.png',
  'alloy-wheels': 'https://i.postimg.cc/5tjQHfGD/alloy-wheel.png',
  'bluetooth': 'https://i.postimg.cc/hGwzTHRv/bluetooth.png',
  'cd': 'https://i.postimg.cc/Wzcdfg3P/cd.png',
  'cruise-control': 'https://i.postimg.cc/qR3tLjpL/cruise-control.png',
  'keyless': 'https://i.postimg.cc/7h15vhGJ/keyless.png',
  'led': 'https://i.postimg.cc/tCy133w3/led-light.png',
  'navigation': 'https://i.postimg.cc/yYPDvJCw/navigation.png',
  'parking-assist': 'https://i.postimg.cc/RZZN8MMq/parking-assist.png',
  'rain-sensor': 'https://i.postimg.cc/x1pcVWC5/rain-sensor.png',
  'seat-heating': 'https://i.postimg.cc/MGhHvV1j/seat-heat.png',
  'usb': 'https://i.postimg.cc/jjWCxZnb/usb-drive.png',
};

const DecoratePage = () => {
  const navigateFunc = useNavigate();
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [car, setCar] = useState({});
  const [equipment, setEquipment] = useState(checkBoxesInitialState);
  const [equipmentDesc, setEquipmentDesc] = useState({});

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const carRef = doc(db, "cars", id);
        const carSnap = await getDoc(carRef);
        if (carSnap.exists()) {
          const carData = carSnap.data();
          setCar(carData);
          const equipmentIds = carData.equipmentId || [];
          const selectedEquipment = {};
          equipmentIds.forEach(eId => {
            selectedEquipment[eId] = true;
          });
          setEquipment(prevState => ({
            ...prevState,
            ...selectedEquipment
          }));
        } else {
          navigateFunc('/404');
        }
      } catch (err) {
        console.error("Error fetching car data:", err);
        navigateFunc('/404');
      }
    };

    const fetchEquipment = async () => {
      try {
        const equipmentRef = doc(db, "equipment", "list");
        const equipmentSnap = await getDoc(equipmentRef);
        if (equipmentSnap.exists()) {
          const equipmentData = equipmentSnap.data();
          setEquipmentDesc(equipmentData);
        }
      } catch (err) {
        console.error("Error fetching equipment data:", err);
      }
    };

    fetchCar();
    fetchEquipment();
  }, [id, navigateFunc]);

  const checkBoxSwitcher = (e) => {
    const { name, checked } = e.target;
    setEquipment(prevState => ({
      ...prevState,
      [name]: checked
    }));
  };

  const confirmEquipment = async (e) => {
    e.preventDefault();

    const selected = Object.entries(equipment).filter(([_, value]) => value).map(([key]) => key);
    const updatedCar = { ...car, equipmentId: selected };

    try {
      const carRef = doc(db, "cars", id);
      await updateDoc(carRef, updatedCar);
      navigateFunc(`/details/${id}`);
    } catch (err) {
      console.error("Error updating car with selected equipment:", err);
    }
  };

  return (
    <section id="decorate-section">
      <h1 className={styles.item}>Decorate {car.make} {car.model}</h1>
      <div className={`${styles.item} ${styles.padded}`}>
        <main className={`${styles.layout} ${styles.right} ${styles.large}`}>
          <div className={styles.col}>
            <img src={car.image} className={styles["img-large"]} alt="Car" />
          </div>
          <div className={`${styles.content} ${styles["pad-med"]}`}>
            <p>Equipment:</p>
            <form onSubmit={confirmEquipment}>
              <ul className={styles.catalog}>
                {Object.keys(checkBoxesInitialState).map((key) => (
                  <li key={key} className={tooltipStyles["custom-tooltip"]}>
                    <label>
                      <input
                        type="checkbox"
                        name={key}
                        checked={equipment[key]}
                        onChange={checkBoxSwitcher}
                      />
                      <img
                        className={styles["facility-icon"]}
                        src={equipmentIcons[key]}
                        alt={key}
                      />
                      {key.replace(/-/g, " ").toUpperCase()}
                      <ul>
                        <li className={tooltipStyles["custom-tooltip-text"]}>{equipmentDesc[key]}</li>
                      </ul>
                    </label>
                  </li>
                ))}
              </ul>
              <button className={styles.action}>Confirm Equipment</button>
              <Link className={styles.action} to={`/details/${id}`}>Back to Details</Link>
            </form>
          </div>
        </main>
      </div>
    </section>
  );
};

export default DecoratePage;
