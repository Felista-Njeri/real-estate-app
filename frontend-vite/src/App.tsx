import InvestorDashboard from "./pages/InvestorDashboard.tsx";
import PropertyDetails from "./pages/PropertyDetails.tsx";
import Properties from "./pages/Properties.tsx";
import Home from "./pages/Home.tsx";
import Tokenize from "./pages/Tokenize.tsx";
import PropertyOwner from "./pages/PropertyOwner.tsx";
import NotFound from "./pages/NotFound.tsx";
import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "@/components/ui/toaster"; 
function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tokenize" element={<Tokenize />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route path="/dashboard" element={<InvestorDashboard />} />
        <Route path="/admin" element={<PropertyOwner />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    <Toaster />
    </>
  );
}

export default App;
