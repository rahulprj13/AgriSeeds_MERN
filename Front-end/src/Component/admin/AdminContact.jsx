import React, { useState, useEffect, useContext } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Save, Loader } from "lucide-react";

const AdminContact = () => {
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Clean normal text fields
  const cleanText = (value = "") => {
    let text = String(value);

    text = text.replace(/<[^>]*>/g, "");
    text = text.replace(/[<>]/g, "");
    text = text.replace(/[^A-Za-z0-9\s.,\-()&/@:]/g, "");
    text = text.replace(/\s+/g, " ").trimStart();

    return text;
  };

  // Clean email field
  const cleanEmail = (value = "") => {
    let text = String(value);
    text = text.replace(/<[^>]*>/g, "");
    text = text.replace(/[<>]/g, "");
    text = text.replace(/[^A-Za-z0-9@._\-]/g, "");
    return text.trim();
  };

  // Clean phone field
  const cleanPhone = (value = "") => {
    return String(value).replace(/\D/g, "").slice(0, 10);
  };

  // Clean map url
  const cleanMapUrl = (value = "") => {
    let text = String(value);
    text = text.replace(/<[^>]*>/g, "");
    text = text.replace(/[<>]/g, "");
    text = text.replace(/\s/g, "");
    return text;
  };

  const validationRules = {
    companyName: {
      required: "Company name is required*",
      minLength: {
        value: 2,
        message: "Company name must be at least 2 characters*",
      },
      maxLength: {
        value: 80,
        message: "Company name cannot exceed 80 characters*",
      },
      validate: (value) =>
        cleanText(value).trim() === value.trim() ||
        "Unwanted characters are not allowed*",
    },

    address: {
      required: "Address is required*",
      minLength: {
        value: 5,
        message: "Address must be at least 5 characters*",
      },
      maxLength: {
        value: 150,
        message: "Address cannot exceed 150 characters*",
      },
      validate: (value) =>
        cleanText(value).trim() === value.trim() ||
        "Unwanted characters are not allowed*",
    },

    city: {
      required: "City is required*",
      minLength: {
        value: 2,
        message: "City must be at least 2 characters*",
      },
      maxLength: {
        value: 50,
        message: "City cannot exceed 50 characters*",
      },
      pattern: {
        value: /^[A-Za-z\s.-]+$/,
        message: "City can contain only letters*",
      },
      validate: (value) =>
        cleanText(value).trim() === value.trim() ||
        "Unwanted characters are not allowed*",
    },

    state: {
      required: "State is required*",
      minLength: {
        value: 2,
        message: "State must be at least 2 characters*",
      },
      maxLength: {
        value: 50,
        message: "State cannot exceed 50 characters*",
      },
      pattern: {
        value: /^[A-Za-z\s.-]+$/,
        message: "State can contain only letters*",
      },
      validate: (value) =>
        cleanText(value).trim() === value.trim() ||
        "Unwanted characters are not allowed*",
    },

    country: {
      required: "Country is required*",
      minLength: {
        value: 2,
        message: "Country must be at least 2 characters*",
      },
      maxLength: {
        value: 50,
        message: "Country cannot exceed 50 characters*",
      },
      pattern: {
        value: /^[A-Za-z\s.-]+$/,
        message: "Country can contain only letters*",
      },
      validate: (value) =>
        cleanText(value).trim() === value.trim() ||
        "Unwanted characters are not allowed*",
    },

    phone: {
      required: "Phone number is required*",
      pattern: {
        value: /^[6-9][0-9]{9}$/,
        message: "Enter a valid 10-digit phone number*",
      },
      minLength: {
        value: 10,
        message: "Phone number must be 10 digits*",
      },
      maxLength: {
        value: 10,
        message: "Phone number cannot exceed 10 digits*",
      },
    },

    email: {
      required: "Email is required*",
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Enter a valid email address*",
      },
      validate: (value) =>
        cleanEmail(value) === value.trim() ||
        "Unwanted characters are not allowed*",
    },

    workingHours: {
      required: "Working hours are required*",
      minLength: {
        value: 5,
        message: "Working hours must be at least 5 characters*",
      },
      maxLength: {
        value: 100,
        message: "Working hours cannot exceed 100 characters*",
      },
      validate: (value) =>
        cleanText(value).trim() === value.trim() ||
        "Unwanted characters are not allowed*",
    },

    mapEmbedUrl: {
      required: "Google map embed URL is required*",
      pattern: {
        value: /^https?:\/\/.+/i,
        message: "Enter a valid URL*",
      },
      validate: (value) =>
        cleanMapUrl(value) === value.trim() ||
        "Unwanted characters are not allowed*",
    },
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      companyName: "SeedStore",
      address: "",
      city: "",
      state: "",
      country: "India",
      phone: "",
      email: "",
      workingHours: "Monday - Saturday: 9 AM – 7 PM",
      mapEmbedUrl: "",
    },
  });

  const formValues = watch();

  // Fetch contact info
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await axios.get("/api/contact");

        reset({
          companyName: res.data.companyName || "SeedStore",
          address: res.data.address || "",
          city: res.data.city || "",
          state: res.data.state || "",
          country: res.data.country || "India",
          phone: res.data.phone || "",
          email: res.data.email || "",
          workingHours: res.data.workingHours || "Monday - Saturday: 9 AM – 7 PM",
          mapEmbedUrl: res.data.mapEmbedUrl || "",
        });
      } catch (err) {
        console.error("Error fetching contact:", err);
        toast.error("Failed to fetch contact information");
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true);

    const payload = {
      companyName: cleanText(data.companyName).trim(),
      address: cleanText(data.address).trim(),
      city: cleanText(data.city).trim(),
      state: cleanText(data.state).trim(),
      country: cleanText(data.country).trim(),
      phone: cleanPhone(data.phone),
      email: cleanEmail(data.email),
      workingHours: cleanText(data.workingHours).trim(),
      mapEmbedUrl: cleanMapUrl(data.mapEmbedUrl).trim(),
    };

    try {
      const res = await axios.put("/api/admin/contact", payload);

      reset({
        companyName: res.data.contact?.companyName || payload.companyName,
        address: res.data.contact?.address || payload.address,
        city: res.data.contact?.city || payload.city,
        state: res.data.contact?.state || payload.state,
        country: res.data.contact?.country || payload.country,
        phone: res.data.contact?.phone || payload.phone,
        email: res.data.contact?.email || payload.email,
        workingHours: res.data.contact?.workingHours || payload.workingHours,
        mapEmbedUrl: res.data.contact?.mapEmbedUrl || payload.mapEmbedUrl,
      });

      toast.success("Contact information updated successfully!");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to update contact information";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Contact Information</h1>
        <p className="text-slate-600 mt-2">
          Manage your company's contact details that appear on user-facing pages
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl p-8 border border-slate-200/50 space-y-6"
      >
        {/* Company Name */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Company Name
          </label>
          <input
            type="text"
            {...register("companyName", validationRules.companyName)}
            onChange={(e) =>
              setValue("companyName", cleanText(e.target.value).slice(0, 80), {
                shouldValidate: true,
              })
            }
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.companyName
                ? "border-red-400 focus:ring-red-400"
                : "border-slate-200 focus:ring-green-500"
            }`}
            placeholder="Enter company name"
          />
          {errors.companyName && (
            <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Address Line
          </label>
          <input
            type="text"
            {...register("address", validationRules.address)}
            onChange={(e) =>
              setValue("address", cleanText(e.target.value).slice(0, 150), {
                shouldValidate: true,
              })
            }
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.address
                ? "border-red-400 focus:ring-red-400"
                : "border-slate-200 focus:ring-green-500"
            }`}
            placeholder="Enter address"
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            City
          </label>
          <input
            type="text"
            {...register("city", validationRules.city)}
            onChange={(e) =>
              setValue("city", cleanText(e.target.value).slice(0, 50), {
                shouldValidate: true,
              })
            }
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.city
                ? "border-red-400 focus:ring-red-400"
                : "border-slate-200 focus:ring-green-500"
            }`}
            placeholder="Enter city"
          />
          {errors.city && (
            <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            State
          </label>
          <input
            type="text"
            {...register("state", validationRules.state)}
            onChange={(e) =>
              setValue("state", cleanText(e.target.value).slice(0, 50), {
                shouldValidate: true,
              })
            }
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.state
                ? "border-red-400 focus:ring-red-400"
                : "border-slate-200 focus:ring-green-500"
            }`}
            placeholder="Enter state"
          />
          {errors.state && (
            <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>
          )}
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Country
          </label>
          <input
            type="text"
            {...register("country", validationRules.country)}
            onChange={(e) =>
              setValue("country", cleanText(e.target.value).slice(0, 50), {
                shouldValidate: true,
              })
            }
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.country
                ? "border-red-400 focus:ring-red-400"
                : "border-slate-200 focus:ring-green-500"
            }`}
            placeholder="Enter country"
          />
          {errors.country && (
            <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            {...register("phone", validationRules.phone)}
            onChange={(e) =>
              setValue("phone", cleanPhone(e.target.value), {
                shouldValidate: true,
              })
            }
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.phone
                ? "border-red-400 focus:ring-red-400"
                : "border-slate-200 focus:ring-green-500"
            }`}
            placeholder="Enter phone number"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Email Address
          </label>
          <input
            type="email"
            {...register("email", validationRules.email)}
            onChange={(e) =>
              setValue("email", cleanEmail(e.target.value), {
                shouldValidate: true,
              })
            }
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.email
                ? "border-red-400 focus:ring-red-400"
                : "border-slate-200 focus:ring-green-500"
            }`}
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Working Hours */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Working Hours
          </label>
          <input
            type="text"
            {...register("workingHours", validationRules.workingHours)}
            onChange={(e) =>
              setValue("workingHours", cleanText(e.target.value).slice(0, 100), {
                shouldValidate: true,
              })
            }
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.workingHours
                ? "border-red-400 focus:ring-red-400"
                : "border-slate-200 focus:ring-green-500"
            }`}
            placeholder="e.g., Monday - Saturday: 9 AM – 7 PM"
          />
          {errors.workingHours && (
            <p className="text-red-500 text-xs mt-1">{errors.workingHours.message}</p>
          )}
        </div>

        {/* Map URL */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Google Map Embed URL
          </label>
          <textarea
            rows="3"
            {...register("mapEmbedUrl", validationRules.mapEmbedUrl)}
            onChange={(e) =>
              setValue("mapEmbedUrl", cleanMapUrl(e.target.value), {
                shouldValidate: true,
              })
            }
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
              errors.mapEmbedUrl
                ? "border-red-400 focus:ring-red-400"
                : "border-slate-200 focus:ring-green-500"
            }`}
            placeholder="Paste your Google Maps embed URL here"
          />
          {errors.mapEmbedUrl && (
            <p className="text-red-500 text-xs mt-1">{errors.mapEmbedUrl.message}</p>
          )}
          <p className="text-xs text-slate-500 mt-2">
            You can get this from Google Maps by clicking Share → Embed a map
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving || !isValid}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader className="animate-spin" size={18} />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preview */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200/50">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Preview</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
            <h3 className="font-bold text-green-600 mb-4 text-lg">Contact Information</h3>

            <div className="space-y-3 text-sm text-slate-700">
              <p>
                <strong>Company:</strong> {formValues.companyName}
              </p>
              <p>
                <strong>Address:</strong> {formValues.address}, {formValues.city},{" "}
                {formValues.state}, {formValues.country}
              </p>
              <p>
                <strong>Phone:</strong> {formValues.phone}
              </p>
              <p>
                <strong>Email:</strong> {formValues.email}
              </p>
              <p>
                <strong>Hours:</strong> {formValues.workingHours}
              </p>
            </div>
          </div>

          {formValues.mapEmbedUrl && (
            <div className="rounded-xl overflow-hidden border-2 border-green-200 h-64">
              <iframe
                title="location-map"
                src={formValues.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContact;