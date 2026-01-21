import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

const Banner = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between md:pl-20 py-14 md:py-0 bg-gradient-to-r from-orange-50 to-blue-50 my-16 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <div className="flex flex-col items-center md:items-start px-6 md:px-0">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 max-w-[290px] mb-3">
          Level Up Your Gaming Experience
        </h2>
        <p className="max-w-[343px] text-gray-600 mb-6 text-center md:text-left">
          From immersive sound to precise controls—everything you need to win
        </p>
        <button className="group flex items-center justify-center gap-2 px-8 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg text-white shadow-md transition duration-300">
          Shop Gaming Gear
          <Image className="group-hover:translate-x-1 transition" src={assets.arrow_icon_white} alt="arrow_icon_white" />
        </button>
      </div>
      <div className="flex items-center justify-center p-6">
        <Image
          className="max-w-56"
          src={assets.jbl_soundbox_image}
          alt="jbl_soundbox_image"
        />
      </div>
      <div className="flex items-center justify-center p-6">
        <Image
          className="hidden md:block max-w-80"
          src={assets.md_controller_image}
          alt="md_controller_image"
        />
        <Image
          className="md:hidden"
          src={assets.sm_controller_image}
          alt="sm_controller_image"
        />
      </div>
    </div>
  );
};

export default Banner;