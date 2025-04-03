"use client";

import React from "react";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#121212", color: "#FFFFFF" }}
    >
      {/* Hero Section */}
      <section
        className="flex flex-col items-center justify-center text-center py-20"
        style={{ background: "linear-gradient(to right, #1A1A1A, #2A2A2A)" }}
      >
        <h1
          className="text-4xl md:text-6xl font-bold mb-4"
          style={{ color: "#FFD166" }}
        >
          Lost Something? Found Something? Let's Reconnect!
        </h1>
        <p className="text-lg md:text-xl mb-6" style={{ color: "#FFFFFF" }}>
          Helping you find what matters most.
        </p>
        <div className="flex space-x-4">
          <button
            className="px-6 py-3 font-semibold rounded-lg shadow-md"
            style={{ backgroundColor: "#FFD166", color: "#121212" }}
          >
            Report Lost Item
          </button>
          <button
            className="px-6 py-3 font-semibold rounded-lg shadow-md"
            style={{ backgroundColor: "#333333", color: "#FFFFFF" }}
          >
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
            className="w-full px-4 py-3 rounded-lg shadow-md focus:outline-none"
            style={{
              borderColor: "#FFD166",
              backgroundColor: "#2A2A2A",
              color: "#FFFFFF",
            }}
          />
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-10" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.1 }}
            className="p-6 rounded-lg shadow-md"
            style={{ backgroundColor: "#333333", color: "#FFFFFF" }}
          >
            <h2 className="text-3xl font-bold" style={{ color: "#FFD166" }}>
              1,234
            </h2>
            <p className="mt-2">Items Reported</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.1 }}
            className="p-6 rounded-lg shadow-md"
            style={{ backgroundColor: "#FFD166", color: "#121212" }}
          >
            <h2 className="text-3xl font-bold">567</h2>
            <p className="mt-2">Items Returned</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.1 }}
            className="p-6 rounded-lg shadow-md"
            style={{ backgroundColor: "#333333", color: "#FFFFFF" }}
          >
            <h2 className="text-3xl font-bold" style={{ color: "#FFD166" }}>
              98%
            </h2>
            <p className="mt-2">Success Rate</p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-6"
            style={{ color: "#FFD166" }}
          >
            Success Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className="p-6 rounded-lg shadow-md"
              style={{ backgroundColor: "#1A1A1A", color: "#FFFFFF" }}
            >
              <p>
                "I found my lost wallet within a day! This portal is a
                lifesaver."
              </p>
              <p className="mt-4 font-semibold" style={{ color: "#FFD166" }}>
                - John Doe
              </p>
            </div>
            <div
              className="p-6 rounded-lg shadow-md"
              style={{ backgroundColor: "#1A1A1A", color: "#FFFFFF" }}
            >
              <p>
                "Thanks to this platform, I was able to return a lost phone to
                its owner."
              </p>
              <p className="mt-4 font-semibold" style={{ color: "#FFD166" }}>
                - Jane Smith
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-10" style={{ backgroundColor: "#1A1A1A" }}>
        <div className="max-w-5xl mx-auto text-center">
          <h2
            className="text-2xl md:text-3xl font-bold mb-6"
            style={{ color: "#FFD166" }}
          >
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-6 rounded-lg shadow-md"
              style={{ backgroundColor: "#333333", color: "#FFFFFF" }}
            >
              <h3
                className="text-xl font-semibold"
                style={{ color: "#FFD166" }}
              >
                Step 1
              </h3>
              <p className="mt-2">Report a lost or found item.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-6 rounded-lg shadow-md"
              style={{ backgroundColor: "#FFD166", color: "#121212" }}
            >
              <h3 className="text-xl font-semibold">Step 2</h3>
              <p className="mt-2">Search or browse the database.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-6 rounded-lg shadow-md"
              style={{ backgroundColor: "#333333", color: "#FFFFFF" }}
            >
              <h3
                className="text-xl font-semibold"
                style={{ color: "#FFD166" }}
              >
                Step 3
              </h3>
              <p className="mt-2">Reconnect with the owner or finder.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 flex flex-col space-y-4">
        <button
          className="p-4 rounded-full shadow-lg"
          style={{ backgroundColor: "#FFD166", color: "#121212" }}
        >
          Report Lost
        </button>
        <button
          className="p-4 rounded-full shadow-lg"
          style={{ backgroundColor: "#333333", color: "#FFFFFF" }}
        >
          Report Found
        </button>
      </div>
    </div>
  );
}
