import React, { useState } from 'react';

export default function USERLOGANDREG() {
  const [isUserLogin, setIsUserLogin] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans select-none overflow-hidden">
      
      {/* LEFT SIDE: Authentication Form Panel */}
      <div className="w-full lg:w-[45%] flex flex-col justify-between p-8 sm:p-12 md:p-20 bg-zinc-950 border-r border-zinc-800/50 z-10">
        
        {/* Logo/Brand Area */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center font-black text-black text-xs tracking-wider">
            DEV
          </div>
          <span className="text-xl font-black tracking-wider uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            GAMING MATCHMAKING PLATFORM
          </span>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          <h2 className="text-3xl font-extrabold tracking-tight mb-2 uppercase">
            {isUserLogin ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="text-sm text-zinc-400 mb-8">
            {isUserLogin ? 'The queue is waiting. Ready up.' : 'Join thousands of players looking for a squad.'}
          </p>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 bg-zinc-900 p-1 rounded-lg mb-6 border border-zinc-800">
            <button 
              onClick={() => setIsUserLogin(true)}
              className={`py-2 text-sm font-semibold rounded-md transition-all ${isUserLogin ? 'bg-zinc-800 text-cyan-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsUserLogin(false)}
              className={`py-2 text-sm font-semibold rounded-md transition-all ${!isUserLogin ? 'bg-zinc-800 text-cyan-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-4 min-h-[240px]">
            {!isUserLogin && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Username</label>
                <input 
                  type="text" 
                  placeholder="Ninja_X"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 text-white placeholder-zinc-600 transition-colors"
                />
              </div>
            )}
            

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Email Address</label>
              <input 
                type="email" 
                placeholder="player@gmail.com"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 text-white placeholder-zinc-600 transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Password</label>
                {isUserLogin && <a href="#" className="text-xs text-cyan-500 hover:underline">Forgot?</a>}
              </div>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 text-white placeholder-zinc-600 transition-colors"
              />
            </div>
            </div>
            {/* Submit Button */}
            <button className="w-full mt-2 relative group overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold uppercase tracking-wider text-sm py-3.5 rounded-md hover:from-cyan-400 hover:to-blue-500 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] active:scale-[0.99]">
              {isUserLogin ? 'Launch Dashboard' : 'Create Profile'}
            </button>
            
          </form>
        </div>

        {/* Footer */}
        <div className="text-xs text-zinc-600">
          &copy; 2026 GAMING-MATCHMAKING-PLATFORM
        </div>
      </div>

      {/* RIGHT SIDE: Decorative Visual Panel */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center bg-zinc-900">
        {/* Gaming Grid Line Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>
        
        {/* Ambient Pulsing Glow Backgrounds */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

        {/* Marketing/Promo Callout */}
        <div className="relative text-center max-w-md p-6 z-10">
          <div className="inline-block border border-cyan-500/30 bg-cyan-950/20 text-cyan-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
            System Online
          </div>
          <h1 className="text-4xl font-black tracking-tight leading-none mb-4 uppercase">
            WILL ADD QUOTE <br/> HERE LATER
          </h1>
          <p className="text-zinc-400 text-sm">
            Filter players by rank, communication style, and toxic-free karma ratings. Welcome to fairer matchmaking.
          </p>
        </div>
      </div>

    </div>
  );
}