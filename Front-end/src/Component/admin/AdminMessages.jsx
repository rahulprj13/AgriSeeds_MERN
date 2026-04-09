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
  X
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
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
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
        setMessages(prev => prev.map(msg => msg._id === id ? { ...msg, status: "Read" } : msg));
        toast.success("Message marked as read");
        if (selectedMessage && selectedMessage._id === id) {
          setSelectedMessage({ ...selectedMessage, status: "Read" });
        }
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
      toast.error("Failed to update message status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      const { data } = await axios.delete(`/api/admin/contact/${id}`);
      if (data.success) {
        setMessages(prev => prev.filter(msg => msg._id !== id));
        toast.success("Message deleted");
        if (isModalOpen) setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const openMessage = (msg) => {
    setSelectedMessage(msg);
    setIsModalOpen(true);
    if (msg.status === "Unread") {
      handleMarkAsRead(msg._id);
    }
  };

  const filteredMessages = messages.filter(msg => 
    msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = messages.filter(m => m.status === "Unread").length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Contact Messages</h2>
          <p className="text-sm font-semibold text-slate-400">Manage inquiries and feedback from your customers</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl border border-blue-100 flex items-center gap-2 font-bold text-sm">
            <Mail size={16} />
            <span>{unreadCount} Unread</span>
          </div>
          <button 
            onClick={fetchMessages}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600"
            title="Refresh"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Search by name, email or subject..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-hidden text-slate-700 font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-slate-500 font-bold">
            <RefreshCw className="mx-auto mb-4 animate-spin h-10 w-10 text-blue-500" />
            Loading messages...
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-20 text-center text-slate-500 font-bold">
            <Mail className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            No messages found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.1em] text-slate-400">Status</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.1em] text-slate-400">From</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.1em] text-slate-400">Subject</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.1em] text-slate-400">Date</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.1em] text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMessages.map((msg) => (
                  <tr 
                    key={msg._id} 
                    className={`group hover:bg-slate-50/80 transition-colors cursor-pointer ${msg.status === "Unread" ? "bg-blue-50/30" : ""}`}
                    onClick={() => openMessage(msg)}
                  >
                    <td className="px-6 py-4">
                      {msg.status === "Unread" ? (
                        <span className="flex items-center gap-1.5 text-blue-600 font-black text-[10px] uppercase bg-blue-100/50 px-2.5 py-1 rounded-lg w-fit">
                          <Clock size={10} strokeWidth={3} /> New
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-slate-400 font-black text-[10px] uppercase bg-slate-100 px-2.5 py-1 rounded-lg w-fit">
                          <CheckCircle size={10} strokeWidth={3} /> Read
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 shadow-sm border border-slate-200/50">
                          <User size={20} />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${msg.status === "Unread" ? "text-slate-900" : "text-slate-600"}`}>{msg.name}</p>
                          <p className="text-xs font-medium text-slate-400">{msg.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm font-bold line-clamp-1 ${msg.status === "Unread" ? "text-slate-900" : "text-slate-600"}`}>
                        {msg.subject}
                      </p>
                      <p className="text-xs text-slate-400 line-clamp-1 font-medium italic">
                        "{msg.message}"
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-xs font-black text-slate-700">
                        {new Date(msg.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); openMessage(msg); }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="View Message"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(msg._id); }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
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
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Message Details</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inquiry Received</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all hover:shadow-md"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">From</label>
                  <p className="text-slate-900 font-bold">{selectedMessage.name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Email Address</label>
                  <p className="text-slate-900 font-bold">{selectedMessage.email}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Subject</label>
                  <p className="text-slate-900 font-black text-lg">{selectedMessage.subject}</p>
                </div>
                <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Message Body</label>
                  <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 italic">
                <Clock size={14} />
                <span>Received on {new Date(selectedMessage.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <a 
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
                >
                  <Mail size={16} />
                  Reply via Email
                </a>
              </div>
              <button 
                onClick={() => handleDelete(selectedMessage._id)}
                className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2"
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