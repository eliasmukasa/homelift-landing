"use client";

import React from "react";

interface ApplyModalProps {
  formUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplyModal({ formUrl, isOpen, onClose }: ApplyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="relative w-full max-w-3xl h-[80vh] bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
        <button
          aria-label="Close form"
          className="absolute top-3 right-3 text-gray-300 hover:text-white text-2xl z-60"
          onClick={onClose}
        >
          ×
        </button>
        <iframe
          title="Airtable Form"
          src={formUrl}
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}