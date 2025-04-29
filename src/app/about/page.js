'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaLeaf, FaAward, FaHandsHelping, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaArrowRight } from 'react-icons/fa';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* About Section */}
      <div id="about" className="pt-24 pb-4 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-[#2c3639] font-display">
              About Alvira
            </h2>
            <div className="w-32 h-1 bg-[#a27b5c] mx-auto mb-6"></div>
            <p className="text-[#2c3639] max-w-2xl mx-auto text-base md:text-lg mb-10">
              Discover the story, mission, and values behind our premium fashion brand
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* Left Side - Images */}
            <div className="flex flex-col gap-6">
              {/* Main Store Image */}
              <div className="relative overflow-hidden rounded-lg shadow-md">
                <div className="aspect-w-16 aspect-h-9 h-80">
                  <Image 
                    src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                    alt="Alvira Boutique Store" 
                    fill
                    className="object-cover rounded-lg transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>

              {/* Secondary Image - Hands with Clothing */}
              <div className="relative h-56 md:h-64 overflow-hidden rounded-lg shadow-md">
                <Image 
                  src="https://images.unsplash.com/photo-1623244307563-f9ade3df13c8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                  alt="Alvira Craftsmanship" 
                  fill
                  className="object-cover object-center transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2c3639]/90 to-transparent p-4">
                  <p className="text-white text-xs md:text-sm font-medium">Handcrafted excellence by skilled artisans</p>
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="flex flex-col justify-center">
              {/* Text Content */}
              <div className="bg-[#dcd7c9]/20 p-7 rounded-lg border border-[#dcd7c9] shadow-md">
                <div className="mb-6 md:mb-8">
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-[#2c3639] font-display">Our Heritage</h3>
                  <p className="text-sm md:text-base text-[#2c3639]/90 leading-relaxed">
                    Founded in 2015, Alvira began as a boutique atelier in Mumbai with a vision to 
                    blend timeless elegance with contemporary fashion. What started as a passion project
                    has evolved into a distinguished brand renowned for its meticulous attention to detail 
                    and unwavering commitment to sustainable and ethical practices.
                  </p>
                </div>

                <div className="mb-0 md:mb-0">
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-[#2c3639] font-display">Our Philosophy</h3>
                  <p className="text-sm md:text-base text-[#2c3639]/90 leading-relaxed">
                    At Alvira, we believe that luxury should be both accessible and responsible. 
                    Our mission is to create sophisticated, enduring pieces that empower our clients to express 
                    their unique style while upholding the highest standards of craftsmanship and 
                    environmental stewardship.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Our Values - Grid */}
          <div className="mt-20 mb-10">
            <h2 className="font-display text-3xl text-center mb-8 text-[#2c3639]">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#dcd7c9]/40 p-8 rounded-lg shadow-md border border-[#dcd7c9] transition-transform duration-300 hover:translate-y-[-5px]">
                <div className="flex items-center mb-5">
                  <div className="bg-[#a27b5c]/30 p-4 rounded-full mr-4">
                    <FaLeaf className="text-[#a27b5c] text-2xl" />
                  </div>
                  <h3 className="font-display text-xl text-[#2c3639] font-semibold">Sustainability</h3>
                </div>
                <p className="text-[#2c3639]/90 leading-relaxed">
                  We prioritize eco-friendly materials and ethical production practices in every aspect of our business to minimize our environmental impact and promote responsible fashion.
                </p>
              </div>
              <div className="bg-[#dcd7c9]/40 p-8 rounded-lg shadow-md border border-[#dcd7c9] transition-transform duration-300 hover:translate-y-[-5px]">
                <div className="flex items-center mb-5">
                  <div className="bg-[#a27b5c]/30 p-4 rounded-full mr-4">
                    <FaAward className="text-[#a27b5c] text-2xl" />
                  </div>
                  <h3 className="font-display text-xl text-[#2c3639] font-semibold">Craftsmanship</h3>
                </div>
                <p className="text-[#2c3639]/90 leading-relaxed">
                  Every garment we create embodies exceptional artistry and precision, meeting the highest standards of quality and durability to ensure timeless elegance.
                </p>
              </div>
              <div className="bg-[#dcd7c9]/40 p-8 rounded-lg shadow-md border border-[#dcd7c9] transition-transform duration-300 hover:translate-y-[-5px]">
                <div className="flex items-center mb-5">
                  <div className="bg-[#a27b5c]/30 p-4 rounded-full mr-4">
                    <FaHandsHelping className="text-[#a27b5c] text-2xl" />
                  </div>
                  <h3 className="font-display text-xl text-[#2c3639] font-semibold">Community</h3>
                </div>
                <p className="text-[#2c3639]/90 leading-relaxed">
                  We nurture fair trade practices and empower the communities where our products are made, fostering ethical partnerships that promote dignity and economic development.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Connect With Us Section */}
      <div id="contact" className="pt-12 pb-16 bg-white border-t border-[#dcd7c9]/40">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#2c3639] font-display">
              Connect With Us
            </h2>
            <div className="w-32 h-1 bg-[#a27b5c] mx-auto mb-6"></div>
            <p className="text-[#2c3639] max-w-2xl mx-auto text-base md:text-lg mb-10">
              Visit our flagship boutique or reach out to our client services team
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* Left Side - Contact Info */}
            <div className="bg-[#dcd7c9]/30 p-8 md:p-10 rounded-lg shadow-md flex flex-col border border-[#dcd7c9]">
              <h3 className="text-xl md:text-2xl font-bold mb-8 text-[#2c3639] font-display">Visit Our Flagship Boutique</h3>
              
              <div className="space-y-6 flex-grow">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-[#a27b5c]/20 p-3 rounded-full flex items-center justify-center min-w-10 min-h-10">
                    <FaMapMarkerAlt className="text-[#a27b5c] text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#2c3639] mb-2 font-display">Address</h4>
                    <p className="text-[#2c3639]/90 text-base">
                      123 Fashion Avenue, Downtown<br />
                      Srinagar, Jammu & Kashmir, India
                    </p>
                    <p className="text-sm text-[#2c3639]/80 mt-2">
                      GPS: 34.0837° N, 74.7973° E
                    </p>
                  </div>
                </div>
                
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-[#a27b5c]/20 p-3 rounded-full flex items-center justify-center min-w-10 min-h-10">
                    <FaPhoneAlt className="text-[#a27b5c] text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#2c3639] mb-2 font-display">Phone</h4>
                    <p className="text-[#2c3639]/90 text-base">+91 9876 543 210</p>
                    <p className="text-sm text-[#2c3639]/80 mt-2">
                      Monday to Saturday, 10AM - 8PM
                    </p>
                  </div>
                </div>
                
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-[#a27b5c]/20 p-3 rounded-full flex items-center justify-center min-w-10 min-h-10">
                    <FaEnvelope className="text-[#a27b5c] text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#2c3639] mb-2 font-display">Email</h4>
                    <p className="text-[#2c3639]/90 text-base">clientservices@alvira.com</p>
                    <p className="text-sm text-[#2c3639]/80 mt-2">
                      We respond within 24 hours
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-[#dcd7c9]">
                <Link href="/contact" className="inline-flex items-center text-[#a27b5c] font-semibold hover:text-[#a27b5c]/80 transition-colors text-base">
                  Schedule a consultation <FaArrowRight className="ml-2 text-xs" />
                </Link>
              </div>
            </div>

            {/* Right Side - Map */}
            <div className="rounded-lg overflow-hidden shadow-md h-[350px] md:h-[500px] relative bg-white border border-[#dcd7c9]">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13209.004664126854!2d74.79723!3d34.0837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38e18f5cffca7fb1%3A0xfa705d767be5ee21!2sSrinagar%2C%20Jammu%20and%20Kashmir!5e0!3m2!1sen!2sin!4v1653000000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
                aria-label="Map showing location of Alvira flagship boutique in Srinagar"
              ></iframe>
              <div className="absolute bottom-4 left-4 bg-white px-4 py-3 rounded-md shadow-md border border-[#dcd7c9]">
                <p className="font-semibold text-sm text-[#2c3639]">Alvira Flagship Boutique</p>
                <p className="text-sm text-[#2c3639]/80">Srinagar, J&K</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
} 