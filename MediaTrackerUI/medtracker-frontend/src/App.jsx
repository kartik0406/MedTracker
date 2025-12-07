import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MedicinesList from "./pages/MedicinesList";
import MedicineForm from "./pages/MedicineForm";
import About from "./pages/About";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/medicines"
          element={
            <ProtectedRoute>
              <Layout>
                <MedicinesList />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/medicines/add"
          element={
            <ProtectedRoute>
              <Layout>
                <MedicineForm mode="create" />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/medicines/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <MedicineForm mode="edit" />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <Layout>
                <About />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
