import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import img from "../../assets/Images/seeds.jpg";
import img1 from "../../assets/Images/agriseeds.jpeg";
import img2 from "../../assets/Images/background.jpg";
import img3 from "../../assets/Images/background1.jpg";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CategoryContext } from "../context/CategoryContext";
import {
  faTruck, faShieldHalved, faHeadset, faLeaf, faTag, faChevronLeft, faChevronRight
} from "@fortawesome/free-solid-svg-icons";

// Swiper Components aur Modules
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade, Navigation } from "swiper/modules";

// Swiper CSS
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css/navigation";

import ProductCard from "./ProductCard";

const API_URL = "http://localhost:5000";

const Home = () => {
  const { categories } = useContext(CategoryContext);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const navigate = useNavigate();

  // Slider Data
  const seedPackages = [
    {
      image: img,
      tag: "100% Organic",
      title: "Premium Seeds For Better Farming",
      subtitle: "High-quality organic seeds for stronger roots, healthy crops, and better yield.",
    },
    {
      image: img1,
      tag: "High Yield",
      title: "Grow Faster With Trusted Quality",
      subtitle: "Carefully selected seeds that help improve productivity and support every season.",
    },
    {
      image: img2,
      tag: "Fresh Collection",
      title: "Healthy Crops Start With Best Seeds",
      subtitle: "Choose from reliable seed varieties, fertilizers, and crop care essentials.",
    },
    {
      image: img3,
      tag: "Fast Delivery",
      title: "Everything You Need For Your Farm",
      subtitle: "Discover premium products for planting, growth, and crop protection in one place.",
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/products`);
        setFeaturedProducts(res.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="bg-white text-gray-900 font-sans">

      {/* --- HERO SECTION --- */}
      <div className="relative w-full min-h-[78vh] flex items-center overflow-hidden">
        {/* Full Background Swiper */}
        <div className="absolute inset-0">
          <Swiper
            modules={[Pagination, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            pagination={{ clickable: true }}
            loop={true}
            className="w-full h-full cursor-pointer select-none"
            onSlideChange={(swiper) => setActiveSlide(swiper.realIndex)}
            onSwiper={(swiper) => {
              setActiveSlide(swiper.realIndex);
              swiper.el.onclick = () => swiper.slideNext();
            }}
          >
            {seedPackages.map((item, index) => (
              <SwiperSlide key={index}>
                <div className="relative w-full h-[78vh]">
                  <img
                    src={item.image}
                    alt={`Hero Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/150" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#03140f]/80 via-[#06251b]/45 to-[#041d14]/60" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Overlay Content */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl py-20">
            <span className="inline-flex items-center rounded-full bg-green-500/20 border border-green-400/30 px-4 py-1.5 text-green-300 text-xs md:text-sm font-bold uppercase tracking-[0.25em] backdrop-blur-md">
              {seedPackages[activeSlide]?.tag}
            </span>

            <h1 className="mt-5 text-white text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
              {seedPackages[activeSlide]?.title}
            </h1>

            <p className="mt-5 text-white/85 text-base sm:text-lg leading-relaxed max-w-2xl">
              {seedPackages[activeSlide]?.subtitle}
            </p>

            <p className="mt-4 text-white/70 text-sm font-medium">
              Click anywhere on hero section to view next image
            </p>

          </div>
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
        .swiper-pagination {
          bottom: 24px !important;
        }
        .swiper-pagination-bullet {
          background: rgba(255,255,255,0.55) !important;
          width: 10px;
          height: 10px;
          opacity: 1 !important;
          transition: all 0.3s ease;
        }
        .swiper-pagination-bullet-active {
          background: #22c55e !important;
          width: 28px;
          border-radius: 999px;
        }
      `,
          }}
        />
      </div>

      {/* --- OUR COLLECTION --- */}
      <div className="max-w-[80%] mx-auto py-4 px-2">
        <div className="flex justify-between items-center m-12">
          <div className="flex items-center gap-2">
            <span className="w-8 h-0.5 bg-green-500"></span>
            <span className="text-[29px] font-black tracking-[0.3em] text-green-600 uppercase">
              Our Collection

            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-green-600/20 border-t-green-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product._id} className="h-full">
                <ProductCard product={product} navigate={navigate} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- CATEGORY SECTION --- */}
      <div className="bg-gray-50 py-24 px-6 bg-amber-900">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-black text-gray-800 mb-16">Shop By Category</h2>
          <div className="grid lg:grid-cols-5 md:grid-cols-2 gap-10 cursor-pointer">
            {categories.map((cat, index) => (
              <div key={index} onClick={() => navigate(`/category/${cat.name}`)} className="group bg-white rounded-[2.5rem] p-10 transition-all duration-500 hover:shadow-2xl border border-slate-100 ">
                <div className="w-20 h-20 mx-auto flex items-center justify-center rounded-3xl bg-green-100 text-green-600 mb-6">
                  <FontAwesomeIcon icon={faLeaf} className="text-3xl" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-800">{cat.name}</h3>
                <NavLink to={`/category/${cat.name}`} className="inline-flex items-center mt-6 text-green-600 font-bold">
                  View Now <span className="ml-2">→</span>
                </NavLink>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- SERVICES SECTION --- */}
      <div className="bg-[#e0ece3] py-12 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-center">

            {[
              {
                icon: faTruck,
                title: "FREE DELIVERY",
                desc: "Over Rs.2000"
              },
              {
                icon: faHeadset,
                title: "SUPPORT",
                desc: "9:00 AM to 6:00 PM"
              },
              {
                icon: faShieldHalved, // Image mein Easy Return ka icon hai, yahan shield use kiya hai
                title: "EASY RETURN",
                desc: "7 a day"
              },
              {
                icon: faTag,
                title: "BIG SAVING",
                desc: "Weekend Sale"
              }
            ].map((service, i) => (
              <div
                key={i}
                className={`flex items-center justify-center gap-5 py-6 px-4 ${i !== 3 ? "lg:border-r border-gray-200" : ""
                  } ${i % 2 === 0 && i !== 2 ? "md:border-r lg:border-r-0" : ""}`}
              >
                {/* Icon - Orange color as per image */}
                <div className="text-[#24bb47] text-4xl">
                  <FontAwesomeIcon icon={service.icon} />
                </div>

                {/* Text Content */}
                <div className="flex flex-col">
                  <h4 className="font-black text-[16px] text-gray-800 tracking-tight leading-tight uppercase">
                    {service.title}
                  </h4>
                  <p className="text-gray-500 text-[13px] mt-1 font-medium">
                    {service.desc}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>


      {/* --- PROMO SECTION --- */}
      {/* <div className="max-w-7xl mx-auto my-24 px-6">
        <div className="bg-green-600 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl text-white">
          <h2 className="text-4xl font-black mb-6">Get 20% Off Your First Order</h2>
          <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
            <span className="px-6 py-2 font-mono text-2xl font-bold text-yellow-300">SEED2026</span>
          </div>
        </div>
      </div> */}


    </div>
  );
};

export default Home;