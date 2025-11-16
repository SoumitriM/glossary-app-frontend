import Glossary from "./Glossary";
import Layout from "./Layout";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <>
      <Layout>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected route */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Glossary />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>


      <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastStyle={{
          width: "50rem",         
          maxWidth: "90%",        
          fontSize: "1rem",        
          textAlign: "center",     
        }}
      />
    </>
  );
}
