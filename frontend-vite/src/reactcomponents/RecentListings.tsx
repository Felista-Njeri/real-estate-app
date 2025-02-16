import apartment from "../../public/images/apartment.jpg";
import countryhome from "../../public/images/countryhome.jpg";

const RecentListings = () => {
  return (
    <> 
      {/* THIRD DIV */}
      <h1 className="text-center text-4xl font-bold pt-20">Recent Listings</h1>
      <h3 className='text-center text-xl pt-2'>Browse the recent real estate properties</h3>

      <div className="flex flex-wrap gap-10 justify-center py-12">

        <div className="card bg-base-100 w-96 shadow-xl">
          <figure>
            <img src={apartment} alt="apartment" layout="responsive" />
          </figure>
          <div className="card-body">
            <h2 className="card-title">
              Nairobi Office Building
              <div className="badge badge-primary">NEW</div>
            </h2>
            <p>Westlands, Nairobi</p>
            <div className="card-actions justify-end">
              <div className="badge badge-outline">Office</div>
              <div className="badge badge-outline">Building</div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 w-96 shadow-xl">
          <figure>
            <img src={countryhome} alt="apartment" layout="responsive" />
          </figure>
          <div className="card-body">
            <h2 className="card-title">
              Shoes!
              <div className="badge badge-secondary">NEW</div>
            </h2>
            <p>If a dog chews shoes whose shoes does he choose?</p>
            <div className="card-actions justify-end">
              <div className="badge badge-outline">Fashion</div>
              <div className="badge badge-outline">Products</div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 w-96 shadow-xl">
          <figure>
            <img src={countryhome} alt="apartment" layout="responsive" />
          </figure>
          <div className="card-body">
            <h2 className="card-title">
              Shoes!
              <div className="badge badge-secondary">NEW</div>
            </h2>
            <p>If a dog chews shoes whose shoes does he choose?</p>
            <div className="card-actions justify-end">
              <div className="badge badge-outline">Fashion</div>
              <div className="badge badge-outline">Products</div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 w-96 shadow-xl">
          <figure>
            <img src={countryhome} alt="apartment" layout="responsive" />
          </figure>
          <div className="card-body">
            <h2 className="card-title">
              Shoes!
              <div className="badge badge-secondary">NEW</div>
            </h2>
            <p>If a dog chews shoes whose shoes does he choose?</p>
            <div className="card-actions justify-end">
              <div className="badge badge-outline">Fashion</div>
              <div className="badge badge-outline">Products</div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 w-96 shadow-xl">
          <figure>
            <img src={countryhome} alt="apartment" layout="responsive" />
          </figure>
          <div className="card-body">
            <h2 className="card-title">
              Shoes!
              <div className="badge badge-secondary">NEW</div>
            </h2>
            <p>If a dog chews shoes whose shoes does he choose?</p>
            <div className="card-actions justify-end">
              <div className="badge badge-outline">Fashion</div>
              <div className="badge badge-outline">Products</div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 w-96 shadow-xl">
          <figure>
            <img src={countryhome} alt="apartment" layout="responsive" />
          </figure>
          <div className="card-body">
            <h2 className="card-title">
              Shoes!
              <div className="badge badge-secondary">NEW</div>
            </h2>
            <p>If a dog chews shoes whose shoes does he choose?</p>
            <div className="card-actions justify-end">
              <div className="badge badge-outline">Fashion</div>
              <div className="badge badge-outline">Products</div>
            </div>
          </div>
        </div>

      </div>
      
      <a href="/properties"><button className="btn btn-primary ml-96">Explore Properties</button></a>
    </>
  )
}

export default RecentListings