/** @type {import('tailwindcss').Config} */
export default {
  content: [
  "./index.html",
  "./src/**/*.{js,jsx}",
  "./components/**/*.{js,jsx}",
  "./pages/**/*.{js,jsx}",
  "./styles/**/*.js"
],
  theme: {
    extend: {
      colors: {
        // Site-wide color system - change these values to update colors across the entire site
        // Primary brand colors
        'brand-primary': '#0f172a',      // Main buttons, active states, primary text
        'brand-primary-hover': '#1e293b', // Button hover states
        'brand-secondary': '#3b82f6',     // Secondary buttons, accents, links
        'brand-secondary-hover': '#2563eb', // Secondary hover states
        'brand-accent': '#6366f1',        // Special highlights and accents

        // Text colors
        'text-primary': '#0f172a',        // Headings, important text
        'text-secondary': '#374151',      // Body text, navigation
        'text-muted': '#6b7280',          // Muted text, descriptions
        'text-price': '#374151',          // Price displays (aligned with body text)

        // Background colors
        'bg-primary': '#ffffff',          // Main backgrounds (white)
        'bg-secondary': '#f8fafc',        // Secondary backgrounds
        'bg-muted': '#f1f5f9',            // Muted backgrounds, hovers

        // Border colors
        'border-primary': '#e2e8f0',      // Main borders
        'border-secondary': '#cbd5e1',    // Secondary borders

        // Status colors
        'success': '#10b981',             // Success states
        'warning': '#f59e0b',             // Warning states
        'error': '#ef4444',               // Error states, delete buttons
        'error-hover': '#dc2626',         // Error hover states
        
        'edit': '#3b82f6',                // Edit button
        'edit-hover': '#2563eb',          // Edit button hover
        'upload': '#374151',              // Upload button
        'upload-hover': '#1f2937',        // Upload button hover
      }
    },
  },
  plugins: [],
}
