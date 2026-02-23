import React from "react";
import img from "../../assets/Images/background3.jpg";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSeedling,
  faTractor,
  faRocket,
  faCheckCircle,
  faTruckFast,
  faComments,
  faLeaf
} from "@fortawesome/free-solid-svg-icons";

const About = () => {
  return (
    <div className="bg-gray-50">

      {/* 🔥 HERO SECTION */}
      <div
        className="relative h-100 flex items-center justify-center text-white text-center bg-cover bg-center"
        style={{ backgroundImage: `url(${img})` }}
      >
        <div className="absolute inset-0 bg-linear-to-r from-black/70 to-green-900/60"></div>

        <div className="relative z-10 px-6">
          <h1 className="text-5xl font-extrabold drop-shadow-lg">
            About SeedStore
          </h1>

          <p className="mt-4 text-xl flex items-center justify-center gap-3 text-green-200">
            Growing the Future with Quality Seeds
            <FontAwesomeIcon icon={faSeedling} />
          </p>
        </div>
      </div>


      {/* 🌱 COMPANY INTRO */}
      <div className="max-w-6xl mx-auto py-20 px-6 text-center">
        <h2 className="text-4xl font-extrabold mb-8">
          Who We Are
        </h2>

        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          SeedStore is dedicated to empowering farmers, gardeners, and
          agriculture enthusiasts with premium quality seeds. We focus on
          sustainability, innovation, and ensuring high crop productivity
          through trusted agricultural solutions.
        </p>
      </div>


      {/* 🚜 MISSION & VISION */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-10">

          <div className="bg-white p-10 rounded-3xl shadow-md hover:shadow-2xl transition duration-300 text-center">
            <FontAwesomeIcon icon={faTractor} className="text-green-600 text-5xl"/>
            <h3 className="text-2xl font-bold mt-6">Our Mission</h3>
            <p className="mt-4 text-gray-600">
              To empower farmers with premium seeds and modern agricultural
              solutions that increase crop productivity and profitability.
            </p>
          </div>

          <div className="bg-white p-10 rounded-3xl shadow-md hover:shadow-2xl transition duration-300 text-center">
            <FontAwesomeIcon icon={faRocket} className="text-green-600 text-5xl"/>
            <h3 className="text-2xl font-bold mt-6">Our Vision</h3>
            <p className="mt-4 text-gray-600">
              To become a trusted global seed distribution platform promoting
              innovation, sustainability, and food security for future generations.
            </p>
          </div>

        </div>
      </div>


      {/* 🌿 WHY CHOOSE US */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-4xl font-extrabold text-center mb-16">
            Why Choose Us?
          </h2>

          <div className="grid md:grid-cols-3 gap-10 text-center">

            {[
              {
                icon: faCheckCircle,
                title: "High Quality Seeds",
                desc: "Carefully tested seeds ensuring maximum germination rate."
              },
              {
                icon: faTruckFast,
                title: "Fast Delivery",
                desc: "Quick and secure shipping directly to your doorstep."
              },
              {
                icon: faComments,
                title: "Expert Support",
                desc: "Professional farming guidance from experienced experts."
              }
            ].map((item, i) => (
              <div
                key={i}
                className="bg-gray-50 p-8 rounded-3xl shadow-md hover:shadow-xl transition duration-300"
              >
                <FontAwesomeIcon icon={item.icon} className="text-green-600 text-5xl"/>
                <h4 className="text-xl font-bold mt-6">{item.title}</h4>
                <p className="mt-3 text-gray-600">{item.desc}</p>
              </div>
            ))}

          </div>
        </div>
      </div>


      {/* 🌾 FARMER SUPPORT SECTION */}
      <div className="bg-linear-to-r from-green-700 to-green-600 text-white py-20 text-center px-6">
        <h2 className="text-4xl font-extrabold flex items-center justify-center gap-3">
          Supporting Farmers, Growing Together
          <FontAwesomeIcon icon={faLeaf} />
        </h2>

        <p className="max-w-3xl mx-auto text-lg mt-6 text-green-100">
          Farmers are the backbone of our nation. We simplify seed purchasing
          while offering trusted products that ensure better harvests and
          sustainable growth.
        </p>
      </div>


      {/* 🚀 CALL TO ACTION */}
      <div className="max-w-6xl mx-auto py-20 px-6 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-xl">
          <h2 className="text-3xl font-extrabold">
            Ready to Grow With Us?
          </h2>

          <p className="mt-4 text-gray-600 text-lg">
            Explore our premium seed collection and start your farming journey today.
          </p>

          <button className="mt-8 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg shadow-lg transition duration-300 hover:scale-105">
            Shop Now
          </button>
        </div>
      </div>

    </div>
  );
};

export default About;