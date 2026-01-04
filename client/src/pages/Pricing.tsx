import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Loader2, Crown, Clock, ArrowLeft, Home } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const [startingTrial, setStartingTrial] = useState(false);

  const { data: pricing } = trpc.subscriptions.getPricing.useQuery();
  const { data: subscription, refetch: refetchSubscription } =
    trpc.subscriptions.getMySubscription.useQuery();
  const startTrial = trpc.subscriptions.startTrial.useMutation();

  const handleStartTrial = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to start your free trial");
      return;
    }

    setStartingTrial(true);
    try {
      const result = await startTrial.mutateAsync();
      toast.success(result.message);
      await refetchSubscription();
    } catch (error: any) {
      toast.error(error.message || "Failed to start trial");
    } finally {
      setStartingTrial(false);
    }
  };

  const getButtonText = (plan: string) => {
    if (!isAuthenticated) return "Sign In to Subscribe";
    if (plan === "trial") {
      if (subscription?.hasUsedTrial) return "Trial Used";
      if (subscription?.tier === "trial") return "Active Trial";
      return "Start Free Trial";
    }
    if (subscription?.tier === "pro") return "Current Plan";
    return "Upgrade Now";
  };

  const isButtonDisabled = (plan: string) => {
    if (plan === "trial") {
      return subscription?.hasUsedTrial || subscription?.tier === "trial" || startingTrial;
    }
    return subscription?.tier === "pro";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-purple-600/10 animate-pulse" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      
      {/* Navigation Header */}
      <div className="relative z-20 bg-slate-900/50 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-purple-300 hover:text-purple-200 hover:bg-purple-500/20">
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              FixMate AI
            </span>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto space-y-8 p-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-black bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
            Choose Your Plan
          </h1>
          <p className="text-purple-300 text-xl font-semibold">
            Start with a 5-day free trial. No credit card required.
          </p>
        </div>

        {/* Current Subscription Status */}
        {subscription && subscription.tier !== "free" && (
          <Card className="border border-purple-500/30 shadow-2xl shadow-purple-500/20 bg-slate-800/50 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-purple-300 flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Your Current Subscription
                  </CardTitle>
                  <CardDescription>
                    {subscription.tier === "trial" ? "Free Trial" : "Pro Plan"}
                  </CardDescription>
                </div>
                {subscription.tier === "trial" && subscription.trialEndsAt && (
                  <Badge variant="secondary" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Expires: {new Date(subscription.trialEndsAt).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pricing?.tiers.map((tier, index) => (
            <Card
              key={index}
              className={`border shadow-2xl transition-all duration-500 hover:scale-105 relative overflow-hidden ${
                tier.highlight
                  ? "border-purple-500 shadow-purple-500/40 bg-slate-800/70"
                  : "border-purple-500/30 shadow-purple-500/20 bg-slate-800/50"
              } backdrop-blur-xl`}
            >
              {tier.highlight && (
                <div className="absolute top-0 right-0 bg-gradient-to-br from-purple-600 to-purple-500 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                  POPULAR
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <CardHeader>
                  <CardTitle className="text-2xl text-purple-300">{tier.name}</CardTitle>
                  <CardDescription>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-black text-white">
                        ${tier.price}
                      </span>
                      <span className="text-slate-400">/{tier.period}</span>
                    </div>
                    {tier.savings && (
                      <Badge variant="secondary" className="mt-2 bg-green-600/20 text-green-400 border-green-500/30">
                        {tier.savings}
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {tier.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      tier.highlight
                        ? "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400"
                        : "bg-slate-700 hover:bg-slate-600"
                    } text-white font-bold py-6 text-lg`}
                    disabled={isButtonDisabled(tier.plan || "")}
                    onClick={() => {
                      if (tier.plan === "trial") {
                        handleStartTrial();
                      } else {
                        toast.info("Payment integration coming soon!");
                      }
                    }}
                  >
                    {startingTrial && tier.plan === "trial" ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Starting Trial...
                      </>
                    ) : (
                      <>
                        {tier.highlight && <Zap className="h-5 w-5 mr-2" />}
                        {getButtonText(tier.plan || "")}
                      </>
                    )}
                  </Button>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <Card className="border border-purple-500/30 shadow-2xl shadow-purple-500/20 bg-slate-800/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-purple-300">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-300">
            <div>
              <h3 className="font-bold text-white mb-2">What happens after the 5-day trial?</h3>
              <p>
                After your trial ends, you'll be downgraded to the Free plan. You can upgrade to Pro
                anytime to continue using optimization features.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">Can I cancel anytime?</h3>
              <p>
                Yes! You can cancel your subscription at any time. You'll continue to have access
                until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">What payment methods do you accept?</h3>
              <p>We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
