import React from "react";
import { NavLink, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCarrot,
  faAppleWhole,
  faSeedling,
  faTruck,
  faCreditCard,
  faHeadset,
  faWheatAwn,
  faMoneyBillWave
} from "@fortawesome/free-solid-svg-icons";

const Home = () => {

  const catObj = [
    { name: "Vegetable Seeds", icon: faCarrot, catName: "vegetable" },
    { name: "Fruit Seeds", icon: faAppleWhole, catName: "fruits" },
    { name: "Flower Seeds", icon: faSeedling, catName: "flowers" }
  ];

  return (
    <div className="bg-gray-50">

      {/* 🔥 HERO SECTION */}
      <div className="relative bg-linear-to-r from-green-700 via-green-600 to-green-500 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto py-24 px-6 grid lg:grid-cols-2 gap-12 items-center">

          <div>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-lg">
              Grow Your Dream Garden 🌱
            </h1>

            <p className="mt-6 text-lg text-green-100 max-w-lg">
              Premium quality seeds with high germination rate.
              Start planting happiness today!
            </p>

            <Link
              to="/user/category/vegetable"
              className="inline-block mt-8 bg-white text-green-700 font-semibold px-8 py-3 rounded-full shadow-lg hover:scale-105 transition duration-300"
            >
              Shop Now
            </Link>
          </div>

          <div>
            <img
              src="https://images.unsplash.com/photo-1592150621744-aca64f48394a"
              alt="Seeds"
              className="rounded-3xl shadow-2xl hover:scale-105 transition duration-500"
            />
          </div>

        </div>
      </div>


      {/* 🌿 SHOP BY CATEGORY */}
      <div className="max-w-7xl mx-auto py-24 px-6">
        <h2 className="text-center text-4xl font-extrabold mb-16">
          Shop By Category
        </h2>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-10">

          {catObj.map((cat, index) => (
            <div
              key={index}
              className="group bg-white rounded-3xl p-10 text-center shadow-md hover:shadow-2xl transition duration-300 hover:-translate-y-2"
            >
              <div className="w-20 h-20 mx-auto flex items-center justify-center bg-green-100 rounded-full group-hover:bg-green-600 transition">
                <FontAwesomeIcon
                  icon={cat.icon}
                  className="text-green-600 text-4xl group-hover:text-white transition"
                />
              </div>

              <h3 className="mt-6 text-xl font-bold">
                {cat.name}
              </h3>

              <NavLink
                to={`/user/category/${cat.catName}`}
                className="inline-block mt-6 text-green-600 font-semibold hover:underline"
              >
                Explore →
              </NavLink>
            </div>
          ))}

        </div>
      </div>


      {/* 🚚 SERVICES SECTION */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">

          <h2 className="text-center text-4xl font-extrabold mb-16">
            Why Shop With Us?
          </h2>

          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-10">

            {[
              { icon: faTruck, title: "Free Delivery", desc: "On orders above ₹5000" },
              { icon: faSeedling, title: "High Germination", desc: "Tested premium seeds" },
              { icon: faCreditCard, title: "Secure Payment", desc: "Safe & easy checkout" },
              { icon: faHeadset, title: "24/7 Support", desc: "Always here to help" }
            ].map((service, i) => (

              <div
                key={i}
                className="bg-gray-50 p-8 rounded-2xl text-center shadow hover:shadow-xl transition duration-300"
              >
                <FontAwesomeIcon
                  icon={service.icon}
                  className="text-green-600 text-5xl"
                />

                <h4 className="mt-5 font-bold text-lg">
                  {service.title}
                </h4>

                <p className="mt-2 text-gray-500">
                  {service.desc}
                </p>
              </div>
            ))}

          </div>
        </div>
      </div>


      {/* 💰 DISCOUNT SECTION */}
      <div className="bg-linear-to-r from-gray-900 to-gray-800 text-white py-24 text-center">
        <h2 className="text-4xl font-extrabold">
          Get 20% Off On Your First Order!
        </h2>

        <p className="mt-4 text-green-400 text-lg">
          Use code: <span className="font-bold">SEED2026</span>
        </p>

        <Link
          to="/user/category/vegetable"
          className="inline-block mt-8 bg-green-600 hover:bg-green-700 px-8 py-3 rounded-full text-lg shadow-lg transition"
        >
          Start Shopping
        </Link>
      </div>


      {/* 🌟 CTA SECTION */}
      <div className="py-24 text-center bg-gray-50">
        <h2 className="text-4xl font-extrabold">
          Ready to Grow Something Amazing?
        </h2>

        <p className="mt-4 text-gray-600 text-lg">
          Join thousands of happy gardeners today.
        </p>

        <Link
          to="/signup"
          className="inline-block mt-8 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full shadow-lg transition"
        >
          Create Account
        </Link>
      </div>

    </div>
  );
};

export default Home;