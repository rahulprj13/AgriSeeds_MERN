import axios from 'axios'
import React, { useEffect, useState } from 'react'

const Getapi = () => {
  const [formdata, setFormdata] = useState([])

  const userdata = async () => {
    const res = await axios.get("https://node5.onrender.com/user/user/")
    console.log("response..", res);
    console.log("response data..", res.data.data);
    setFormdata(res.data.data)
  }
  useEffect(() => {
    userdata()
  }, [])


  return (
    <div style={{textAlign:"center"}}>
      <h1>API Data </h1>
      {/* <button onClick={userdata}>get data</button> */}
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl bg-white shadow-2xl rounded-2xl overflow-hidden">

          <div className="px-6 py-4 bg-indigo-600 text-white text-xl font-semibold">
            User Details
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-indigo-100 text-indigo-700 uppercase text-sm leading-normal">
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Action</th>
                </tr>
              </thead>

              <tbody className="text-gray-600 text-sm font-light">
                {formdata.map((form, index) => (
                  <tr
                    key={form._id}
                    className={`border-b border-gray-200 hover:bg-indigo-50 transition duration-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                  >
                    <td className="py-3 px-6 font-medium">{form._id}</td>
                    <td className="py-3 px-6">{form.name}</td>
                    <td className="py-3 px-6 text-indigo-600">{form.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Getapi
