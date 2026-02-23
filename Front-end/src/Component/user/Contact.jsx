import React from "react";
import { useForm } from "react-hook-form";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSeedling,
  faLocationDot,
  faPhone,
  faEnvelope,
  faClock,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";

const Contact = () => {

  const { register, handleSubmit, formState: { errors } } = useForm();

  const validationRules = {
    name: {
      required: "Name is required",
      pattern: {
        value: /^[A-Za-z\s]+$/,
        message: "Only characters allowed",
      },
    },

    email: {
      required: "Email is required",
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Enter a valid email",
      },
    },

    subject: {
      required: "Subject is required",
      minLength: {
        value: 10,
        message: "Minimum 10 characters",
      },
    },

    message: {
      required: "Message is required",
      minLength: {
        value: 100,
        message: "Message must be at least 100 characters",
      },
    },
  };

  const onSubmit = () => {
    alert("Message Sent Successfully...");
  };

  return (
    <div>

      {/* ✅ Hero Section */}
      <div
        className="text-white text-center py-24 px-5"
        style={{
          background:
            "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1464226184884-fa280b87c399')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1 className="font-bold text-5xl flex items-center justify-center gap-3">
          Contact SeedStore 
          <FontAwesomeIcon icon={faSeedling} />
        </h1>

        <p className="text-xl mt-4">
          We are here to help you grow better. Reach out to us anytime!
        </p>
      </div>


      {/* ✅ Contact Section */}
      <div
        className="py-16"
        style={{
          background:
            "linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.75)), url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-12 gap-10">

            {/* Contact Form */}
            <div className="md:col-span-7">
              <div className="p-6 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">

                <h3 className="font-bold mb-6 text-green-400 text-2xl">
                  Send Us a Message
                </h3>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                  {/* Name */}
                  <div>
                    <label className="block text-gray-200 mb-1">Full Name</label>

                    <input
                      {...register("name", validationRules.name)}
                      placeholder="Enter your name"
                      className="w-full p-2 rounded bg-white/80 text-black outline-none"
                    />

                    {errors.name && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-gray-200 mb-1">Email</label>

                    <input
                      {...register("email", validationRules.email)}
                      placeholder="Enter your email"
                      className="w-full p-2 rounded bg-white/80 text-black outline-none"
                    />

                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-gray-200 mb-1">Subject</label>

                    <input
                      {...register("subject", validationRules.subject)}
                      placeholder="Subject"
                      className="w-full p-2 rounded bg-white/80 text-black outline-none"
                    />

                    {errors.subject && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-gray-200 mb-1">Message</label>

                    <textarea
                      rows="5"
                      {...register("message", validationRules.message)}
                      placeholder="Write your message..."
                      className="w-full p-2 rounded bg-white/80 text-black outline-none"
                    />

                    {errors.message && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  {/* Button */}
                  <button className="bg-green-600 w-full py-2 rounded mt-3 text-white font-bold hover:bg-green-700 transition flex items-center justify-center gap-2">
                    <FontAwesomeIcon icon={faPaperPlane} />
                    Send Message
                  </button>

                </form>
              </div>
            </div>


            {/* Contact Info */}
            <div className="md:col-span-5">
              <div className="p-6 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl text-white">

                <h3 className="font-bold text-green-400 mb-6 text-2xl">
                  Contact Information
                </h3>

                <p className="mb-4 flex gap-3">
                  <FontAwesomeIcon icon={faLocationDot} className="mt-1 text-green-400"/>
                  <span>
                    <strong>Address:</strong><br />
                    SeedStore Pvt. Ltd.<br />
                    Ahmedabad, Gujarat, India
                  </span>
                </p>

                <p className="mb-4 flex gap-3">
                  <FontAwesomeIcon icon={faPhone} className="mt-1 text-green-400"/>
                  <span>
                    <strong>Phone:</strong><br />
                    +91 98765 43210
                  </span>
                </p>

                <p className="mb-4 flex gap-3">
                  <FontAwesomeIcon icon={faEnvelope} className="mt-1 text-green-400"/>
                  <span>
                    <strong>Email:</strong><br />
                    support@seedstore.com
                  </span>
                </p>

                <p className="mb-4 flex gap-3">
                  <FontAwesomeIcon icon={faClock} className="mt-1 text-green-400"/>
                  <span>
                    <strong>Working Hours:</strong><br />
                    Monday - Saturday: 9 AM – 7 PM
                  </span>
                </p>

                <hr className="my-4 border-white/30" />

                <h5 className="font-bold mb-2">Why Contact Us?</h5>

                <ul className="list-disc pl-5 space-y-1">
                  <li>High-quality certified seeds</li>
                  <li>Fast delivery across India</li>
                  <li>Expert farming guidance</li>
                  <li>Easy return policy</li>
                </ul>

              </div>
            </div>

          </div>
        </div>
      </div>


      {/* ✅ Google Map */}
      <div className="w-full mb-12">
        <iframe
          title="map"
          src="https://maps.google.com/maps?q=Ahmedabad&t=&z=13&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="400"
          style={{ border: 0 }}
          loading="lazy"
        ></iframe>
      </div>

    </div>
  );
};

export default Contact;