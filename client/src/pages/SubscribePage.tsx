import { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function SubscribeForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsSubmitting(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/settings?subscribed=true`,
      },
    });

    if (error) {
      toast({
        title: 'Payment Failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsSubmitting(false);
    } else {
      toast({
        title: 'Payment Successful',
        description: 'You are now subscribed to Premium!',
      });
      setLocation('/settings');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isSubmitting} 
        className="w-full"
        data-testid="button-subscribe"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Subscribe to Premium'
        )}
      </Button>
    </form>
  );
}

function CheckoutWrapper() {
  const [clientSecret, setClientSecret] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    apiRequest('POST', '/api/subscription/create')
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          toast({
            title: 'Already Subscribed',
            description: 'Your family already has an active subscription.',
          });
        }
      })
      .catch((error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      });
  }, [toast]);

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <SubscribeForm />
    </Elements>
  );
}

type SubscriptionStatus = {
  hasSubscription: boolean;
  status: string;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
};

export default function SubscribePage() {
  const { data: subscriptionStatus } = useQuery<SubscriptionStatus>({
    queryKey: ['/api/subscription/status'],
  });

  const features = [
    'Unlimited calendar syncing',
    'Advanced chore scheduling',
    'Priority school message alerts',
    'Premium family insights',
    'Extended storage',
    '24/7 priority support',
  ];

  if (subscriptionStatus?.status === 'active' || subscriptionStatus?.status === 'trialing') {
    return (
      <div className="max-w-4xl mx-auto space-y-6" data-testid="page-subscribe">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Premium Subscription</h1>
          <p className="text-muted-foreground">You're already subscribed to Premium!</p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Premium Active
              </CardTitle>
              <Badge variant="default">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your subscription renews on{' '}
              {new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8" data-testid="page-subscribe">
      <div className="text-center space-y-2">
        <Badge variant="default" className="mb-4">
          <Crown className="h-3 w-3 mr-1" />
          Premium
        </Badge>
        <h1 className="text-4xl font-bold">Upgrade to Premium</h1>
        <p className="text-lg text-muted-foreground">
          Unlock advanced features for your family command center
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Premium Features</CardTitle>
            <CardDescription>Everything you need to manage your family</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">$9.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Cancel anytime. No hidden fees.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Enter your payment information to subscribe</CardDescription>
          </CardHeader>
          <CardContent>
            <CheckoutWrapper />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
