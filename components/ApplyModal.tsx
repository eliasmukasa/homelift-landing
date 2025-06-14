import { useState } from "react";

export default function LandingPage() {
  return (
    <main className="bg-black text-white font-sans">
      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[url('/sofa-hero.jpg')] bg-cover bg-center">
        <h1 className="text-4xl md:text-6xl font-bold max-w-2xl leading-tight">
          Your home, <span className="text-blue-400">lifted.</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-gray-300">
          Vetted, insured, and continuously trained Home-Care Professionals — matched to your
          household in under 48 hours.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <a
            href="https://bit.ly/homelift-hh"
            target="_blank"
            className="bg-blue-600 hover:bg-blue-500 transition rounded-xl px-6 py-3 font-semibold shadow-lg"
          >
            🏠 Get Early Access
          </a>
          <a
            href="https://bit.ly/4jO0EMZ"
            target="_blank"
            className="bg-green-600 hover:bg-green-500 transition rounded-xl px-6 py-3 font-semibold shadow-lg"
          >
            👩‍🍳 Apply as HCP
          </a>
        </div>
      </section>

      {/* Early-bird Benefits */}
      <section className="max-w-6xl mx-auto py-16 px-6 grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-2xl font-bold mb-4">Early-Bird Benefits for Households</h2>
          <ul className="space-y-3 text-gray-300 list-disc list-inside">
            <li>Free replacement in first 30 days</li>
            <li>UGX 200 K launch credit</li>
            <li>Priority 48-hr matching</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Early-Bird Benefits for HCPs</h2>
          <ul className="space-y-3 text-gray-300 list-disc list-inside">
            <li>Free core-skills training</li>
            <li>Weekly MoMo payout</li>
            <li>Career growth & certification</li>
          </ul>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-gray-900 py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-12">How HomeLift Works</h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Tell us your needs",
              icon: "📝",
              desc: "Fill our quick form with your household requirements."
            },
            {
              title: "We match vetted HCPs",
              icon: "🤝",
              desc: "Our algorithm and team pick the best-fit professionals."
            },
            {
              title: "Ongoing concierge support",
              icon: "📞",
              desc: "Swap, upgrade, or get help via WhatsApp 24/7."
            }
          ].map((s, i) => (
            <div key={i} className="bg-gray-800 p-6 rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">{s.icon}</div>
              <h3 className="font-semibold text-xl mb-2">{s.title}</h3>
              <p className="text-gray-400 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Founder story placeholder */}
      <section className="max-w-4xl mx-auto py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Meet the Founders</h2>
        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
          Watch a quick 60-second story on why Florence & Elias are on a mission to lift the quality of home life in Africa.
        </p>
        <div className="aspect-w-16 aspect-h-9 max-w-3xl mx-auto bg-gray-800 rounded-2xl flex items-center justify-center text-gray-500">
          {/* Replace with real video embed */}
          Video placeholder
        </div>
      </section>

      {/* Testimonials placeholder */}
      <section className="bg-gray-900 py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Early Customers Feedback</h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {[1, 2].map((_, i) => (
            <div key={i} className="bg-gray-800 p-6 rounded-2xl">
              <p className="italic text-gray-300">“Placeholder quote – HomeLift matched us with a fantastic housekeeper within 24 hours!”</p>
              <p className="mt-4 font-semibold">– Kampala Beta User</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-5xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-12">FAQs</h2>
        <details className="bg-gray-900 rounded-xl p-4 mb-4 cursor-pointer">
          <summary className="font-medium">How are HCPs vetted?</summary>
          <p className="text-gray-400 mt-2">We verify police clearance, NIN, and run reference checks.</p>
        </details>
        <details className="bg-gray-900 rounded-xl p-4 mb-4 cursor-pointer">
          <summary className="font-medium">What if I’m not happy with the match?</summary>
          <p className="text-gray-400 mt-2">We offer a free replacement within 48 hours of notice.</p>
        </details>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 py-10 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} HomeLift Africa. All rights reserved.</p>
        <p className="mt-1">Questions? <a href="https://wa.me/256700000000" className="underline">Chat on WhatsApp</a></p>
      </footer>
    </main>
  );
}

