import heroImage from '@assets/generated_images/Family_command_center_illustration_b7f5f5f7.png';

export default function DashboardHero() {
  return (
    <div className="relative h-48 overflow-hidden rounded-lg">
      <img 
        src={heroImage} 
        alt="Family Command Center" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
      <div className="absolute bottom-6 left-6 right-6">
        <h1 className="text-3xl font-bold text-white" data-testid="text-hero-title">
          Good Morning, Sarah! ☀️
        </h1>
        <p className="text-white/90 text-sm mt-1" data-testid="text-hero-subtitle">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
}
