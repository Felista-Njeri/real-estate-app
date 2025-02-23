import CallToAction from "@/reactcomponents/CallToAction";
import Features from "@/reactcomponents/Features";
import Hero from "@/reactcomponents/Hero";
import RecentListings from "@/reactcomponents/RecentListings";

function Home() {
  return (
    <>
      <Hero />
      <Features />
      <RecentListings />
      <CallToAction />
    </>
  );
}

export default Home;
