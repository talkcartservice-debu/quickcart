import React from "react";

const NewsLetter = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 pt-8 pb-14 bg-gradient-to-r from-orange-50 to-gray-50 p-8 rounded-xl">
      <div className="flex flex-col items-center">
        <h1 className="md:text-4xl text-2xl font-bold text-gray-900">
          Subscribe now & get 20% off
        </h1>
        <div className="w-20 h-0.5 bg-orange-600 mt-3"></div>
      </div>
      <p className="md:text-base text-gray-600 max-w-lg">
        Join our newsletter to receive updates on new products and exclusive deals.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl w-full">
        <input
          className="border border-gray-300 rounded-lg h-12 outline-none w-full px-4 text-gray-700 shadow-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
          type="email"
          placeholder="Enter your email address"
        />
        <button className="h-12 px-8 text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-md transition duration-300 whitespace-nowrap">
          Subscribe
        </button>
      </div>
    </div>
  );
};

export default NewsLetter;
