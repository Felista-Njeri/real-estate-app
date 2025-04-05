import { Link } from "react-router"

const Hero = () => {
  return (
    <>
     <div
     className="hero min-h-screen"
     style={{
       backgroundImage: "url('/apartment.jpg')",
     }}
   >
     <div className="hero-overlay bg-opacity-60"></div>
     <div className="hero-content text-neutral-content text-center">
       <div className="">
         <h1 className="text-4xl md:text-6xl font-bold mb-6">Transforming Real Estate Investment </h1>
         <p className="text-xl md:text-2x mb-8 max-w-2xl mx-auto">
           Join the future of property investment with blockchain technology
         </p>
         <div className="flex flex-col sm:flex-row gap-4 justify-center">
         <Link to="/marketplace" className="px-8 py-3 bg-sage-600 rounded-lg hover:bg-sage-700 transition-colors">Explore Properties</Link>
         <Link to="/tokenize" className="px-8 py-3 bg-white text-sage-600 border border-sage-600 rounded-lg hover:bg-sage-100 transition-colors">Tokenize Property</Link>
         </div>
       </div>
     </div>
   </div>
   </>
  )
}

export default Hero