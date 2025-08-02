
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  description: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  height?: 'sm' | 'md' | 'lg' | 'xl';
  overlay?: 'light' | 'dark' | 'gradient';
  children?: ReactNode;
}

export function PageHero({
  title,
  subtitle,
  description,
  backgroundImage = "/women-s-panel-discussion.jpg",
  backgroundVideo,
  ctaText,
  ctaLink,
  secondaryCtaText,
  secondaryCtaLink,
  height = 'xl',
  overlay = 'dark',
  children
}: PageHeroProps) {
  const heightClasses = {
    sm: 'h-[400px] min-h-[400px]',
    md: 'h-[500px] min-h-[500px]',
    lg: 'h-[600px] min-h-[600px]',
    xl: 'h-screen min-h-[600px] md:min-h-[800px]'
  };

  const overlayClasses = {
    dark: 'bg-black/95',
  };

  return (
    <section className={`relative ${heightClasses[height]} flex items-center justify-center text-center text-white overflow-hidden`}>
      {/* Video Background */}
      {backgroundVideo && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover -z-20"
          poster={backgroundImage}
        >
          <source src={backgroundVideo} type="video/mp4" />
          <source src={backgroundVideo.replace('.mp4', '.webm')} type="video/webm" />
        </video>
      )}
      
      {/* Background Image */}
      {!backgroundVideo && backgroundImage && (
        <Image
          src={backgroundImage}
          alt="Background"
          fill
          className="absolute inset-0 object-cover -z-10"
          priority
        />
      )}
      
      {/* Overlay */}
      <div className={`absolute inset-0 ${overlayClasses[overlay]} -z-5`} />
      
      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              {subtitle && (
                <span className="block text-white/90 font-light text-3xl sm:text-4xl lg:text-5xl mb-4">
                  {subtitle}
                </span>
              )}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-300">
                {title}
              </span>
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl text-white/80 max-w-4xl mx-auto leading-relaxed font-light">
              {description}
            </p>
          </div>
          
          {children}

          {(ctaText || secondaryCtaText) && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              {ctaText && ctaLink && (
                <Button asChild size="lg">
                  <Link href={ctaLink}>
                    {ctaText}
                  </Link>
                </Button>
              )}
              {secondaryCtaText && secondaryCtaLink && (
                <Button asChild variant="outline" size="lg" className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                  <Link href={secondaryCtaLink}>
                    {secondaryCtaText}
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
