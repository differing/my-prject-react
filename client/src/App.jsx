import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";

import { AuthProvider } from "./contexts/AuthContext";
import styles from "./App.module.css";

function App() {
  return (
    <AuthProvider>
      <div id="page-content" className={styles["page-content"]}>
        <Header />
        <Main />
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
