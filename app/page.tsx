"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline"; // Corrected import for XMarkIcon

// --- ApplyModal Component (for self-contained immersive) ---
type ApplyModalProps = {
  formUrl: string;
  isOpen: boolean;
  onClose: () => void;
};

const ApplyModal = ({ formUrl, isOpen, onClose }: ApplyModalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsLoading(true); // Reset loading state when modal closes
      setLoadError(false);
    }
  }, [isOpen]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setLoadError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setLoadError(true);
    console.error("Failed to load Airtable form.");
  };

  if (!isOpen) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="relative bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Removed the header div below */}
        {/* <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {formUrl.includes("hh") ? "Household Inquiry" : "HCP Application"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 transition"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div> */}
        <div className="flex-grow relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
              <div className="flex flex-col items-center">
                <svg className="animate-spin h-8 w-8 text-blue-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>Loading form...</p>
              </div>
            </div>
          )}
          {loadError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-900 text-white p-4 text-center">
                <div className="flex flex-col items-center">
                    <XMarkIcon className="h-12 w-12 text-red-400 mb-3" />
                    <p className="text-xl font-bold">Error loading form.</p>
                    <p className="mt-2 text-sm">Please ensure your Airtable form is publicly shareable and try again. Or check your internet connection.</p>
                </div>
            </div>
          )}
          <iframe
            src={formUrl}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            frameBorder="0"
            className={`w-full h-full ${isLoading || loadError ? 'hidden' : ''}`}
            sandbox="allow-scripts allow-popups allow-top-navigation-by-user-activation allow-forms allow-same-origin" // Important for security and functionality
          ></iframe>
        </div>
      </motion.div>
    </motion.div>,
    document.body // Portal to body for better layering
  );
};

// Airtable embed URLs (replace with your actual public share links from a supported layout!)
const HH_FORM_URL = "https://airtable.com/embed/apprHdPkKz0GxMw7D/pagPbIcvWw4kXFqjH?hide_title=true&backgroundColor=grey&view_controls=off";
const HCP_FORM_URL = "https://airtable.com/embed/apprHdPkKz0GxMw7D/pag90o8qNsuVlWBpX?hide_title=true&backgroundColor=grey&view_controls=off";

export default function LandingPage() {
  const [openForm, setOpenForm] = useState("none");
  const activeFormUrl = openForm === "hh" ? HH_FORM_URL : HCP_FORM_URL;
  const year = new Date().getFullYear();

  // Master scroll progress for the entire page
  const mainRef = useRef(null);
  const { scrollYProgress: mainScrollYProgress } = useScroll({ target: mainRef });

  // Refs for each section for more precise control
  const heroRef = useRef(null);
  const benefitsRef = useRef(null);
  const howItWorksRef = useRef(null);
  // Removed foundersRef
  const testimonialsRef = useRef(null);
  const faqRef = useRef(null);
  const footerRef = useRef(null);

  // --- GLOBAL BACKGROUND PARALLAX ---
  // Background image scrolls slowly
  const backgroundY = useTransform(mainScrollYProgress, [0, 1], ['0%', '20%']); // Image moves 20% of scroll height
  // The 'background' effect on sections themselves
  // This opacity applies to the black/blur overlay that covers the fixed background image
  const sectionBgOpacity = useTransform(mainScrollYProgress, [0, 0.15, 0.85, 1], [0.1, 0.7, 0.8, 0.9]); // Increased start opacity, smoother ramp

  // --- HERO SECTION (Sticky/Parallax) ---
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"] // Pin the hero section as long as its bottom is within view
  });

  // Hero content fades out and moves up as it pins
  const heroContentOpacity = useTransform(heroScrollProgress, [0, 0.5], [1, 0]);
  const heroContentY = useTransform(heroScrollProgress, [0, 0.5], ['0%', '-50%']); // Content moves up faster

  // --- BENEFITS SECTION (Fade/Slide in from below, over the background) ---
  const { scrollYProgress: benefitsScrollProgress } = useScroll({
    target: benefitsRef,
    offset: ["start end", "center center"] // Starts animating when section enters view, ends when center hits center
  });
  const benefitsOpacity = useTransform(benefitsScrollProgress, [0, 0.5], [0, 1]);
  const benefitsY = useTransform(benefitsScrollProgress, [0, 0.5], [100, 0]);
  const benefitsScale = useTransform(benefitsScrollProgress, [0, 0.5], [0.9, 1]);

  // --- HOW IT WORKS SECTION (Cards reveal with staggered effect) ---
  const { scrollYProgress: howItWorksScrollProgress } = useScroll({
    target: howItWorksRef,
    offset: ["start end", "center center"]
  });
  const howItWorksOpacity = useTransform(howItWorksScrollProgress, [0, 0.5], [0, 1]);
  const howItWorksY = useTransform(howItWorksScrollProgress, [0, 0.5], [100, 0]);

  // Removed Founders section animation variables
  // const { scrollYProgress: foundersScrollProgress } = useScroll({
  //   target: foundersRef,
  //   offset: ["start end", "center center"]
  // });
  // const foundersOpacity = useTransform(foundersScrollProgress, [0, 0.5], [0, 1]);
  // const foundersScale = useTransform(foundersScrollProgress, [0, 0.5], [0.7, 1]);

  // --- TESTIMONIALS SECTION (Cards slide in from sides) ---
  const { scrollYProgress: testimonialsScrollProgress } = useScroll({
    target: testimonialsRef,
    offset: ["start end", "center center"]
  });
  const testimonialsOpacity = useTransform(testimonialsScrollProgress, [0, 0.5], [0, 1]);
  const testimonialCard1X = useTransform(testimonialsScrollProgress, [0, 0.5], [-200, 0]);
  const testimonialCard2X = useTransform(testimonialsScrollProgress, [0, 0.5], [200, 0]);

  // --- FAQ SECTION (Accordion reveal) ---
  const { scrollYProgress: faqScrollProgress } = useScroll({
    target: faqRef,
    offset: ["start end", "center center"]
  });
  const faqOpacity = useTransform(faqScrollProgress, [0, 0.5], [0, 1]);
  const faqY = useTransform(faqScrollProgress, [0, 0.5], [50, 0]);


  return (
    // Main container with fixed background and sticky mechanism
    <main
      ref={mainRef}
      className="font-sans text-white min-h-[450vh] overflow-x-hidden relative" // Increased min-height for more scroll
    >
      {/* Fixed Background Image */}
      <motion.div
        className="fixed inset-0 bg-cover bg-center -z-10" // -z-10 to stay behind content
        style={{
          backgroundImage: "url('https://res.cloudinary.com/dtrnpryf8/image/upload/v1749953728/sofa-hero_sq26dq.png')", // Cloudinary URL
          backgroundPositionY: backgroundY, // Apply parallax to fixed background
        }}
      ></motion.div>

      {/* Hero Section - Pinned and content animates */}
      <motion.section
        ref={heroRef}
        className="sticky top-0 h-screen flex flex-col items-center justify-center text-center p-8 z-0"
        style={{
          // We apply a subtle gradient background to sections to ensure continuity and avoid hard cuts
          // This background can blur / fade in as the section scrolls
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8))',
          backdropFilter: 'blur(5px)', // Initial blur for hero over fixed background
          WebkitBackdropFilter: 'blur(5px)', // Safari support
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ opacity: heroContentOpacity, y: heroContentY }} // Animates with scroll
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-extrabold max-w-4xl leading-tight drop-shadow-lg z-10"
        >
          Your home, <span className="text-blue-400">lifted.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ opacity: heroContentOpacity, y: heroContentY }} // Animates with scroll
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="mt-6 max-w-xl text-xl md:text-2xl text-white/90 bg-black/30 backdrop-blur-md rounded-lg px-6 py-3 inline-block shadow-xl z-10"
        >
          Vetted and continuously trained Home-Care Professionals — matched to your household in under 48 hours.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ opacity: heroContentOpacity, y: heroContentY }} // Animates with scroll
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mt-10 flex flex-col sm:flex-row gap-4 z-10"
        >
          <button
            type="button"
            onClick={() => setOpenForm("hh")}
            className="bg-blue-600 hover:bg-blue-500 transition duration-300 rounded-xl px-8 py-4 font-bold text-lg shadow-lg transform hover:scale-105"
          >
            🏠 Get Early Access
          </button>
          <button
            type="button"
            onClick={() => setOpenForm("hcp")}
            className="bg-green-600 hover:bg-green-500 transition duration-300 rounded-xl px-8 py-4 font-bold text-lg shadow-lg transform hover:scale-105"
          >
            👩‍🍳 Apply as HCP
          </button>
        </motion.div>
      </motion.section>

      {/* Modal Embed (using AnimatePresence for exit animations) */}
      <AnimatePresence>
        {openForm !== "none" && (
          <ApplyModal
            formUrl={activeFormUrl}
            isOpen={openForm !== "none"}
            onClose={() => setOpenForm("none")}
          />
        )}
      </AnimatePresence>

      {/* Benefits Section - Fades and slides over global background */}
      <motion.section
        ref={benefitsRef}
        style={{ opacity: benefitsOpacity, y: benefitsY, scale: benefitsScale }}
        className="relative min-h-screen flex items-center justify-center p-8 z-10"
      >
         <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-md" // Darker, blurred overlay
          style={{ opacity: sectionBgOpacity }}
         ></motion.div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 p-6 bg-gray-800/60 rounded-3xl shadow-xl border border-gray-700 relative z-20">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-blue-300">Benefits for Households</h2>
            <ul className="space-y-4 text-gray-200 list-disc list-inside text-lg">
              <li>Free replacement in first 30 days - Your satisfaction, guaranteed.</li>
              <li>UGX 200 K launch credit - Special offer for early adopters.</li>
              <li>Priority 48-hr matching - Quick, reliable service when you need it most.</li>
              <li>Police-verified HCPs - Peace of mind with every match.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6 text-green-300">Benefits for HCPs</h2>
            <ul className="space-y-4 text-gray-200 list-disc list-inside text-lg">
              <li>Free core-skills training - Elevate your professional expertise.</li>
              <li>Weekly MoMo payout - Consistent and reliable income.</li>
              <li>Career growth & certification - Build a dignified and rewarding career.</li>
              <li>Access to health insurance - We care for your well-being.</li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* How It Works Section - Content appears over fixed background */}
      <motion.section
        ref={howItWorksRef}
        style={{ opacity: howItWorksOpacity, y: howItWorksY }}
        className="relative min-h-screen flex flex-col items-center justify-center p-8 z-10"
      >
        <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md" // Even darker blur overlay
            style={{ opacity: sectionBgOpacity }}
        ></motion.div>
        <div className="max-w-5xl mx-auto text-center space-y-10 relative z-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-md">How HomeLift Works</h2>
          <div className="grid md:grid-cols-3 gap-10 mt-8">
            {[
              { icon: '📝', title: 'Tell Us Your Needs', desc: 'Share your specific requirements. We help define the role and skills you need for your home.' },
              { icon: '🌟', title: 'Vetted & Trained Professionals', desc: 'Our HCPs undergo rigorous background checks, police clearance, and continuous skills training to ensure excellence.' }, // Andela-inspired
              { icon: '🧠', title: 'Intelligent Matching', desc: 'Leveraging our data-driven system, we expertly match your family with the most compatible and qualified HCPs.' }, // Andela-inspired
              { icon: '🤝', title: 'Seamless Placement', desc: 'We facilitate a smooth onboarding process, ensuring your selected HCP integrates perfectly into your household routine.' }, // Andela-inspired
              { icon: '📞', title: 'Ongoing Support & Growth', desc: 'Benefit from continuous support, managed payroll, and opportunities for HCPs to advance their careers through advanced certifications.' }, // Andela-inspired
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 50 }}
                // Animate based on this section's scroll progress
                animate={howItWorksScrollProgress.get() > 0.3 ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                className="bg-gray-800 p-8 rounded-3xl shadow-xl flex flex-col items-center transform hover:scale-105 transition duration-300 border border-gray-700"
              >
                <span className="text-6xl mb-5 text-blue-400">{item.icon}</span>
                <h3 className="font-semibold text-2xl mb-3 text-white">{item.title}</h3>
                <p className="text-gray-400 text-base text-center">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section - Cards slide in over fixed background */}
      <motion.section
        ref={testimonialsRef}
        style={{ opacity: testimonialsOpacity }}
        className="relative min-h-screen flex items-center justify-center p-8 z-10"
      >
        <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            style={{ opacity: sectionBgOpacity }}
        ></motion.div>
        <div className="max-w-5xl mx-auto text-center space-y-10 relative z-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-md">What Our Early Adopters Say</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <motion.div
              style={{ x: testimonialCard1X }}
              initial={{ opacity: 0 }}
              animate={testimonialsScrollProgress.get() > 0.3 ? { opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
              className="bg-gray-800/60 p-8 rounded-3xl shadow-xl border border-gray-700"
            >
              <p className="italic text-gray-300 text-lg leading-relaxed">
                “HomeLift Africa truly delivered! We were matched with an incredible caregiver in just 24 hours. The service is seamless, and the professionalism is unmatched. Our family life has been so much simpler since.”
              </p>
              <p className="mt-6 font-semibold text-blue-300 text-xl">– Mama Nalubwama, Early Household Adopter</p>
            </motion.div>
            <motion.div
              style={{ x: testimonialCard2X }}
              initial={{ opacity: 0 }}
              animate={testimonialsScrollProgress.get() > 0.3 ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-800/60 p-8 rounded-3xl shadow-xl border border-gray-700"
            >
              <p className="italic text-gray-300 text-lg leading-relaxed">
                “As an HCP, HomeLift Africa changed my life. The free training improved my skills, and getting paid weekly via MoMo has brought so much stability. I finally feel valued and have a path for career growth.”
              </p>
              <p className="mt-6 font-semibold text-green-300 text-xl">– Sarah N., Home-Care Professional</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        ref={faqRef}
        style={{ opacity: faqOpacity, y: faqY }}
        className="relative min-h-screen flex items-center justify-center p-8 z-10"
      >
        <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            style={{ opacity: sectionBgOpacity }}
        ></motion.div>
        <div className="max-w-3xl w-full space-y-6 bg-gray-800/60 rounded-3xl shadow-xl p-8 border border-gray-700 relative z-20">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 text-white drop-shadow-md">Frequently Asked Questions</h2>
          {[
            { q: 'How are Home-Care Professionals (HCPs) vetted?', a: 'Our HCPs undergo a rigorous vetting process including police clearance, National Identification Number (NIN) verification, and comprehensive reference checks to ensure trustworthiness and reliability.' },
            { q: 'What if I am unhappy with my match?', a: 'We offer a free replacement within the first 48 hours if you are not completely satisfied with your Home-Care Professional. Your peace of mind is our priority.' },
            { q: 'How does the payment system work?', a: 'Households pay HomeLift Africa, and we ensure HCPs receive their salary bi-weekly via Mobile Money (MoMo), providing reliable and consistent income.' },
            { q: 'Is training provided to HCPs?', a: 'Absolutely! All HCPs receive free core-skills training upon joining, with opportunities for advanced, paid certifications and continuous professional development.' },
            { q: 'How can I get early access or apply?', a: 'Simply click the "Get Early Access" button if you\'re a household or "Apply as HCP" button above to fill out our quick inquiry forms.'}
          ].map(({q,a}) => (
            <details key={q} className="bg-gray-800 rounded-xl p-6 cursor-pointer text-gray-200 border border-gray-700 transition-all duration-300 ease-in-out hover:bg-gray-700">
              <summary className="font-semibold text-xl leading-relaxed">
                {q}
                <span className="float-right text-2xl transform transition-transform duration-300 ease-in-out">▼</span>
              </summary>
              <p className="mt-4 text-gray-400 text-base leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </motion.section>

      {/* Call to Action at the End */}
      <section className="relative min-h-[50vh] bg-gradient-to-br from-black to-blue-900 flex flex-col items-center justify-center p-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-5xl font-extrabold text-blue-300 drop-shadow-lg mb-8"
        >
          Ready to lift your home life?
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <button
            type="button"
            onClick={() => setOpenForm("hh")}
            className="bg-blue-600 hover:bg-blue-500 transition duration-300 rounded-xl px-10 py-5 font-bold text-xl shadow-lg transform hover:scale-105"
          >
            🏠 Find Your HCP
          </button>
          <button
            type="button"
            onClick={() => setOpenForm("hcp")}
            className="bg-green-600 hover:bg-green-500 transition duration-300 rounded-xl px-10 py-5 font-bold text-xl shadow-lg transform hover:scale-105"
          >
            👩‍🍳 Start Your Career
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        ref={footerRef}
        className="relative py-12 bg-gray-950 flex flex-col items-center justify-center p-8 text-center text-gray-500"
      >
        <div className="space-y-4">
          <p className="text-lg">&copy; {year} HomeLift Africa. All rights reserved.</p>
          <p className="text-lg">
            Questions? <a href="https://wa.me/256700000000" target="_blank" rel="noopener noreferrer" className="underline text-blue-400 hover:text-blue-300 transition">Chat on WhatsApp</a>
          </p>
          <div className="flex gap-4 justify-center mt-4">
            {/* Add social media icons here if applicable */}
            <a href="#" className="text-gray-400 hover:text-white transition" aria-label="Facebook"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.988H7.72V12h2.718V9.771c0-2.697 1.62-4.17 4.043-4.17 1.161 0 2.158.214 2.456.31v2.69h-1.597c-1.258 0-1.503.6-1.503 1.47v1.928h3.003l-.479 3.011h-2.524v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/></svg></a>
            <a href="#" className="text-gray-400 hover:text-white transition" aria-label="LinkedIn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm-2 16h-3v-9h3v9zm-1.5-10.5c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zm8.5 10.5h-3v-5.604c0-3.368 4-3.593 4 0v5.604h-1zm-4 0h-3v-9h3v9z"/></svg></a>
          </div>
        </div>
      </footer>
    </main>
  );
}