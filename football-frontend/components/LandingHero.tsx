import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const heroImages = [
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop", // Ball
  "https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=1000&auto=format&fit=crop", // Goal net
  "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=1000&auto=format&fit=crop"  // Player kicking
];

const phaseContent: Record<string, any> = {
  SETUP: {
    badge: "League Setup",
    badgeColor: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    title: <>Preparing For<br/>The Ultimate <br/><span className="text-blue-400">Draft</span></>,
    subtitle: "Franchises are forming and the league is preparing for the upcoming season.",
    btnText: "Manager Login",
    btnLink: "/draft"
  },
  REGISTRATION: {
    badge: "Registration Open",
    badgeColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    title: <>Draft The Best.<br/>Build Your Ultimate <br/><span className="text-emerald-400">Franchise</span></>,
    subtitle: "Player registration is now open! Submit your profile, showcase your stats, and get drafted.",
    btnText: "Join The League",
    btnLink: "/draft"
  },
  AUCTION: {
    badge: "Auction is LIVE",
    badgeColor: "text-red-400 bg-red-400/10 border-red-400/20",
    title: <>The Draft Is<br/>Now <span className="text-red-400">LIVE!</span></>,
    subtitle: "Franchises are battling it out on the podium. Watch the auction live as the rosters are finalized.",
    btnText: "View Live Podium",
    btnLink: "/live"
  },
  TOURNAMENT: {
    badge: "League Active",
    badgeColor: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    title: <>The Rosters<br/>Are <span className="text-purple-400">Set</span></>,
    subtitle: "The auction has concluded. Check out the final team rosters and tournament standings.",
    btnText: "View Tournament",
    btnLink: "/tournament"
  },
  DEFAULT: {
    badge: "GSTU LIGA",
    badgeColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    title: <>Draft The Best.<br/>Build Your Ultimate <br/><span className="text-emerald-400">Franchise</span></>,
    subtitle: "Experience the thrill of live player bidding. Scout top campus talent and draft a legendary roster.",
    btnText: "Join The League",
    btnLink: "/draft"
  }
};

export function LandingHero({ phase }: { phase: string }) {
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % heroImages.length);
    }, 5000); // 5 seconds per slide for better reading time
    return () => clearInterval(timer);
  }, []);

  const content = phaseContent[phase] || phaseContent.DEFAULT;

  return (
    <div className="relative w-full overflow-hidden bg-ink flex-1 flex flex-col">
      {/* Background Glow removed for solid color consistency */}
      
      {/* Watermark AUCTION */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full text-center overflow-hidden z-0 pointer-events-none opacity-20 dark:opacity-10">
        <h1 className="text-[20vw] font-display font-black text-chalk tracking-tighter leading-none whitespace-nowrap select-none">
          AUCTION
        </h1>
      </div>

      <div className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col pt-8 lg:pt-12">

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-between p-8 lg:p-16 gap-12">
        <div className="flex-1 max-w-2xl">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold uppercase tracking-wider mb-6 ${content.badgeColor}`}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 bg-current`}></span>
            </span>
            {content.badge}
          </motion.div>

          <motion.h1 
            key={`title-${phase}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-chalk leading-[1.1] mb-8"
          >
            {content.title}
          </motion.h1>
          <motion.p 
            key={`subtitle-${phase}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-chalkMuted text-lg md:text-xl mb-12 max-w-xl leading-relaxed"
          >
            {content.subtitle}
          </motion.p>
          <motion.div
            key={`btn-${phase}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link href={content.btnLink}>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="px-10 py-5 bg-chalk text-ink rounded-full font-bold transition-all text-lg shadow-xl hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center gap-3 relative overflow-hidden group"
              >
                <span className="relative z-10">{content.btnText}</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0 rounded-full" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
        
        {/* Hero Graphic / Frame Overlay */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 relative w-full h-[500px] lg:h-[600px] hidden md:block"
        >
          {/* Framed Graphic */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[90%] h-[90%] z-10">
            {/* Outline Box 1 */}
            <div className="absolute inset-4 border border-white/10 rounded-3xl z-10" />
            {/* Outline Box 2 (Offset) */}
            <div className="absolute inset-0 border border-white/5 rounded-3xl transform translate-x-8 translate-y-8 z-0" />
            
            {/* The Image (Dynamic slideshow slider) */}
            <div className="absolute inset-0 rounded-3xl z-20 overflow-hidden shadow-2xl bg-ink">
              {heroImages.map((src, index) => {
                let position = "100%"; // default right
                let duration = 0.8;
                
                if (index === currentImg) {
                  position = "0%"; // active
                } else if (index === (currentImg - 1 + heroImages.length) % heroImages.length) {
                  position = "-100%"; // previous
                } else {
                  position = "100%";
                  duration = 0; // instantly snap back to right
                }

                return (
                  <motion.img 
                    key={src}
                    src={src}
                    alt={`Football Action ${index + 1}`}
                    initial={false}
                    animate={{ x: position }}
                    transition={{ type: "tween", ease: "easeInOut", duration: duration }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                );
              })}
              
              {/* Gradient Overlay on Image to blend with background */}
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-ink/40 to-ink pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </motion.div>
      </div>
      
      </div>
    </div>
  );
}
