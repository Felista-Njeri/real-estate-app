import CallToAction from "@/reactcomponents/CallToAction";
import Features from "@/reactcomponents/Features";
import Hero from "@/reactcomponents/Hero";
import Marketplace from "./Marketplace";

function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Marketplace />
      <CallToAction />
    </>
  );
}

export default Home;
