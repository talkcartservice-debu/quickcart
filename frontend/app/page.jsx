'use client'
import React from "react";
import HeaderSlider from "@/components/HeaderSlider";
import HomeProducts from "@/components/HomeProducts";
import Banner from "@/components/Banner";
import NewsLetter from "@/components/NewsLetter";
import FeaturedProduct from "@/components/FeaturedProduct";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Home = () => {
  return (
    <>
      <Navbar/>
      <div className="px-6 md:px-16 lg:px-32 pt-6">
        <HeaderSlider />
        <div className="my-16">
          <HomeProducts />
        </div>
        <div className="my-16">
          <FeaturedProduct />
        </div>
        <div className="my-16">
          <Banner />
        </div>
        <div className="my-16 pb-16">
          <NewsLetter />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
