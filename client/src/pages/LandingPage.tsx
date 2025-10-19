import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  CheckCircle, 
  Users, 
  Smartphone,
  Clock,
  Mail,
  ArrowRight,
  Star,
  Shield,
  Zap
} from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    setLocation("/signup");
  };

  const handleSignIn = () => {
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Users className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-gray-900">Family Hub</span>
        </div>
        <Button 
          variant="ghost" 
          onClick={handleSignIn}
          className="text-gray-600 hover:text-gray-900"
        >
          Sign In
        </Button>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Social Proof Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
            <Star className="w-4 h-4 mr-2" />
            Join 1,000+ organized families
          </Badge>

          {/* Hero Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Finally, a family command center{" "}
            <span className="text-primary">that actually works</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Sync calendars, share lists, manage chores - all in one place. 
            Never miss school events or forget groceries again.
          </p>

          {/* Value Props */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex items-center gap-2 text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Google Calendar sync in 30 seconds</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Real-time grocery lists your family actually uses</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Never miss school events again</span>
            </div>
          </div>

          {/* Risk Reduction */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="text-gray-600">Free 14-day trial, no credit card required</span>
          </div>

          {/* Primary CTA */}
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg h-auto"
          >
            Start Your Family Hub
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Secondary CTA */}
          <p className="text-gray-500 mt-4">
            Already have an account?{" "}
            <button 
              onClick={handleSignIn}
              className="text-primary hover:underline font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything your family needs in one place
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Calendar Feature */}
            <Card className="text-center p-6 border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Unified Calendar</h3>
                <p className="text-gray-600 mb-4">
                  Connect your Google Calendar and see everyone's schedule at a glance. 
                  Color-coded by family member.
                </p>
                <div className="flex items-center justify-center gap-1 text-sm text-blue-600">
                  <Zap className="w-4 h-4" />
                  <span>Syncs in 30 seconds</span>
                </div>
              </CardContent>
            </Card>

            {/* Lists Feature */}
            <Card className="text-center p-6 border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart Lists</h3>
                <p className="text-gray-600 mb-4">
                  Real-time grocery and to-do lists that everyone can update. 
                  Assign items and check them off together.
                </p>
                <div className="flex items-center justify-center gap-1 text-sm text-green-600">
                  <Smartphone className="w-4 h-4" />
                  <span>Updates instantly</span>
                </div>
              </CardContent>
            </Card>

            {/* School Hub Feature */}
            <Card className="text-center p-6 border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">School Hub</h3>
                <p className="text-gray-600 mb-4">
                  Forward school emails to one place. Never miss permission slips, 
                  events, or important announcements.
                </p>
                <div className="flex items-center justify-center gap-1 text-sm text-orange-600">
                  <Clock className="w-4 h-4" />
                  <span>Always up to date</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Trusted by busy families everywhere
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">1,000+</div>
                <div className="text-gray-600">Organized families</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">50,000+</div>
                <div className="text-gray-600">Tasks completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">99%</div>
                <div className="text-gray-600">Family satisfaction</div>
              </div>
            </div>

            {/* Testimonial */}
            <Card className="border-0 shadow-lg max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg text-gray-700 mb-6">
                  "Family Hub transformed how our family stays organized. We used to miss 
                  school events and always forget items at the store. Now everything is 
                  synced and everyone stays informed."
                </blockquote>
                <div className="text-gray-600">
                  <div className="font-semibold">Sarah M.</div>
                  <div className="text-sm">Mom of 3, PTA Member</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to organize your family?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of families who have simplified their lives with Family Hub.
          </p>
          
          <div className="space-y-4">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg h-auto"
            >
              Start Your Family Hub
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-white">Family Hub</span>
                </div>
                <p className="text-sm text-gray-400">
                  The family command center that actually works.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-3">Product</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-3">Support</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-3">Company</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
              <p>&copy; 2025 Family Hub. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}