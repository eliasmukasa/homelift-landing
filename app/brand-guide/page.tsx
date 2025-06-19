"use client"; // Marks this as a Client Component for interactivity if needed, though mostly static HTML

import React from 'react';

export default function HomeLiftBrandVisualGuide() {
    return (
        <div className="font-inter antialiased bg-[#0f172a] text-gray-200 min-h-screen p-6 sm:p-10">
            <div className="max-w-6xl mx-auto bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-700">
                {/* Header */}
                <header className="p-8 bg-gradient-to-br from-blue-800 to-purple-900 text-white text-center rounded-t-3xl">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">HomeLift Africa</h1>
                    <p className="text-xl sm:text-2xl font-semibold text-blue-100">Visual Brand Guidelines</p>
                </header>

                {/* Main Content Sections */}
                <main className="p-6 sm:p-8 space-y-12">

                    {/* 1. Logo Usage Guidelines */}
                    <section>
                        <h2 className="text-3xl font-bold text-blue-400 mb-6">1. Logo Usage Guidelines</h2>
                        <p className="text-lg text-gray-300 mb-8">The HomeLift Africa logo is our primary visual identifier. Consistent and correct usage ensures brand recognition and professionalism.</p>

                        {/* 1.1. Primary Logo */}
                        <div className="mb-10">
                            <h3 className="text-2xl font-semibold text-white mb-4">1.1. Primary Logo</h3>
                            <div className="bg-[#1f2937] p-8 rounded-xl border border-[#374151] flex flex-col items-center justify-center min-h-[200px] shadow-lg">
                                <img src="https://res.cloudinary.com/dtrnpryf8/image/upload/v1750337672/HomeLift-logo-full-color_d2luz0.png" alt="HomeLift Africa Primary Logo" className="max-w-[280px] sm:max-w-xs h-auto drop-shadow-md" />
                                <p className="text-gray-400 text-sm mt-4">Preferred usage for maximum impact.</p>
                            </div>
                            <p className="text-gray-400 text-sm mt-4">
                                **Clear Space:** Maintain a minimum clear space equal to half the height of the "H" in "HomeLift" around the logo.
                            </p>
                            <p className="text-gray-400 text-sm mt-2">
                                **Minimum Size:** Never reproduce smaller than 40px height (digital) / 1.5 cm height (print).
                            </p>
                        </div>

                        {/* 1.2. Logo Variations */}
                        <div className="mb-10">
                            <h3 className="text-2xl font-semibold text-white mb-4">1.2. Logo Variations</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-gray-950 p-8 rounded-xl border border-[#374151] flex flex-col items-center justify-center min-h-[200px] shadow-lg">
                                    <img src="https://res.cloudinary.com/dtrnpryf8/image/upload/v1750337672/HomeLift-logo-white_q7y5m7.png" alt="HomeLift Africa Monochrome White Logo" className="max-w-[280px] sm:max-w-xs h-auto drop-shadow-md" />
                                    <p className="text-gray-400 text-sm mt-4">Monochrome (White/Light) for dark backgrounds.</p>
                                </div>
                                <div className="bg-[#1f2937] p-8 rounded-xl border border-[#374151] flex flex-col items-center justify-center min-h-[200px] shadow-lg">
                                    <img src="https://res.cloudinary.com/dtrnpryf8/image/upload/v1750337672/HomeLift-icon-color_k4u6b8.png" alt="HomeLift Africa Icon Only Logo" className="max-w-[100px] h-auto drop-shadow-md" />
                                    <p className="text-gray-400 text-sm mt-4">Icon-Only ("HL" Symbol) for small spaces.</p>
                                </div>
                            </div>
                        </div>

                        {/* 1.3. What to Avoid (Logo Misuse) */}
                        <div>
                            <h3 className="text-2xl font-semibold text-red-400 mb-4">1.3. What to Avoid (Logo Misuse)</h3>
                            <p className="text-lg text-gray-300 mb-6">To protect our brand's integrity, please **DO NOT**:</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {/* Stretched */}
                                <div className="bg-[#1f2937] p-8 rounded-xl border border-red-500 flex flex-col items-center justify-center min-h-[200px] shadow-lg">
                                    <img src="https://res.cloudinary.com/dtrnpryf8/image/upload/v1750337672/HomeLift-logo-full-color_d2luz0.png" alt="Stretched Logo" className="max-w-[280px] sm:max-w-xs h-auto transform scale-y-150 transition-transform duration-300" />
                                    <p className="text-red-300 text-base mt-4 font-bold">DO NOT Stretch or Distort</p>
                                </div>
                                {/* Wrong Colors */}
                                <div className="bg-[#1f2937] p-8 rounded-xl border border-red-500 flex flex-col items-center justify-center min-h-[200px] shadow-lg">
                                    <img src="https://res.cloudinary.com/dtrnpryf8/image/upload/v1750337672/HomeLift-logo-full-color_d2luz0.png" alt="Wrong Colors Logo" className="max-w-[280px] sm:max-w-xs h-auto filter hue-rotate-90 saturate-200 transition-filter duration-300" />
                                    <p className="text-red-300 text-base mt-4 font-bold">DO NOT Change Colors</p>
                                </div>
                                {/* Rearranged Elements */}
                                <div className="bg-[#1f2937] p-8 rounded-xl border border-red-500 flex flex-col items-center justify-center min-h-[200px] shadow-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="text-4xl font-extrabold text-blue-400">HL</span>
                                        <span className="text-lg font-bold text-gray-300">Africa HomeLift</span>
                                    </div>
                                    <p className="text-red-300 text-base mt-4 font-bold">DO NOT Rearrange Elements</p>
                                </div>
                                {/* Too Small (visual cue) */}
                                <div className="bg-[#1f2937] p-8 rounded-xl border border-red-500 flex flex-col items-center justify-center min-h-[200px] shadow-lg">
                                    <img src="https://res.cloudinary.com/dtrnpryf8/image/upload/v1750337672/HomeLift-logo-full-color_d2luz0.png" alt="Too Small Logo" className="max-w-[80px] h-auto opacity-70" />
                                    <p className="text-red-300 text-base mt-4 font-bold">DO NOT Use Too Small</p>
                                </div>
                                {/* Rotated */}
                                <div className="bg-[#1f2937] p-8 rounded-xl border border-red-500 flex flex-col items-center justify-center min-h-[200px] shadow-lg">
                                    <img src="https://res.cloudinary.com/dtrnpryf8/image/upload/v1750337672/HomeLift-logo-full-color_d2luz0.png" alt="Rotated Logo" className="max-w-[280px] sm:max-w-xs h-auto transform rotate-12 transition-transform duration-300" />
                                    <p className="text-red-300 text-base mt-4 font-bold">DO NOT Rotate</p>
                                </div>
                                {/* Bad Background */}
                                <div className="p-8 rounded-xl border border-red-500 flex flex-col items-center justify-center min-h-[200px] shadow-lg bg-[url('https://placehold.co/600x400/FF00FF/000000/noise?text=BUSY+BACKGROUND')] bg-cover bg-center">
                                    <img src="https://res.cloudinary.com/dtrnpryf8/image/upload/v1750337672/HomeLift-logo-full-color_d2luz0.png" alt="Logo on Busy Background" className="max-w-[280px] sm:max-w-xs h-auto" />
                                    <p className="text-red-300 text-base mt-4 font-bold text-center">DO NOT Place on Busy/Clashing Backgrounds</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. Color Palette */}
                    <section>
                        <h2 className="text-3xl font-bold text-blue-400 mb-6">2. Color Palette</h2>
                        <p className="text-lg text-gray-300 mb-8">Our color palette reflects HomeLift Africa's core values: **trust, professionalism, growth, and ease**.</p>

                        {/* 2.1. Primary Brand Colors */}
                        <div className="mb-8">
                            <h3 className="text-2xl font-semibold text-white mb-4">2.1. Primary Brand Colors</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {/* HomeLift Blue */}
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-xl flex items-center justify-center text-xs font-semibold text-white text-center border border-white/10 bg-[#2563EB]">#2563EB</div>
                                    <p className="mt-2 font-semibold text-lg">HomeLift Blue</p>
                                    <p className="text-gray-400 text-sm">(37, 99, 235)</p>
                                    <p className="text-gray-500 text-xs text-center mt-1">Reliability, Professionalism</p>
                                </div>
                                {/* HomeLift Green */}
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-xl flex items-center justify-center text-xs font-semibold text-white text-center border border-white/10 bg-[#16A34A]">#16A34A</div>
                                    <p className="mt-2 font-semibold text-lg">HomeLift Green</p>
                                    <p className="text-gray-400 text-sm">(22, 163, 74)</p>
                                    <p className="text-gray-500 text-xs text-center mt-1">Growth, Care</p>
                                </div>
                            </div>
                        </div>

                        {/* 2.2. Neutral Palette */}
                        <div className="mb-8">
                            <h3 className="text-2xl font-semibold text-white mb-4">2.2. Neutral Palette</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {/* Deep Charcoal */}
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-xl flex items-center justify-center text-xs font-semibold text-gray-300 text-center border border-white/10 bg-[#111827]">#111827</div>
                                    <p className="mt-2 font-semibold text-lg">Deep Charcoal</p>
                                    <p className="text-gray-400 text-sm">(17, 24, 39)</p>
                                    <p className="text-gray-500 text-xs text-center mt-1">Primary background</p>
                                </div>
                                {/* Dark Grey */}
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-xl flex items-center justify-center text-xs font-semibold text-gray-300 text-center border border-white/10 bg-[#1F2937]">#1F2937</div>
                                    <p className="mt-2 font-semibold text-lg">Dark Grey</p>
                                    <p className="text-gray-400 text-sm">(31, 41, 55)</p>
                                    <p className="text-gray-500 text-xs text-center mt-1">Secondary background</p>
                                </div>
                                {/* Mid Grey */}
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-xl flex items-center justify-center text-xs font-semibold text-gray-300 text-center border border-white/10 bg-[#374151]">#374151</div>
                                    <p className="mt-2 font-semibold text-lg">Mid Grey</p>
                                    <p className="text-gray-400 text-sm">(55, 65, 81)</p>
                                    <p className="text-gray-500 text-xs text-center mt-1">Borders, Dividers</p>
                                </div>
                                {/* Off-White / Light Grey */}
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-xl flex items-center justify-center text-xs font-semibold text-gray-800 text-center border border-gray-300 bg-[#D1D5DB]">#D1D5DB</div>
                                    <p className="mt-2 font-semibold text-lg">Off-White / Light Grey</p>
                                    <p className="text-gray-400 text-sm">(209, 213, 219)</p>
                                    <p className="text-gray-500 text-xs text-center mt-1">Main body text</p>
                                </div>
                            </div>
                        </div>

                        {/* 2.3. Accent Color (Suggestion) */}
                        <div>
                            <h3 className="text-2xl font-semibold text-white mb-4">2.3. Accent Color (Suggestion)</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {/* Vibrant Orange */}
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-xl flex items-center justify-center text-xs font-semibold text-white text-center border border-white/10 bg-[#F97316]">#F97316</div>
                                    <p className="mt-2 font-semibold text-lg">Vibrant Orange</p>
                                    <p className="text-gray-400 text-sm">(249, 115, 22)</p>
                                    <p className="text-gray-500 text-xs text-center mt-1">Urgent alerts, Emphasis</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="p-6 sm:p-8 bg-gray-950 text-center text-gray-500 text-sm rounded-b-3xl mt-8">
                    <p>&copy; 2025 HomeLift Africa. All rights reserved.</p>
                    <p className="mt-2">This guide provides a visual overview. Refer to the full brand guidelines for complete details.</p>
                </footer>
            </div>
        </div>
    );
}
