import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const Dashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = "https://contactly-1clq.onrender.com/api";

  useEffect(() => {
    console.log("User from localStorage:", JSON.parse(localStorage.getItem("loggedInUser")));
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    
    if (!user) {
      toast.error("Please login to access the dashboard");
      navigate("/");
      return;
    }
    
    setLoggedInUser(user);
    fetchContacts();
  }, [navigate]);
  
  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      console.log("Using token:", token);
      const response = await axios.get(`${API_URL}/contacts`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("Contacts response:", response.data);
      setContacts(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setIsLoading(false);
      console.error("Error fetching contacts:", error);
      toast.error(error.response?.data?.message || "Failed to fetch contacts");
    }
  };
  
  const addContact = async () => {
    if (!loggedInUser) {
      toast.error("You must be logged in to add contacts");
      return;
    }
  
    // Validation to prevent adding empty contacts
    if (!name.trim() || !phone.trim() || !email.trim() || !city.trim() || !country.trim()) {
      toast.error("Please fill in all fields before adding a contact.");
      return;
    }
  
    const newContact = { name, phone, email, city, country };
    const token = localStorage.getItem("authToken");
    console.log(token,"token is here")
    try {
      setIsLoading(true);
      
      if (editingId) {
        // Update existing contact
        await axios.put(`${API_URL}/contacts/${editingId}`, newContact, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        toast.success("Contact updated successfully!");
        setEditingId(null);
      } else {
        // Create new contact
        await axios.post(`${API_URL}/contacts/create`, newContact, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        toast.success("New contact added successfully!");
      }
      
      // Refresh contacts after adding/updating
      fetchContacts();
      
      // Clear input fields
      setName("");
      setPhone("");
      setEmail("");
      setCity("");
      setCountry("");
      
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error saving contact:", error);
      toast.error(error.response?.data?.message || "Failed to save contact");
    }
  };
  
  const deleteContact = async (id) => {
    if (!loggedInUser) {
      toast.error("You must be logged in to delete contacts");
      return;
    }

    // Confirm deletion
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("authToken");
        
        await axios.delete(`${API_URL}/contacts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        toast.success("Contact deleted successfully!");
        fetchContacts();
      } catch (error) {
        console.error("Error deleting contact:", error);
        toast.error(error.response?.data?.message || "Failed to delete contact");
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const editContact = (contact) => {
    setName(contact.name);
    setPhone(contact.phone);
    setEmail(contact.email);
    setCity(contact.city);
    setCountry(contact.country);
    setEditingId(contact._id);
    
    toast("Editing contact - update form values and click 'Update Contact'", {
      icon: '✏️',
      duration: 3000
    });
  };

  const logout = () => {
    // Set logging out state to disable buttons/interactions
    setIsLoggingOut(true);
    
    // Show a single logout toast
    toast.success("Logged out successfully!");
    
    // Clear user data from localStorage
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");
    
    // Use a timeout to give the toast time to display before navigating
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
      {/* Toast Container */}
      <Toaster position="top-right" toastOptions={{ 
        duration: 3000,
        style: {
          background: '#363636',
          color: '#fff',
          borderRadius: '10px',
        },
        success: {
          iconTheme: {
            primary: '#22c55e',
            secondary: 'white',
          },
        },
      }} />

      {/* Top Bar */}
      <div className="w-full flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 p-4 shadow-lg">
        <h1 className="text-2xl font-bold text-white tracking-wide">
          <span className="mr-2">📘</span>
          Your Contact Book
        </h1>

        <button 
          onClick={logout}
          disabled={isLoggingOut || isLoading}
          className={`bg-white text-indigo-700 px-4 py-2 font-bold rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center ${
            (isLoggingOut || isLoading) ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          <span className="mr-1">{isLoggingOut ? "Logging out..." : "Log Out"}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
      
      <div className="flex flex-grow overflow-hidden p-4 space-x-6">
        {/* Left Side - Contacts List & Logged-in User */}
        <div className="w-1/2 bg-white p-6 shadow-xl rounded-xl h-full overflow-hidden border border-indigo-500">
          {loggedInUser && (
            <div className="text-lg font-medium text-gray-700 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Logged in as: </span>
              <span className="text-indigo-600 font-bold ml-1">{loggedInUser.email}</span>
            </div>
          )}
          
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Contacts
          </h2>
          <div className="overflow-y-auto max-h-[70vh] pr-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-gray-500 text-center py-10 rounded-lg bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>No contacts found. Add your first contact!</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm">
                <table className="w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Contact Info</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Location</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr key={contact._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-3 text-lg font-bold">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-800">{contact.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center mb-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {contact.phone}
                            </div>
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {contact.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {contact.city}, {contact.country}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex space-x-2 justify-end">
                            <button 
                              onClick={() => editContact(contact)} 
                              disabled={isLoggingOut || isLoading}
                              className={`bg-amber-500 text-white p-2 rounded-lg shadow hover:bg-amber-600 transition-colors duration-300 ${
                                (isLoggingOut || isLoading) ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => deleteContact(contact._id)} 
                              disabled={isLoggingOut || isLoading}
                              className={`bg-rose-500 text-white p-2 rounded-lg shadow hover:bg-rose-600 transition-colors duration-300 ${
                                (isLoggingOut || isLoading) ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
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
        </div>

        {/* Right Side - Add Contact Form */}
        <div className="w-1/2 bg-white p-6 shadow-xl rounded-xl h-full overflow-hidden border border-purple-500">
          <h2 className="text-xl font-bold text-gray-900 flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            {editingId !== null ? "Edit Contact" : "Add New Contact"}
          </h2>

          {/* Contact Form */}
          <div className="mt-6">
            <div className="relative mb-4">
              <label className="block text-gray-700 font-semibold mb-1">Name</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input 
                  className="w-full p-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                  type="text" 
                  placeholder="Enter Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  disabled={isLoggingOut || isLoading}
                />
              </div>
            </div>

            <div className="relative mb-4">
              <label className="block text-gray-700 font-semibold mb-1">Phone</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <input 
                  className="w-full p-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                  type="tel" 
                  placeholder="Enter Phone" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  disabled={isLoggingOut || isLoading}
                />
              </div>
            </div>

            <div className="relative mb-4">
              <label className="block text-gray-700 font-semibold mb-1">Email</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input 
                  className="w-full p-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                  type="email" 
                  placeholder="Enter Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  disabled={isLoggingOut || isLoading}
                />
              </div>
            </div>

            <div className="relative mb-4">
              <label className="block text-gray-700 font-semibold mb-1">City</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
                <input 
                  className="w-full p-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                  type="text" 
                  placeholder="Enter City" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  disabled={isLoggingOut || isLoading}
                />
              </div>
            </div>

            <div className="relative mb-4">
              <label className="block text-gray-700 font-semibold mb-1">Country</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <input 
                  className="w-full p-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                  type="text" 
                  placeholder="Enter Country" 
                  value={country} 
                  onChange={(e) => setCountry(e.target.value)} 
                  disabled={isLoggingOut || isLoading}
                />
              </div>
            </div>

            {/* Add/Update Contact Button with improved styling */}
            <div className="px-4 mb-4">
              <button 
                onClick={addContact} 
                disabled={isLoggingOut || isLoading}
                className={`w-full py-2 text-white rounded-lg font-bold relative overflow-hidden transition duration-300 bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg hover:shadow-indigo-500/50 transform hover:translate-y-[-2px] flex items-center justify-center ${
                  (isLoggingOut || isLoading) ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : editingId !== null ? (
                  <span className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Update Contact
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Add Contact
                  </span>
                )}
              </button>
            </div>

            {editingId !== null && (
              <div className="px-4">
                <button 
                  onClick={() => {
                    setEditingId(null);
                    setName("");
                    setPhone("");
                    setEmail("");
                    setCity("");
                    setCountry("");
                    toast.info("Edit canceled");
                  }} 
                  disabled={isLoggingOut}
                  className={`w-full py-3 text-gray-700 rounded-lg font-bold border border-gray-300 hover:bg-gray-100 transition duration-300 flex items-center justify-center ${
                   isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel Editing
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;