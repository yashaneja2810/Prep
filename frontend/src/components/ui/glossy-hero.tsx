"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlossyHeroProps {
  title: ReactNode;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
}

export function GlossyHero({ title, subtitle, children, className }: GlossyHeroProps) {
  return (
    <motion.div 
      className={`relative overflow-hidden rounded-xl mb-8 bg-gradient-to-br from-primary/20 via-background to-secondary/20 ${className || ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
    >
      <div 
        className="absolute inset-0" 
        style={{
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          maskImage: "linear-gradient(0deg, transparent, rgba(255,255,255,0.6), transparent)"
        }}
      />
      <motion.div 
        className="absolute inset-0"
        initial={{ backgroundPosition: "0% 0%", opacity: 0.2 }}
        animate={{ 
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{
          repeat: Infinity,
          duration: 10,
          ease: "linear"
        }}
        style={{
          backgroundImage: "radial-gradient(circle at center, rgba(var(--primary-rgb), 0.8) 0, transparent 60%)",
          backgroundSize: "200% 200%",
        }}
      />
      
      <div className="relative p-8 z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {title}
            </h1>
            {subtitle && <p className="text-muted-foreground mt-2 text-lg">{subtitle}</p>}
          </div>
          
          {children && (
            <div className="md:min-w-[300px]">
              {children}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
} 