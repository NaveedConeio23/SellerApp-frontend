import React from 'react'

// Mock Link for non-Next.js environment
interface LinkProps {
  href: string
  children: React.ReactNode
  className: string
}

const Link: React.FC<LinkProps> = ({ href, children, className }) => (
  <a href={href} className={className} role="link">
    {children}
  </a>
)

const Home: React.FC = () => {
  // Full-screen background (from public/icons/)
  const screenBackground = '/icons/screen.png'
  // Card background (optional)
  const cardBackground = '/icons/card-bg.png'

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-10 font-sans antialiased"
      style={{
        backgroundImage: `url('${screenBackground}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Card container */}
      <div
        className="
          relative
          w-full 
          max-w-md 
          rounded-3xl 
          shadow-2xl 
          border border-gray-100
          overflow-hidden
        "
      >
        {/* --- Card Background --- */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('${cardBackground}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'grayscale(10%) brightness(0.8)',
          }}
        />

        {/* --- Translucent Overlay --- */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />

        {/* --- Foreground Content --- */}
        <div className="relative p-8 sm:p-10 flex flex-col items-center justify-center z-10">
          {/* Logo */}
          <div className="mb-2">
            <img
              src="/icons/icon-512x512.png"
              alt="Coneio Factory Logo"
              className="w-20 h-20 object-contain p-2 rounded-full"
            />
          </div>

          {/* Title */}
          <h1
            className="
              sm:text-3xl font-extrabold text-center mb-4 
              text-transparent bg-clip-text bg-gradient-to-r from-[#26696D] to-[#368A8D] 
            "
          >
            Seller Onboarding
          </h1>

          {/* Subtitle */}
          <p className="mb-10 text-xl text-gray-700 font-medium text-center max-w-sm">
            Register your factory and get verified to start selling globally.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
            <Link
              href="/signup"
              className="
                w-full 
                flex items-center justify-center
                px-6 py-3 rounded-xl 
                bg-gradient-to-r from-[#26696D] to-[#368A8D]  text-white font-semibold 
                transition duration-300 transform hover:scale-[1.02]
                focus:outline-none focus:ring-4 focus:ring-[#b7ecee]
              "
            >
              Sign Up
            </Link>

            <Link
              href="/login"
              className="
                w-full 
                flex items-center justify-center
                px-6 py-3 rounded-xl 
                border-2 border-gray-300 text-gray-700 font-semibold 
                bg-white 
                hover:bg-gray-100 
                transition duration-300 transform hover:shadow-lg
                focus:outline-none focus:ring-4 focus:ring-gray-300/50
              "
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
