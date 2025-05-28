import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "@/components/ui/toaster"; 
import InvestorPortfolio from "./pages/InvestorPortfolio";
import PropertyDetails from "./pages/PropertyDetails";
import Marketplace from "./pages/Marketplace";
import Home from "./pages/Home";
import Tokenize from "./pages/Tokenize";
import PropertyOwnerPortfolio from "./pages/PropertyOwnerPortfolio";
import NotFound from "./pages/NotFound";
import Layout from "./Layout";
import InvestorDividendDashboard from "./pages/InvestorDividendDashboard";
import OwnerDividendDashboard from "./pages/OwnerDividendDashboard";

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />} >
          <Route index element={<Home />} />
          <Route path="tokenize" element={<Tokenize />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="marketplace/:id" element={<PropertyDetails />} />
          <Route path="owner-portfolio" element={<PropertyOwnerPortfolio />} />
          <Route path="investor-portfolio" element={<InvestorPortfolio />} />
          <Route path="investor-dividend-dashboard" element={<InvestorDividendDashboard />} />
          <Route path="owner-dividend-dashboard" element={<OwnerDividendDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
    <Toaster />
    </>
  );
}

export default App;
