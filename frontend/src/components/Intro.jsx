import React from "react";
import { motion } from "framer-motion";
import sdg11 from "../assets/3.jpg";
import sdg13 from "../assets/7.jpg";
import sdg3 from "../assets/9.png";
import sdg7 from "../assets/11.png";
import sdg9 from "../assets/13.webp";

// SDG Goals data with image URLs
const sdgGoals = [
  {
    title: "SDG 11",
    description: "Sustainable Cities and Communities",
    image: sdg11,
  },
  {
    title: "SDG 13",
    description: "Climate Action",
    image: sdg13,
  },
  {
    title: "SDG 3",
    description: "Good Health and Well-being",
    image: sdg3,
  },
  {
    title: "SDG 7",
    description: "Affordable and Clean Energy",
    image: sdg7,
  },
  {
    title: "SDG 9",
    description: "Industry, Innovation, and Infrastructure",
    image: sdg9,
  },
];

// Animation variants
const heroVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const Intro = ({ onStart }) => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <motion.div
        className="relative min-h-screen bg-cover bg-center flex items-center justify-center px-6 text-center bg-gradient-to-b from-green-800 to-green-900"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
        }}
        initial="hidden"
        animate="visible"
        variants={heroVariants}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-green-900 bg-opacity-70 backdrop-blur-sm z-0" />

        <div className="relative z-10 max-w-4xl text-white space-y-8">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight"
            variants={heroVariants}
          >
            Building Sustainable Futures
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl md:text-2xl font-medium text-gray-100"
            variants={heroVariants}
          >
            Assess and empower urban neighborhoods through sustainability
            metrics and global goals.
          </motion.p>
          <motion.button
            onClick={onStart}
            className="mt-8 px-8 py-4 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white text-lg font-semibold rounded-full shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Start sustainability assessment"
          >
            Get Started
          </motion.button>
        </div>
      </motion.div>

      {/* Purpose Section */}
      <section className="py-20 bg-white dark:bg-gray-800 text-center px-4 sm:px-8 transition-colors duration-300">
        <div className="max-w-5xl mx-auto space-y-8">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-green-900 dark:text-green-100"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={heroVariants}
          >
            Why This Tool?
          </motion.h2>
          <motion.p
            className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={heroVariants}
          >
            Urban environments face increasing challenges across environmental,
            social, and economic dimensions. Our Sustainability Index provides a
            reliable framework to evaluate and guide sustainable neighborhood
            development, aligning with global Sustainable Development Goals.
          </motion.p>
        </div>
      </section>

      {/* SDG Goals Grid */}
      <section className="bg-green-50 dark:bg-gray-700 py-20 px-4 sm:px-6 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <motion.h3
            className="text-3xl md:text-4xl font-bold text-green-900 dark:text-green-100 text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={heroVariants}
          >
            Supporting the UN Sustainable Development Goals (SDGs)
          </motion.h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sdgGoals.map((goal, idx) => (
              <motion.div
                key={idx}
                className="bg-white dark:bg-gray-800 border-l-4 border-green-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={cardVariants}
                whileHover={{ scale: 1.03 }}
              >
                <div className="aspect-w-16 aspect-h-9 w-full mb-6">
                  <img
                    src={goal.image}
                    alt={`${goal.title} illustration`}
                    className="object-cover rounded-xl"
                  />
                </div>

                <h4 className="text-xl font-bold text-green-800 dark:text-green-200 mb-3">
                  {goal.title}
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {goal.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Intro;
