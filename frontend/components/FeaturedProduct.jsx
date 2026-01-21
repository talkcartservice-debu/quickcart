import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

const products = [
  {
    id: 1,
    image: assets.girl_with_headphone_image,
    title: "Unparalleled Sound",
    description: "Experience crystal-clear audio with premium headphones.",
  },
  {
    id: 2,
    image: assets.girl_with_earphone_image,
    title: "Stay Connected",
    description: "Compact and stylish earphones for every occasion.",
  },
  {
    id: 3,
    image: assets.boy_with_laptop_image,
    title: "Power in Every Pixel",
    description: "Shop the latest laptops for work, gaming, and more.",
  },
];

const FeaturedProduct = () => {
  return (
    <div>
      <div className="flex flex-col items-center mb-14">
        <p className="text-3xl font-bold text-gray-900">Featured Products</p>
        <div className="w-28 h-0.5 bg-orange-600 mt-3"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 md:px-14 px-4">
        {products.map(({ id, image, title, description }) => (
          <div key={id} className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition duration-300">
            <Image
              src={image}
              alt={title}
              className="group-hover:scale-105 transition duration-500 w-full h-64 object-cover"
            />
            <div className="group-hover:-translate-y-4 transition duration-300 absolute bottom-6 left-6 text-white space-y-2 bg-black/40 backdrop-blur-sm p-4 rounded-lg">
              <p className="font-bold text-lg lg:text-xl">{title}</p>
              <p className="text-sm lg:text-base leading-5 max-w-60">
                {description}
              </p>
              <button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded transition duration-300">
                Shop Now <Image className="h-4 w-4" src={assets.redirect_icon} alt="Redirect Icon" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProduct;
