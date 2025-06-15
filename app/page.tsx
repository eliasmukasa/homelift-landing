"use client";

import { useState } from "react";
import { motion, useViewportScroll, useTransform } from "framer-motion";
import ApplyModal from "../components/ApplyModal";

// Airtable embed URLs
const HH_FORM_URL = "https://airtable.com/embed/apprHdPkKz0GxMw7D/pagPbIcvWw4kXFqjH/form";
const HCP_FORM_URL = "https://airtable.com/embed/apprHdPkKz0GxMw7D/pag90o8qNsuVlWBpX/form";

export default function LandingPage() {
  const [openForm, setOpenForm] = useState<"none" | "hh" | "hcp">("none");
  const { scrollY } = useViewportScroll();
  const yOffset = useTransform(scrollY, [0, 600], [0, 200]);
  const activeFormUrl = openForm === "hh" ? HH_FORM_URL : HCP_FORM_URL;
  const isModalOpen = openForm !== "none";
  const year = new Date().getFullYear();

  return (
    <main className="font-sans text-white h-screen overflow-y-scroll snap-y snap-mandatory">
      {/* Hero Section with parallax */}
      <motion.section
        className="relative h-screen snap-start flex flex-col items-center justify-center text-center bg-fixed bg-cover bg-center"
        style={{
          backgroundImage: "url('/sofa-hero.jpg')",
          backgroundPositionY: yOffset,
        }}
      >
        <h1 className="text-5xl md:text-6xl font-extrabold max-w-3xl leading-tight">
          Your home, <span className="text-blue-400">lifted.</span>
        </h1>
        <p className="mt-6 max-w-xl text-xl md:text-2xl text-white/90 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
          Vetted, insured, and continuously trained Home-Care Professionals — matched to your household in under 48 hours.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => setOpenForm("hh")}
            className="bg-blue-600 hover:bg-blue-500 transition rounded-xl px-6 py-3 font-semibold shadow-lg"
          >
            🏠 Get Early Access
          </button>
          <button
            type="button"
            onClick={() => setOpenForm("hcp")}
            className="bg-green-600 hover:bg-green-500 transition rounded-xl px-6 py-3 font-semibold shadow-lg"
          >
            👩‍🍳 Apply as HCP
          </button>
        </div>
      </motion.section>

      {/* Modal Embed */}
      {isModalOpen && (
        <ApplyModal
          formUrl={activeFormUrl}
          isOpen={isModalOpen}
          onClose={() => setOpenForm("none")}
        />
      )}

      {/* Benefits Section */}
      <section className="relative h-screen snap-start bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-3xl font-bold mb-4">Benefits for Households</h2>
            <ul className="space-y-3 text-gray-300 list-disc list-inside">
              <li>Free replacement in first 30 days</li>
              <li>UGX 200 K launch credit</li>
              <li>Priority 48-hr matching</li>
            </ul>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4">Benefits for HCPs</h2>
            <ul className="space-y-3 text-gray-300 list-disc list-inside">
              <li>Free core-skills training</li>
              <li>Weekly MoMo payout</li>
              <li>Career growth & certification</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works Section with sticky content */}
      <section className="relative h-screen snap-start bg-black/60 backdrop-blur-sm overflow-hidden">
        <motion.div className="sticky top-1/4 max-w-3xl mx-auto text-center space-y-6 px-6"
          style={{
            opacity: useTransform(scrollY, [window.innerHeight, window.innerHeight + 200], [0, 1]),
            y: useTransform(scrollY, [window.innerHeight, window.innerHeight + 200], [50, 0]),
          }}
        >
          <h2 className="text-4xl font-bold">How HomeLift Works</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-6">
            {[
              { icon: '📝', title: 'Your needs', desc: 'Tell us what you require.' },
              { icon: '🤝', title: 'Quality match', desc: 'We pick your best-fit HCPs.' },
              { icon: '📞', title: 'Ongoing care', desc: 'Support via WhatsApp 24/7.' },
            ].map((item) => (
              <div key={item.title} className="bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col items-center">
                <span className="text-5xl mb-4">{item.icon}</span>
                <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm text-center">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Founders Section */}
      <section className="relative h-screen snap-start bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-3xl space-y-4">
          <h2 className="text-4xl font-bold">Meet the Founders</h2>
          <p className="text-gray-300">Florence & Elias share their vision in 60 seconds.</p>
          <div className="aspect-w-16 aspect-h-9 bg-gray-800 rounded-2xl flex items-center justify-center text-gray-500">
            Video placeholder
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative h-screen snap-start bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
        <div className="max-w-4xl space-y-8 text-center">
          <h2 className="text-4xl font-bold">Early Feedback</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[1,2].map((i) => (
              <div key={i} className="bg-gray-800 p-6 rounded-2xl">
                <p className="italic text-gray-300">“HomeLift matched us in 24h and amazing service!”</p>
                <p className="mt-4 font-semibold">– Beta User {i}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative h-screen snap-start bg-black/90 backdrop-blur-sm flex items-start justify-center p-6">
        <div className="max-w-3xl space-y-4">
          <h2 className="text-4xl font-bold text-center">FAQs</h2>
          {[
            { q: 'How are HCPs vetted?', a: 'Police clearance, NIN & refs.' },
            { q: 'Unhappy with match?', a: 'Free replacement within 48h.' },
          ].map(({q,a}) => (
            <details key={q} className="bg-black/80 rounded-xl p-4 cursor-pointer text-gray-300">
              <summary className="font-medium">{q}</summary>
              <p className="mt-2 text-gray-400">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer (sticky bottom) */}
      <footer className="relative h-screen snap-end bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 text-center text-gray-400">  
        <div className="space-y-2">
          <p>© {year} HomeLift Africa. All rights reserved.</p>
          <p>
            Questions? <a href="https://wa.me/256700000000" className="underline">Chat on WhatsApp</a>
          </p>
        </div>
      </footer>
    </main>
  );
}