import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl text-black mb-4">Contact Us</h1>
            <p className="text-gray-600 max-w-3xl mx-auto">
              We'd love to hear from you. Get in touch with us for any inquiries or assistance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-gray-50 p-8 rounded-lg">
              <h2 className="font-display text-2xl mb-6">Send us a message</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4b78f]" 
                    placeholder="Your name" 
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4b78f]" 
                    placeholder="Your email" 
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input 
                    type="text" 
                    id="subject" 
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4b78f]" 
                    placeholder="Subject" 
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea 
                    id="message" 
                    rows="5" 
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#d4b78f]" 
                    placeholder="Your message"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-[#1e2832] text-white py-3 rounded-md hover:bg-[#d4b78f] transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
            
            <div>
              <h2 className="font-display text-2xl mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-lg mb-2">Address</h3>
                  <p className="text-gray-600">123 Fashion Street, Design District</p>
                  <p className="text-gray-600">Mumbai, Maharashtra 400001</p>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Email</h3>
                  <p className="text-gray-600">hello@elegante.com</p>
                  <p className="text-gray-600">support@elegante.com</p>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Phone</h3>
                  <p className="text-gray-600">+91 9876543210</p>
                  <p className="text-gray-600">+91 1234567890</p>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Hours</h3>
                  <p className="text-gray-600">Monday - Saturday: 10:00 AM - 8:00 PM</p>
                  <p className="text-gray-600">Sunday: 11:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
} 