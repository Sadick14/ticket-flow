"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
  height = 'lg',
  overlay = 'dark'
}: PageHeroProps) {
  const heightClasses = {
    sm: 'h-[400px] min-h-[400px]',
    md: 'h-[500px] min-h-[500px]',
    lg: 'h-[600px] min-h-[600px]',
    xl: 'h-screen min-h-[800px]'
  };

  const overlayClasses = {
    light: 'bg-gradient-to-br from-white/80 via-white/60 to-white/80',
    dark: 'bg-gradient-to-br from-black/80 via-black/60 to-black/80',
    gradient: 'bg-gradient-to-br from-black/80 via-purple-900/30 to-black/80'
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
      <Image
        src={backgroundImage}
        alt="Background"
        fill
        className="absolute inset-0 object-cover -z-10"
        priority
      />
      
      {/* Overlay */}
      <div className={`absolute inset-0 ${overlayClasses[overlay]} -z-5`} />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              {subtitle && (
                <span className="block text-white/90 font-light text-3xl sm:text-4xl lg:text-5xl mb-4">
                  {subtitle}
                </span>
              )}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                {title}
              </span>
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl text-white/80 max-w-4xl mx-auto leading-relaxed font-light">
              {description}
            </p>
          </div>
          
          {(ctaText || secondaryCtaText) && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              {ctaText && ctaLink && (
                <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-0 px-12 py-6 text-xl font-medium rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <Link href={ctaLink}>
                    {ctaText}
                  </Link>
                </Button>
              )}
              {secondaryCtaText && secondaryCtaLink && (
                <Button asChild variant="outline" size="lg" className="border-2 border-white/30 text-white hover:bg-white/10 px-12 py-6 text-xl font-medium rounded-2xl backdrop-blur-sm">
                  <Link href={secondaryCtaLink}>
                    {secondaryCtaText}
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
