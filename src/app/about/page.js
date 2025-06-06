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
              A house of Kashmiri Hand Embroidery
            </p>
          </div>

          <div className="bg-[#dcd7c9]/20 p-6 rounded-lg border border-[#dcd7c9] shadow-md mb-16">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="order-2 lg:order-1 lg:w-2/3 pt-6 lg:pt-0 lg:pr-8">
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-[#2c3639] font-display">Our Heritage</h3>
                <p className="text-sm md:text-base text-[#2c3639]/90 leading-relaxed mb-6">
                  Introducing Kashmir's famous Aari work which is also known as Kashida embroidery, it is a type of intricate 
                  embroidery that is traditionally done by hand using a hooked needle called Aari. It originates from Kashmir and is 
                  considered as one of the famous forms of embroidery in World. We are pleased to introduce this ancient art to 
                  enhance and elevate any piece of fabric and to revive this forgotten art. At Alvira we have a wide range of hand 
                  embroidery products with unique designs and beautiful colours combinations, patiently crafted by our 
                  skilled artisans. We invite you to explore our beautiful crafted pieces and discover for yourself the joy and fulfillment it provides.
                </p>

                <h3 className="text-xl md:text-2xl font-bold mb-4 text-[#2c3639] font-display">Our Philosophy</h3>
                <p className="text-sm md:text-base text-[#2c3639]/90 leading-relaxed">
                  At Alvira, we believe that luxury should be both accessible and responsible. 
                  Our mission is to create sophisticated, enduring pieces that empower our clients to express 
                  their unique style while upholding the highest standards of craftsmanship and 
                  environmental stewardship.
                </p>
              </div>
              
              <div className="order-1 lg:order-2 lg:w-1/3 flex justify-center mb-4 lg:mb-0">
                <div className="relative w-56 h-72 md:w-64 md:h-80 overflow-hidden rounded-[50%] border border-gray-200 shadow-md">
                  <Image 
                    src="https://firebasestorage.googleapis.com/v0/b/draftai-b5cb9.appspot.com/o/Demo%2FWhatsApp%20Image%202025-04-25%20at%208.43.59%20PM.jpeg?alt=media&token=8474baff-2547-443f-958a-e9a7b6dd208d" 
                    alt="Kashmiri Hand Embroidery" 
                    fill
                    className="object-cover object-center"
                  />
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
                      Alvira Fashion Avenue, Downtown<br />
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
                  <div>                    <h4 className="font-semibold text-[#2c3639] mb-2 font-display">Phone</h4>
                    <a href="tel:+919985852000" className="text-[#2c3639]/90 text-base hover:text-[#a27b5c] transition-colors">+91 9985852000</a>
                    <p className="text-sm text-[#2c3639]/80 mt-2">
                      Monday to Saturday, 9AM - 9PM
                    </p>
                  </div>
                </div>
                
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-[#a27b5c]/20 p-3 rounded-full flex items-center justify-center min-w-10 min-h-10">
                    <FaEnvelope className="text-[#a27b5c] text-lg" />
                  </div>
                  <div>                    <h4 className="font-semibold text-[#2c3639] mb-2 font-display">Email</h4>
                    <a href="mailto:alvira998585@gmail.com" className="text-[#2c3639]/90 text-base hover:text-[#a27b5c] transition-colors">alvira998585@gmail.com</a>
                    <p className="text-sm text-[#2c3639]/80 mt-2">
                      We respond within 24 hours
                    </p>
                  </div>
                </div>
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