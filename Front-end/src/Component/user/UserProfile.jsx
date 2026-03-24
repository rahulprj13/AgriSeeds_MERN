import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Camera, User, Mail, Phone, Calendar, Shield, CheckCircle, XCircle, Loader2 } from "lucide-react"; // Icons ke liye

const API_URL = "http://localhost:5000";

const UserProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isImageUpload, setIsImageUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    mobile: "",
    email: "",
  });

  useEffect(() => {
    fetchFullProfile();
  }, []);

  const fetchFullProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/user/profile");
      const fullUser = {
        ...response.data,
        profileImage: response.data.profileImage
          ? response.data.profileImage.startsWith("http")
            ? response.data.profileImage
            : `${API_URL}/uploads/${response.data.profileImage}`
          : null,
      };

      setProfile(fullUser);
      setFormData({
        firstname: fullUser.firstname || "",
        lastname: fullUser.lastname || "",
        mobile: fullUser.mobile || "",
        email: fullUser.email || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage("Failed to load profile");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setMessage("Please select a valid image file");
        setMessageType("error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage("Image size should not exceed 5MB");
        setMessageType("error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!formData.firstname.trim() || !formData.lastname.trim() || !formData.mobile.trim()) {
        setMessage("All fields are required");
        setMessageType("error");
        return;
      }
      const response = await axios.put("/user/profile", {
        firstname: formData.firstname,
        lastname: formData.lastname,
        mobile: formData.mobile,
      });

      setProfile(response.data.user);
      setMessage("Profile updated successfully!");
      setMessageType("success");
      setIsEditing(false);
      setUser({ ...user, ...response.data.user });
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update profile");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (e) => {
    e.preventDefault();
    try {
      const fileInput = document.querySelector('input[type="file"]');
      if (!fileInput.files[0]) return;

      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("profileImage", fileInput.files[0]);

      const response = await axios.post("/user/profileimage", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const fetchedUser = response.data.user;
      const imageUrl = fetchedUser.profileImage.startsWith("http") 
        ? fetchedUser.profileImage 
        : `${API_URL}/uploads/${fetchedUser.profileImage}`;

      setProfile({ ...fetchedUser, profileImage: imageUrl });
      setMessage("Profile image updated!");
      setMessageType("success");
      setIsImageUpload(false);
      setImagePreview(null);
      setUser({ ...user, profileImage: imageUrl });
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to upload image");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Profile Card */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          
          {/* Header/Cover Area */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>

          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-16 mb-6">
              {/* Profile Image */}
              <div className="relative group">
                <div className="h-32 w-32 rounded-2xl border-4 border-white overflow-hidden bg-gray-200 shadow-md">
                  {profile?.profileImage ? (
                    <img src={profile.profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setIsImageUpload(!isImageUpload)}
                  className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Camera size={18} />
                </button>
              </div>

              {/* Edit Toggle Button */}
              <button
                onClick={() => { setIsEditing(!isEditing); setMessage(""); }}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  isEditing 
                  ? "bg-gray-100 text-gray-600 hover:bg-gray-200" 
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
                }`}
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {/* Notifications */}
            {message && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                messageType === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
              }`}>
                {messageType === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
                <p className="text-sm font-medium">{message}</p>
              </div>
            )}

            {/* Image Upload Form (Conditional) */}
            {isImageUpload && (
              <div className="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-top-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-4 uppercase tracking-wider">Update Profile Photo</h3>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <input type="file" onChange={handleImageSelect} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
                  {imagePreview && (
                    <button onClick={handleUploadImage} disabled={loading} className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50">
                      {loading ? "Uploading..." : "Save Photo"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Form Content */}
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                    <User size={16} /> First Name
                  </label>
                  {isEditing ? (
                    <input type="text" name="firstname" value={formData.firstname} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800 font-medium">{profile?.firstname}</p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                    <User size={16} /> Last Name
                  </label>
                  {isEditing ? (
                    <input type="text" name="lastname" value={formData.lastname} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800 font-medium">{profile?.lastname}</p>
                  )}
                </div>

                {/* Email (Read Only) */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                    <Mail size={16} /> Email Address
                  </label>
                  <p className="px-4 py-2 bg-gray-100 rounded-lg text-gray-500 italic">{profile?.email}</p>
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                    <Phone size={16} /> Mobile Number
                  </label>
                  {isEditing ? (
                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-800 font-medium">{profile?.mobile}</p>
                  )}
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Meta Info (Badges) */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                  <Shield size={14} className="text-indigo-600" />
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">{profile?.role}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                  <Calendar size={14} className="text-indigo-600" />
                  <span className="text-xs font-medium text-gray-600">Joined {new Date(profile?.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-xs font-bold text-green-700 uppercase tracking-tighter">{profile?.status}</span>
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:bg-blue-400"
                  >
                    {loading ? "Saving Changes..." : "Save All Updates"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;