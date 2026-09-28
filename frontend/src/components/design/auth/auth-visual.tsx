"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

interface AuthVisualProps {
  title: string;
  subtitle: string;
  features: Array<{
    icon: string;
    label: string;
    color?: string;
  }>;
}

export function AuthVisual({ title, subtitle, features }: AuthVisualProps) {
  return (
    <div className="hidden lg:block w-1/2 relative bg-gradient-to-br from-primary/10 to-secondary/20">
      <div className="absolute inset-0 bg-gradient-to-br from-background/5 to-background/0 backdrop-blur-sm" />
      
      <Link 
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 z-10 hover:opacity-80 transition-opacity"
      >
        <Logo size="lg" showText={true} />
      </Link>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-28 h-28 mb-8 rounded-2xl bg-card/90 flex items-center justify-center shadow-2xl border border-primary/10"
        >
          <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-pink-600">GX</span>
        </motion.div>
        <motion.h2 
          className="text-4xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {title}
        </motion.h2>
        <motion.p 
          className="text-xl text-muted-foreground mb-10 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {subtitle}
        </motion.p>
        <motion.div 
          className="grid grid-cols-3 gap-6 w-full max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {features.map((item, i) => (
            <motion.div 
              key={i}
              className="flex flex-col items-center gap-2"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 + (i * 0.1) }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className={`aspect-square w-14 rounded-xl ${item.color || 'bg-background/20'} backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg border border-white/10`}>
                {item.icon}
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
    </div>
  );
} 