import InvestorPortfolio from "./pages/InvestorPortfolio.tsx";
import PropertyDetails from "./pages/PropertyDetails.tsx";
import Marketplace from "./pages/Marketplace.tsx";
import Home from "./pages/Home.tsx";
import Tokenize from "./pages/Tokenize.tsx";
import PropertyOwner from "./pages/PropertyOwner.tsx";
import NotFound from "./pages/NotFound.tsx";
import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "@/components/ui/toaster"; 
import Layout from "./Layout.tsx";

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />} >
          <Route index element={<Home />} />
          <Route path="/tokenize" element={<Tokenize />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<PropertyDetails />} />
          <Route path="/portfolio" element={<InvestorPortfolio />} />
          <Route path="/my-properties" element={<PropertyOwner />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
    <Toaster />
    </>
  );
}

export default App;
