import heroImage from '@assets/generated_images/Family_command_center_illustration_b7f5f5f7.png';
import { useState, useEffect } from 'react';

export default function DashboardHero() {
  const [greeting, setGreeting] = useState('Good Morning');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 17) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="relative h-56 overflow-hidden rounded-xl shadow-lg">
      <img 
        src={heroImage} 
        alt="Family Command Center" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h1 className="text-4xl font-bold text-white mb-1" data-testid="text-hero-title">
          {greeting}, Family!
        </h1>
        <p className="text-white/90 text-base font-medium" data-testid="text-hero-subtitle">
          {currentDate}
        </p>
      </div>
    </div>
  );
}
