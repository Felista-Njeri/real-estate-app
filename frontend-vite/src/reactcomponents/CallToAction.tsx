import { Link } from "react-router"

const CallToAction = () => {
  return (
        <section className="py-24 bg-gradient-to-r from-sage-100 to-terra-100">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">
            Ready to Start Investing?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of investors already benefiting from tokenized real estate
          </p>
          <Link to="/marketplace" className="px-8 py-3 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors inline-block">
            Start Investing Now
          </Link> 
        </div>
      </section>
  )
}

export default CallToAction;