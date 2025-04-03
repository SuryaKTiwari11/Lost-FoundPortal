"use client"; // Add this directive to make it a client component

import React from "react";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Lost Something? Found Something? Let’s Reconnect!
        </h1>
        <p className="text-lg md:text-xl mb-6">
          Helping you find what matters most.
        </p>
        <div className="flex space-x-4">
          <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-gray-100">
            Report Lost Item
          </button>
          <button className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg shadow-md hover:bg-gray-100">
            Report Found Item
          </button>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="Search for lost items..."
            className="w-full px-4 py-3 rounded-lg shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-10 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.1 }}
            className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md"
          >
            <h2 className="text-3xl font-bold">1,234</h2>
            <p className="mt-2">Items Reported</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.1 }}
            className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md"
          >
            <h2 className="text-3xl font-bold">567</h2>
            <p className="mt-2">Items Returned</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.1 }}
            className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md"
          >
            <h2 className="text-3xl font-bold">98%</h2>
            <p className="mt-2">Success Rate</p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            Success Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md">
              <p>
                "I found my lost wallet within a day! This portal is a
                lifesaver."
              </p>
              <p className="mt-4 font-semibold">- John Doe</p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md">
              <p>
                "Thanks to this platform, I was able to return a lost phone to
                its owner."
              </p>
              <p className="mt-4 font-semibold">- Jane Smith</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-10 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md"
            >
              <h3 className="text-xl font-semibold">Step 1</h3>
              <p className="mt-2">Report a lost or found item.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md"
            >
              <h3 className="text-xl font-semibold">Step 2</h3>
              <p className="mt-2">Search or browse the database.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md"
            >
              <h3 className="text-xl font-semibold">Step 3</h3>
              <p className="mt-2">Reconnect with the owner or finder.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 flex flex-col space-y-4">
        <button className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700">
          Report Lost
        </button>
        <button className="p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700">
          Report Found
        </button>
      </div>
    </div>
  );
}
