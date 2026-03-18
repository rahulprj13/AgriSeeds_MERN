import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
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
  const navigate = useNavigate();

  // Slider Data
  const seedPackages = [
    {
      image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2070",
      tag: "100% Organic",
      title: "Premium Vegetable Seeds",
    },
    {
      image: "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?q=80&w=1974",
      tag: "Lab Tested",
      title: "High Yielding Seeds",
    },
    {
      image: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=2000",
      tag: "Fast Delivery",
      title: "Start Your Home Garden",
    }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/products`);
        setFeaturedProducts(res.data.slice(0, 8));
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
      <div className="relative w-full min-h-[60vh] bg-[#041d14] flex items-center py-10 overflow-hidden">
        
        {/* Background Blur Design */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-green-500/5 rounded-l-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDE: Swiper Slider (Takes 7/12 columns) */}
          <div className="lg:col-span-7 relative h-[450px] lg:h-[550px] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
            <Swiper
              modules={[Autoplay, Pagination, EffectFade]}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              loop={true}
              className="w-full h-full"
            >
              {seedPackages.map((item, index) => (
                <SwiperSlide key={index}>
                  <div className="w-full h-full relative group">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-10">
                      <span className="text-green-400 font-bold uppercase tracking-widest text-sm mb-2">{item.tag}</span>
                      <h2 className="text-white text-4xl font-black leading-tight max-w-md">{item.title}</h2>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* RIGHT SIDE: 2 Static Images (Takes 5/12 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Top Static Banner */}
            <div className="relative h-[215px] lg:h-[263px] rounded-[2rem] overflow-hidden group shadow-xl">
               <img src="https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?q=80&w=2000" alt="Pesticides" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
               <div className="absolute inset-0 bg-black/40 flex items-center justify-end p-8">
                  <div className="text-right">
                    <span className="bg-green-600 text-white text-[10px] px-3 py-1 rounded-full uppercase font-bold">New Arrivals</span>
                    <h3 className="text-white text-2xl font-black mt-2">Pesticides</h3>
                  </div>
               </div>
            </div>

            {/* Bottom Static Banner */}
            <div className="relative h-[215px] lg:h-[263px] rounded-[2rem] overflow-hidden group shadow-xl">
               <img src="https://images.unsplash.com/photo-1628352081506-83c43123ed6d?q=80&w=2000" alt="Fertilizers" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
               <div className="absolute inset-0 bg-black/40 flex items-center justify-end p-8">
                  <div className="text-right">
                    <span className="bg-yellow-500 text-black text-[10px] px-3 py-1 rounded-full uppercase font-bold">Best Quality</span>
                    <h3 className="text-white text-2xl font-black mt-2">Fertilizers</h3>
                  </div>
               </div>
            </div>
          </div>

        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .swiper-pagination-bullet { background: #22c55e !important; width: 10px; height: 10px; }
          .swiper-pagination-bullet-active { width: 30px; border-radius: 5px; }
        `}} />
      </div>

      {/* --- OUR COLLECTION --- */}
      <div className="max-w-7xl mx-auto py-24 px-6 group">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <span className="w-8 h-0.5 bg-green-500"></span>
            <span className="text-[20px] font-black tracking-[0.3em] text-green-600 uppercase">Our Collection</span>
          </div>
          
          {/* Custom Navigation Icons */}
          <div className="flex gap-3">
            <button className="prev-btn w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all cursor-pointer">
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button className="next-btn w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all cursor-pointer">
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-green-600/20 border-t-green-600 rounded-full animate-spin" />
          </div>
        ) : (
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={{
              prevEl: ".prev-btn",
              nextEl: ".next-btn",
            }}
            autoplay={{ delay: 5000 }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 4 },
            }}
            className="pb-10"
          >
            {featuredProducts.map((product) => (
              <SwiperSlide key={product._id}>
                <ProductCard product={product} navigate={navigate} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
      {/* --- CATEGORY SECTION --- */}
      <div className="bg-gray-50 py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl font-black text-gray-800 mb-16">Shop By Category</h2>
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-10">
            {categories.map((cat, index) => (
                <div key={index} className="group bg-white rounded-[2.5rem] p-10 transition-all duration-500 hover:shadow-2xl border border-slate-100">
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
      <div className="bg-[#f8f9fa] py-12 border-y border-gray-100">
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
          className={`flex items-center justify-center gap-5 py-6 px-4 ${
            i !== 3 ? "lg:border-r border-gray-200" : ""
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

    </div>
  );
};

export default Home;