import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Mail,
  Trash2,
  CheckCircle,
  Clock,
  User,
  MessageSquare,
  Search,
  RefreshCw,
  Eye,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/contact");
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const { data } = await axios.put(`/api/admin/contact/${id}/read`);
      if (data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === id ? { ...msg, status: "Read" } : msg
          )
        );

        toast.success("Message marked as read", {
          position: "top-center",
        });

        if (selectedMessage && selectedMessage._id === id) {
          setSelectedMessage({ ...selectedMessage, status: "Read" });
        }
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
      toast.error("Failed to update message status", {
        position: "top-center",
      });
    }
  };

  const executeDelete = async (id) => {
    try {
      const { data } = await axios.delete(`/api/admin/contact/${id}`);
      if (data.success) {
        setMessages((prev) => prev.filter((msg) => msg._id !== id));

        toast.success("Message deleted successfully", {
          position: "top-center",
        });

        if (selectedMessage?._id === id) {
          setSelectedMessage(null);
        }

        if (isModalOpen) {
          setIsModalOpen(false);
        }
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message", {
        position: "top-center",
      });
    }
  };

  const handleDelete = (id, subject = "this message") => {
    toast.dismiss();

    toast(
      ({ closeToast }) => (
        <div className="p-2">
          <p className="mb-4 text-sm font-bold text-gray-800">
            Delete <span className="text-red-500">{subject}</span>?
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={closeToast}
              className="px-3 py-1 text-[10px] font-bold uppercase text-gray-400"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                executeDelete(id);
                closeToast();
              }}
              className="rounded-lg bg-rose-600 px-4 py-1.5 text-[10px] font-black uppercase text-white shadow-sm hover:bg-rose-700"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  const openMessage = (msg) => {
    setSelectedMessage(msg);
    setIsModalOpen(true);

    if (msg.status === "Unread") {
      handleMarkAsRead(msg._id);
    }
  };

  const filteredMessages = messages.filter(
    (msg) =>
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = messages.filter((m) => m.status === "Unread").length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Contact Messages
          </h2>
          <p className="text-sm font-semibold text-slate-400">
            Manage inquiries and feedback from your customers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-700">
            <Mail size={16} />
            <span>{unreadCount} Unread</span>
          </div>

          <button
            onClick={fetchMessages}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition-colors hover:bg-slate-50"
            title="Refresh"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search by name, email or subject..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 font-medium text-slate-700 outline-hidden transition-all focus:border-transparent focus:ring-2 focus:ring-cyan-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Messages List */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-20 text-center font-bold text-slate-500">
            <RefreshCw className="mx-auto mb-4 h-10 w-10 animate-spin text-cyan-500" />
            Loading messages...
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-20 text-center font-bold text-slate-500">
            <Mail className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            No messages found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.1em] text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.1em] text-slate-400">
                    From
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.1em] text-slate-400">
                    Subject
                  </th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.1em] text-slate-400">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-[0.1em] text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredMessages.map((msg) => (
                  <tr
                    key={msg._id}
                    className={`group cursor-pointer transition-colors hover:bg-slate-50/80 ${
                      msg.status === "Unread" ? "bg-cyan-50/30" : ""
                    }`}
                    onClick={() => openMessage(msg)}
                  >
                    <td className="px-6 py-4">
                      {msg.status === "Unread" ? (
                        <span className="flex w-fit items-center gap-1.5 rounded-lg bg-cyan-100/70 px-2.5 py-1 text-[10px] font-black uppercase text-cyan-700">
                          <Clock size={10} strokeWidth={3} /> New
                        </span>
                      ) : (
                        <span className="flex w-fit items-center gap-1.5 rounded-lg bg-emerald-100/70 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-700">
                          <CheckCircle size={10} strokeWidth={3} /> Read
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/50 bg-linear-to-br from-slate-100 to-slate-200 text-slate-500 shadow-sm">
                          <User size={20} />
                        </div>
                        <div>
                          <p
                            className={`text-sm font-bold ${
                              msg.status === "Unread"
                                ? "text-slate-900"
                                : "text-slate-600"
                            }`}
                          >
                            {msg.name}
                          </p>
                          <p className="text-xs font-medium text-slate-400">
                            {msg.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p
                        className={`line-clamp-1 text-sm font-bold ${
                          msg.status === "Unread"
                            ? "text-slate-900"
                            : "text-slate-600"
                        }`}
                      >
                        {msg.subject}
                      </p>
                      <p className="line-clamp-1 text-xs italic font-medium text-slate-400">
                        "{msg.message}"
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <p className="text-xs font-black text-slate-700">
                        {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openMessage(msg);
                          }}
                          className="rounded-xl bg-violet-50 p-2 text-violet-600 transition-all hover:bg-violet-100 hover:text-violet-700"
                          title="View Message"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(msg._id, msg.subject || "this message");
                          }}
                          className="rounded-xl bg-rose-50 p-2 text-rose-600 transition-all hover:bg-rose-100 hover:text-rose-700"
                          title="Delete Message"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Message View Modal */}
      {isModalOpen && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 text-white shadow-lg shadow-cyan-500/20">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Message Details
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Inquiry Received
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 transition-all hover:text-slate-900 hover:shadow-md"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-8 p-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    From
                  </label>
                  <p className="font-bold text-slate-900">{selectedMessage.name}</p>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Email Address
                  </label>
                  <p className="font-bold text-slate-900">{selectedMessage.email}</p>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Subject
                  </label>
                  <p className="text-lg font-black text-slate-900">
                    {selectedMessage.subject}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 md:col-span-2">
                  <label className="mb-4 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Message Body
                  </label>
                  <p className="whitespace-pre-wrap font-medium leading-relaxed text-slate-700">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold italic text-slate-400">
                <Clock size={14} />
                <span>
                  Received on {new Date(selectedMessage.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center gap-3">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 transition-all hover:bg-cyan-700 active:scale-95"
                >
                  <Mail size={16} />
                  Reply via Email
                </a>
              </div>

              <button
                onClick={() =>
                  handleDelete(
                    selectedMessage._id,
                    selectedMessage.subject || "this message"
                  )
                }
                className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-600 transition-all hover:bg-rose-600 hover:text-white"
              >
                <Trash2 size={16} />
                Delete Inquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;