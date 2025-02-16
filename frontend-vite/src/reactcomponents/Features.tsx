import { LuBuilding2, LuCoins, LuKey, LuUsers } from "react-icons/lu";

const Features = () => {
    const features = [
        {
          icon: <LuBuilding2 className="h-6 w-6 text-sage-600" />,
          title: "Property Tokenization",
          description: "Convert your real estate assets into digital tokens on the blockchain.",
        },
        {
          icon: <LuCoins className="h-6 w-6 text-sage-600" />,
          title: "Fractional Ownership",
          description: "Invest in properties with minimal capital through fractional ownership.",
        },
        {
          icon: <LuKey className="h-6 w-6 text-sage-600" />,
          title: "Secure Transactions",
          description: "All transactions are secured by blockchain technology and smart contracts.",
        },
        {
          icon: <LuUsers className="h-6 w-6 text-sage-600" />,
          title: "Community Governance",
          description: "Participate in property decisions through our governance system.",
        },
      ];


      return (
        <div className="animate-fadeIn">      
    
          {/* Features Section */}
          <section className="py-24 ">
            <div className="container px-4 mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800">
                Why Choose PropChain?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="glass-card p-6 rounded-xl hover-transform"
                  >
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
    
          {/* CTA Section */}
          <section className="py-24 bg-gradient-to-r from-sage-100 to-terra-100">
            <div className="container px-4 mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">
                Ready to Start Investing?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of investors already benefiting from tokenized real estate
              </p>
              <a
                 href="/user/profile"
                className="px-8 py-3 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors inline-block"
              >
                Start Investing Now
              </a>
              
            </div>
          </section>
        </div>
      );
}

export default Features