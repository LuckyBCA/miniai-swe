"use client";

import { trpc } from "@/app/_trpc/providers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Sparkles, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UpgradePage() {
  const { data: pricing } = trpc.credits.getPricing.useQuery();
  const { data: creditStatus } = trpc.credits.getStatus.useQuery();

  const handleUpgrade = () => {
    // In a real implementation, this would integrate with Stripe
    window.alert("Stripe integration coming soon! This would redirect to Stripe Checkout.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <main className="relative z-10 min-h-screen flex flex-col items-center px-4 py-8 lg:px-24">
        {/* Header */}
        <header className="w-full max-w-6xl mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-purple-300 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Generator
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
              Upgrade to
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Premium</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Get unlimited access to AI-powered app generation with advanced features
            </p>
          </div>
        </header>

        {/* Current Status */}
        {creditStatus && (
          <Card className="w-full max-w-4xl mb-8 bg-white/5 backdrop-blur-lg border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Current Status</h3>
                  <p className="text-gray-300">
                    {creditStatus.isPremuim ? 'Premium Member' : 'Free Plan'} • {creditStatus.current}/{creditStatus.daily} Credits Remaining
                  </p>
                </div>
                <Badge variant={creditStatus.isPremuim ? "secondary" : "outline"} className={creditStatus.isPremuim ? "bg-purple-500/20 text-purple-300" : "text-gray-300"}>
                  {creditStatus.isPremuim ? <Star className="w-3 h-3 mr-1" /> : <Zap className="w-3 h-3 mr-1" />}
                  {creditStatus.isPremuim ? 'Premium' : 'Free'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Cards */}
        {pricing && (
          <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 mb-16">
            {/* Free Plan */}
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 relative">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-6 h-6 text-blue-400" />
                  {pricing.free.name}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Perfect for getting started
                </CardDescription>
                <div className="text-3xl font-bold text-white mt-4">
                  ${pricing.free.price}
                  <span className="text-lg font-normal text-gray-300">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-semibold text-purple-300">
                  {pricing.free.credits} Credits Daily
                </div>
                <ul className="space-y-3">
                  {pricing.free.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button disabled className="w-full mt-6" variant="outline">
                  Current Plan
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-lg border-purple-500/30 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="pt-8">
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="w-6 h-6 text-purple-400" />
                  {pricing.premium.name}
                </CardTitle>
                <CardDescription className="text-purple-200">
                  For serious builders and teams
                </CardDescription>
                <div className="text-3xl font-bold text-white mt-4">
                  ${pricing.premium.price}
                  <span className="text-lg font-normal text-purple-200">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-semibold text-purple-300">
                  {pricing.premium.credits} Credits Daily
                </div>
                <ul className="space-y-3">
                  {pricing.premium.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-purple-100">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={handleUpgrade}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* FAQ Section */}
        <div className="w-full max-w-4xl">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid gap-6">
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">How do credits work?</h3>
                <p className="text-gray-300">
                  Credits are consumed based on the action: App Generation (5 credits), Sandbox Preview (2 credits), Code Execution (1 credit). 
                  Credits reset daily at midnight UTC.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-300">
                  Yes! You can cancel your premium subscription at any time. You&apos;ll continue to have premium access until the end of your billing period.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">What happens to my generated apps?</h3>
                <p className="text-gray-300">
                  All your generated applications remain accessible regardless of your plan. Premium users get additional features like custom templates and priority support.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}