"use client"; // Marks this as a Client Component for interactivity and hooks

import React from 'react';

// --- Using Lucide React for icons ---
import { Mail, Phone, MapPin, Linkedin, Link, Briefcase, GraduationCap, Award, Lightbulb, User } from 'lucide-react'; // Added more icons

// Resume data structure augmented for the new layout and content
const resumeData = {
  name: "Elias M. Kizito",
  tagline: "Strategic Account Management | Enterprise Sales | Client Partnerships | I.T & Telecom | Tech Leader & AI Enthusiast",
  professionalPhoto: "https://res.cloudinary.com/dtrnpryf8/image/upload/v1750329381/prof-pic-ellz_iqnmhu.jpg", // Placeholder for Elias's professional photo. Replace with your actual photo URL!
  contact: {
    address: "Atlanta GA, Boston MA",
    phone: "(781)266-6798",
    email: "elias.mukasa@gmail.com",
    linkedin: {
      url: "https://linkedin.com/in/eliasmukasa",
      display: "linkedin.com/in/eliasmukasa"
    },
  },
  summary: `
        I help enterprises drive digital-transformation initiatives, optimize technology investments, and accelerate growth. With a background in enterprise sales, consulting, telecom, I.T. & engineering, I work with Fortune 500 companies, high-growth startups, and agencies to deliver data-driven strategies and measurable business impact.

        My Expertise:
        ✅ Enterprise Sales & Consulting Growth – Leading high-value consulting, SaaS, and technology sales while building executive-level relationships.
        ✅ Data-Driven Decision Making – Leveraging analytics & insights to improve business strategy, revenue growth, and customer success.
        ✅ Strategic Account Management – Expanding enterprise accounts, fostering cross-functional collaboration, and driving client success.
        ✅ Engineering & Technology Optimization – 10 years’ expertise in telecom, IT infrastructure, cloud solutions, and technical program execution, applying an engineering-first approach to complex challenges.
        `,
  keyStrengths: [
    "Enterprise Account Growth & Retention",
    "Strategic Partnership Development",
    "Digital Transformation Leadership",
    "Cross-functional Team Collaboration",
    "Solutions-Oriented Problem Solving",
    "Market Expansion & New Business Acquisition",
    "C-Suite Engagement & Influence",
    "Bilingual Communication (English & French)"
  ],
  skills: {
    technical: [
      "CRM Software (Salesforce, etc)",
      "Project Management Tools (Jira, Asana)",
      "Data Analytics (Power BI, Excel, Python)",
      "Cloud Platforms (Azure, AWS, GCP)",
      "Networking (WAN/LAN, NOC Operations)",
      "Telecom Solutions (OSS/BSS)",
      "5G & IoT Technologies",
      "A.I & Machine Learning Applications"
    ],
    business: [
      "Consultative Selling",
      "Strategic Account Planning",
      "Customer Success Management",
      "Business Development",
      "Contract Negotiation",
      "Market Research & Analysis",
      "Customer Relationship Management"
    ],
    soft: [
      "Strategic Communication",
      "Team Leadership & Mentorship",
      "Problem-Solving & Adaptability",
      "Cross-Cultural Collaboration",
      "Negotiation & Persuasion",
      "Client Advocacy"
    ]
  },
  achievements: [
    "Accelerated a new enterprise account from $0 to $4.5M ARR in 12 months by spearheading a consultative sales strategy aligned with client transformation goals, demonstrating exceptional client acquisition and value creation.",
    "Surpassed annual quota by 30% YoY, consistently driving both new client acquisition and robust retention across a Fortune 500 portfolio through proactive client engagement and strategic account management.",
    "Closed $9M+ in long-term strategic contracts through deep executive engagement and consultative bid leadership, ensuring alignment of complex solutions with enterprise transformation objectives.",
    "Secured $6M+ in enterprise agreements with global clients across Telecom and IT.",
  ],
  workHistory: [
    {
      period: "2021-09 - 2025-04",
      title: "Sr. Client Partner, Enterprise",
      company: "Andela Inc",
      companyWebsite: "https://andela.com/",
      logo: "https://res.cloudinary.com/dtrnpryf8/image/upload/v1750330069/andela_t9nsui.svg",
      bullets: [
        "Cultivated and scaled strategic enterprise account relationships, significantly driving client retention and expanding long-term partnerships by understanding evolving client needs and proposing tailored solutions.",
        "Spearheaded initial engagement strategies for new enterprise logos, leading qualification and relationship building with major new clients to foster foundational partnerships.",
        "Navigated complex stakeholder landscapes, fostering cross-departmental collaboration within client organizations to ensure successful project outcomes and mutual value realization.",
        "Directed cross-functional efforts with engineering, product, and analytics teams, ensuring alignment on client requirements and exceeding enterprise KPIs for managed services delivery.",
        "Maintained an exceptional 95% CSAT rating, proactively managing strategic client engagement and service delivery across diverse regions, demonstrating a commitment to client satisfaction.",
      ],
      keyDeliverables: [
        "Successfully launched strategic accounts generating $4.5M ARR in first year.",
        "Achieved 95% CSAT while managing large-scale enterprise deliveries.",
      ]
    },
    {
      period: "2019-06 - 2021-09",
      title: "Key Account Manager | Director Solution Sales",
      company: "Comviva Technologies",
      companyWebsite: "https://www.comviva.com/",
      logo: "https://res.cloudinary.com/dtrnpryf8/image/upload/v1750330437/Comviva_Logo-768x402_p8y7fe.jpg",
      bullets: [
        "Drove significant enterprise growth across telecom and IT verticals, leading strategic account development and expanding relationships with Fortune 500 clients and global telecom operators through deep understanding of their business challenges.",
        "Engaged executive leadership (CEO, CIO, CTO, and Procurement Heads) to define long-term strategic initiatives, establishing Comviva as a trusted innovation partner and influencing technology roadmaps.",
        "Architected and delivered complex enterprise mobility and digital solutions, seamlessly integrating IT and telecom services with marketing automation and digital engagement strategies for client success.",
        "Secured $6M+ in long-term enterprise agreements, translating intricate client business needs into scalable, revenue-generating solutions through expert negotiation and strategic influence.",
        "Optimized existing account strategies using performance data and client feedback, significantly boosting client retention and driving a sharp increase in up-sell and cross-sell opportunities.",
        "Leveraged industry partnerships (Microsoft, IBM) and telco-aligned solutions to expand market share and secure high-value contracts with new greenfield enterprise clients across EMEA.",
      ],
      keyDeliverables: [
        "Secured $6M+ in enterprise agreements across EMEA.",
        "Achieved 78% YoY revenue growth in key verticals."
      ]
    },
    {
      period: "2013-09 - 2019-05",
      title: "Sr. Technical Lead | Program Manager",
      company: "Comviva Technologies",
      companyWebsite: "https://www.comviva.com/",
      logo: "https://res.cloudinary.com/dtrnpryf8/image/upload/v1750330437/Comviva_Logo-768x402_p8y7fe.jpg",
      bullets: [
        "Partnered closely with sales and business teams, providing technical expertise and leadership in client consultations and pre-sales engagements to support existing enterprise client growth and satisfaction.",
        "Managed strategic client relationships, serving as a primary liaison between business, engineering, and operations teams to ensure seamless solution alignment with ongoing business objectives and delivery excellence.",
        "Led technical program execution and account operations, driving high-value service delivery, securing contract renewals, and significantly increasing platform adoption for existing clientele.",
        "Oversaw complex workstreams, collaborating effectively with cross-functional teams to drive solution adoption and enhance client retention through superior project management.",
        "Drove continuous service improvements by leveraging data analytics and customer insights, enhancing service reliability, operational efficiency, and customer satisfaction for established accounts.",
        "Identified and cultivated upselling and expansion opportunities within existing accounts, contributing to significant account growth and new business opportunities through seamless project execution and value demonstration.",
      ],
      keyDeliverables: [
        "Enhanced service reliability through data analytics, boosting customer satisfaction.",
        "Drove significant platform adoption and recurring revenue."
      ]
    },
    {
      period: "2009-03 - 2013-09",
      title: "Operations Engineer, NOC Manager",
      company: "Nokia (formerly Alcatel-Lucent)",
      companyWebsite: "https://www.nokia.com/",
      logo: "https://res.cloudinary.com/dtrnpryf8/image/upload/v1750330297/nokia-refreshed-logo-1_1_b7meqm.jpg",
      bullets: [
        "Led large-scale telecom and IT infrastructure projects, ensuring high availability, security, and SLA adherence for enterprise clients in the government and private sectors.",
        "Delivered managed services and large-scale infrastructure support for Orange Uganda, driving innovation across core WAN/LAN, NOC setup, and enterprise service delivery.",
        "Managed strategic enterprise accounts, working closely with sales, engineering, and business teams to align network capabilities with customer business needs, ensuring long-term adoption and retention.",
        "Built and optimized Network Operations Centers (NOCs), leading cross-functional teams to deliver seamless service operations, improve network uptime, and enhance customer satisfaction.",
        "Developed operational strategies that drove cost efficiency, service reliability, and digital transformation, contributing to higher customer retention and expanded solution adoption.",
        "Acted as a key enterprise liaison, collaborating with C-suite executives, sales teams, and technical stakeholders to align IT and network strategies with business growth objectives.",
        "Influenced enterprise-level decision-making, advising clients on infrastructure optimization, network security best practices, and cost-effective scaling strategies.",
      ],
      keyDeliverables: [
        "Successfully delivered managed services for Orange Uganda infrastructure expansion.",
        "Improved network uptime and customer satisfaction through NOC optimization."
      ]
    },
  ],
  education: [
    {
      degree: "Masters of Business Administration (MBA)",
      institution: "Herriot Watt University, Edinburgh Business School",
      location: "Edinburgh, UK",
      
    },
    {
      degree: "Bachelor of Science: Electrical & Electronics Engineering",
      institution: "University of Boumerdes",
      
    },
  ],
  certifications: [
    { name: "Business Analytics: From Data to Insights", issuingBody: "The Wharton School", badgeUrl: "https://res.cloudinary.com/dtrnpryf8/image/upload/v1750334131/Wharton-logo_qtrusa.png", verificationUrl: "https://certificates.emeritus.org/dde1763f-fe88-4a30-93cc-8ad902955175#acc.U0ymaHin" },
    { name: "Python for Managers", issuingBody: "Columbia University", badgeUrl: "https://res.cloudinary.com/dtrnpryf8/image/upload/v1750334030/4a0a38fc98e53426428e1dc08f8a1a5b_lafsay.png", verificationUrl: "https://certificates.emeritus.org/b7e66709-aab9-422a-945b-18f7dde74057#acc.oMjp5Ak2" },
    { name: "Project Management Professional (PMP)", issuingBody: "PMI", badgeUrl: "https://res.cloudinary.com/dtrnpryf8/image/upload/v1750333850/project-management-professional-pmp_oiua4w.png", verificationUrl: "https://www.credly.com/badges/e4b10790-5626-4fb7-983e-d9005ca84433/public_url" },
    { name: "Meta Certified Performance Marketing Specialist", issuingBody: "Meta", badgeUrl: "https://res.cloudinary.com/dtrnpryf8/image/upload/v1750333104/meta-certified-performance-marketing-specialist_yvlejs.png", verificationUrl: "https://www.credly.com/badges/43b5b651-c3ed-4666-aed0-83a490676beb/public_url" },
    { name: "Meta Certified Media Buying Professional", issuingBody: "Meta", badgeUrl: "https://res.cloudinary.com/dtrnpryf8/image/upload/v1750333167/meta-certified-media-buying-professional_tbbpqs.png", verificationUrl: "https://www.credly.com/badges/7140be50-9d20-493a-bf12-217502d803a4/public_url" },
  ],
  majorClients: [
    { name: "Global Telecom Operator X", industry: "Telecommunications", impact: "Led strategic account growth, resulting in 30% YoY revenue increase." },
    { name: "Fortune 500 Technology Company Y", industry: "IT Services", impact: "Secured $9M+ in long-term strategic contracts for digital transformation." },
    { name: "Large Government Agency Z", industry: "Public Sector IT", impact: "Managed infrastructure projects ensuring high availability and SLA adherence." },
  ],
  callToAction: {
    text: "Ready to elevate your partnerships?",
    buttonText: "Let's Connect",
    link: "mailto:elias.mukasa@gmail.com",
    linkedinText: "Connect with me on LinkedIn",
  },
};

// Main Resume Component, directly declared as a function
export default function EliasKizitoResumePage() {
  console.log("Rendering EliasKizitoResumePage component.");

  return (
    <div className="font-inter antialiased bg-gray-900 text-gray-300 min-h-screen p-4 sm:p-8 flex flex-col items-center">
      <div className="max-w-7xl xl:max-w-screen-xl w-full bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-700">
        {/* Header Section (Full Width) */}
        <header className="p-6 sm:p-8 bg-gradient-to-br from-blue-800 to-purple-900 text-white flex flex-col items-center text-center gap-6 relative overflow-hidden rounded-t-3xl">
            
          {/* Background overlay effect */}
          <div className="absolute inset-0 bg-white opacity-5 mix-blend-overlay pointer-events-none"></div>

          <img
            src={resumeData.professionalPhoto}
            alt={`${resumeData.name}'s professional photo`}
            className="w-34 h-34 rounded-full object-cover border-4 border-blue-400 shadow-lg mb-4 transform hover:scale-105 transition-transform duration-300 ease-out"
          />

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-lg z-10">
            {resumeData.name}
          </h1>
          <p className="text-xl sm:text-2xl font-semibold text-blue-100 max-w-2xl z-10">
            {resumeData.tagline}
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-6 z-10">
            <a href={`mailto:${resumeData.contact.email}`} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition duration-300 rounded-full px-5 py-2 font-bold text-lg shadow-md transform hover:scale-105">
              <Mail className="h-6 w-6" /> Email Me
            </a>
            <a href={resumeData.contact.linkedin.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 transition duration-300 rounded-full px-5 py-2 font-bold text-lg shadow-md transform hover:scale-105">
              <Linkedin className="h-6 w-6" /> LinkedIn
            </a>
            <a href={`tel:${resumeData.contact.phone}`} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 transition duration-300 rounded-full px-5 py-2 font-bold text-lg shadow-md transform hover:scale-105">
              <Phone className="h-6 w-6" /> Call Me
            </a>
          </div>
          <p className="text-sm text-blue-200 mt-2 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> {resumeData.contact.address}
          </p>
        </header>

        {/* Main Content Area (Two Columns) */}
        <div
            className="
                grid
                grid-cols-1
                /* ≥1024 px: sidebar = clamp(260 px,30%,360 px) */
                lg:grid-cols-[clamp(260px,30%,360px)_1fr]
 
                /* ≥1440 px: sidebar can grow a bit more but caps at 400 px */
                2xl:grid-cols-[clamp(300px,26%,400px)_1fr]
 
                gap-x-8 lg:gap-x-12 xl:gap-x-16
                border-t border-gray-700
            ">
    {/* Added border-t to separate from header */}
          {/* Sidebar (Left Column on Large Screens) */}
          <aside className="bg-gray-900 p-6 sm:p-8 space-y-8 min-w-[340px]">


            {/* Key Strengths */}
            <section className="bg-gray-800 p-6 rounded-xl shadow-inner border border-gray-700">
              <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2"><Lightbulb className="h-5 w-5"/> Key Strengths</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                {resumeData.keyStrengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </section>

            {/* Education Section */}
            <section className="bg-gray-800 p-6 rounded-xl shadow-inner border border-gray-700">
              <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2"><GraduationCap className="h-5 w-5"/> Education</h2>
              <div className="space-y-4">
                {resumeData.education.map((edu, index) => (
                  <div key={index} className="text-gray-300">
                    <h3 className="text-lg font-semibold text-white">{edu.degree}</h3>
                    <p className="text-md text-gray-200">{edu.institution}</p>
                    {edu.location && <p className="text-sm text-gray-400">{edu.location}</p>}
                  </div>
                ))}
              </div>
            </section>

            {/* Certifications Section */}
            <section className="bg-gray-800 p-6 rounded-xl shadow-inner border border-gray-700">
              <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2"><Award className="h-5 w-5"/> Certifications</h2>
              <div className="space-y-4">
                {resumeData.certifications.map((cert, index) => (
                  <a
                    key={index}
                    href={cert.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 group"
                  >
                    {cert.badgeUrl && (
                      <img src={cert.badgeUrl} alt={`${cert.name} badge`} className="w-12 h-12 object-contain rounded-lg flex-shrink-0" />
                    )}
                    <div>
                      <h3 className="text-base font-semibold text-white group-hover:text-blue-300 transition-colors">{cert.name}</h3>
                      <p className="text-xs text-gray-400">{cert.issuingBody}</p>
                    </div>
                    <Link className="ml-auto w-4 h-4 text-gray-400 group-hover:text-blue-300 transition-colors" />
                  </a>
                ))}
              </div>
            </section>

            {/* Skills Section (Moved to last in sidebar) */}
            <section className="bg-gray-800 p-6 rounded-xl shadow-inner border border-gray-700">
              <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2"><Briefcase className="h-5 w-5"/> Skills</h2>
              {['technical', 'business', 'soft'].map(category => (
                <div key={category} className="mb-4 last:mb-0">
                  <h3 className="text-lg font-semibold text-gray-200 capitalize mb-2">{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills[category as keyof typeof resumeData.skills].map((skill, index) => (
                      <span key={index} className="bg-gray-700 text-gray-300 text-sm px-3 py-1 rounded-full border border-gray-600">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </aside>

          {/* Main Content Area (Right Column on Large Screens) */}
          <main className="p-6 sm:p-10 space-y-10">

            {/* Professional Summary */}
            <section className="bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-700">
              <h2 className="text-2xl font-bold text-blue-400 mb-3">Professional Summary</h2>
              <p className="text-lg leading-relaxed whitespace-pre-line text-gray-300">{resumeData.summary}</p>
            </section>

            {/* Achievements Section */}
            <section className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700">
              <h2 className="text-2xl font-bold text-blue-400 mb-5">Key Achievements</h2>
              <ul className="list-none text-gray-300 space-y-4 text-lg">
                {resumeData.achievements.map((achievement, index) => (
                  <li key={index} className="leading-relaxed relative pl-6">
                    <span className="absolute left-0 text-blue-300">⭐</span> {achievement}
                  </li>
                ))}
              </ul>
            </section>

            {/* Work History Section */}
            <section className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700">
              <h2 className="text-2xl font-bold text-blue-400 mb-5">Work History</h2>
              <div className="space-y-10">
                {resumeData.workHistory.map((job, index) => (
                  <React.Fragment key={index}>
                    {/* Conditional "Continued at" label for consecutive roles at the same company */}
                    {index > 0 && job.company === resumeData.workHistory[index - 1].company && (
                        <div className="text-center text-gray-400 text-sm mt-6 mb-4 flex items-center justify-center">
                            <span className="flex-grow border-t border-gray-600"></span>
                            <span className="mx-4 italic">Continued at {job.company}</span>
                            <span className="flex-grow border-t border-gray-600"></span>
                        </div>
                    )}
                    <div className="bg-gray-700 p-6 rounded-xl shadow-md border border-gray-600 transform hover:scale-[1.01] transition-transform duration-200 ease-out">
                      <div className="flex items-center gap-4 mb-3">
                        {job.logo && (
                          <img
                            src={job.logo}
                            alt={`${job.company} logo`}
                            className="w-10 h-10 rounded-full object-contain bg-white p-1 shadow-inner flex-shrink-0"
                            // Add an onError handler for broken images if you prefer a fallback
                            onError={(e) => {
                              e.currentTarget.onerror = null; // Prevents infinite loop if fallback also fails
                              e.currentTarget.src = "https://placehold.co/40x40/555555/ffffff?text=CO"; // Fallback placeholder
                            }}
                          />
                        )}
                        <div>
                          <h3 className="text-2xl font-bold text-white">{job.title}</h3>
                          <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-lg text-gray-200 hover:text-blue-300 hover:underline transition-colors mt-1 block">
                            {job.company}
                          </a>
                          {/* Format period for display */}
                          <p className="text-sm text-gray-400">{job.period.replace(/-/g, ' - ')}</p>
                        </div>
                      </div>
                      <ul className="list-disc list-inside text-gray-300 space-y-2">
                        {job.bullets.map((bullet, i) => (
                          <li key={i} className="leading-relaxed">{bullet}</li>
                        ))}
                      </ul>
                      {job.keyDeliverables && job.keyDeliverables.length > 0 && (
                        <div className="mt-4 p-4 bg-gray-600/50 rounded-lg border border-gray-500">
                          <p className="text-md font-semibold text-white mb-2">Key Projects / Deliverables:</p>
                          <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                            {job.keyDeliverables.map((deliverable, i) => (
                              <li key={i}>{deliverable}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </section>

            {/* Major Clients Section */}
            <section className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700">
              <h2 className="text-2xl font-bold text-blue-400 mb-6">Major Clients & Impact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {resumeData.majorClients.map((client, index) => (
                  <div key={index} className="bg-gray-700 p-6 rounded-xl shadow-md border border-gray-600 transform hover:scale-[1.02] transition-transform duration-200 ease-out">
                    <h3 className="text-xl font-bold text-white mb-2">{client.name}</h3>
                    <p className="text-lg text-gray-200 mb-1">Industry: <span className="font-semibold">{client.industry}</span></p>
                    <p className="text-gray-300 leading-relaxed italic">{client.impact}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Call to Action at the End */}
            <section className="bg-gradient-to-br from-black to-blue-900 flex flex-col items-center justify-center p-8 text-center rounded-xl shadow-lg border border-blue-900">
              <h2 className="text-3xl md:text-4xl font-extrabold text-blue-300 drop-shadow-lg mb-6">
                {resumeData.callToAction.text}
              </h2>
              <a
                href={resumeData.callToAction.link}
                className="bg-blue-600 hover:bg-blue-500 transition duration-300 rounded-xl px-8 py-4 font-bold text-xl shadow-lg transform hover:scale-105 mb-4 flex items-center gap-3"
              >
                <Mail className="h-7 w-7" /> {resumeData.callToAction.buttonText}
              </a>
              <a
                href={resumeData.contact.linkedin.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-lg hover:underline opacity-80 hover:opacity-100 transition flex items-center gap-2"
              >
                <Linkedin className="h-6 w-6" /> {resumeData.callToAction.linkedinText}
              </a>
            </section>
          </main>
        </div>
      </div>

      {/* Footer (outside the main content block for full width alignment) */}
      <footer className="py-6 bg-gray-950 text-center text-gray-500 text-sm mt-8 w-full max-w-6xl">
        <p>&copy; {new Date().getFullYear()} Elias M. Kizito. All rights reserved.</p>
      </footer>
    </div>
  );
}
