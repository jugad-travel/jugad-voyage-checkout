import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Check, 
  Star, 
  Shield, 
  Users, 
  Calendar, 
  MapPin, 
  Plane, 
  Download,
  Globe,
  Clock,
  ChevronDown,
  ChevronUp,
  Calculator,
  Sparkles,
  ArrowRight,
  Apple,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// TODO: Replace with actual data from API
const JUGAD_PRICING = {
  vatLabel: "TVA France 20 % incluse",
  defaultDurationDays: 7,
  socialProof: 12548,
  plans: [
    {
      id: "essential",
      name: "Essential",
      monthly: 6.99,
      yearly: 59,
      features: [
        "Itinéraires ≤ 10 jours",
        "100 crédits / mois (report 1 mois)",
        "Export complet (PDF/ICS/Maps)",
        "Collaboration 1 invité",
        "Suggestions hôtels/activités"
      ],
      badge: "Meilleur départ",
      description: "L'essentiel pour transformer votre teaser en itinéraire prêt à partir."
    },
    {
      id: "pro",
      name: "Pro",
      monthly: 11.99,
      yearly: 99,
      features: [
        "Itinéraires ≤ 30 jours + multi-destinations",
        "300 crédits / mois (report 2 mois)",
        "Multi-invités, versions & comparaisons",
        "Alertes horaires/transports, plans B météo",
        "Optimisations avancées"
      ],
      badge: "Le plus complet",
      description: "Pensé pour les voyages longs, les comparaisons et la collaboration avancée."
    }
  ],
  credits: [
    { id: "start20", name: "Start", credits: 20, price: 9.90, description: "Parfait pour débuter" },
    { id: "smart60", name: "Smart", credits: 60, price: 24.90, description: "Idéal pour un voyage d'une semaine, avec marge pour ajustements." },
    { id: "power150", name: "Power", credits: 150, price: 49.90, description: "Pour les explorateurs assidus" },
    { id: "pro400", name: "Pro", credits: 400, price: 99.00, description: "Le pack ultime pour tous vos voyages" }
  ],
  creditScale: [
    { action: "Générer 1 jour détaillé", cost: 4 },
    { action: "Re-planifier 1 jour", cost: 2 },
    { action: "Hôtels (5 options / nuit)", cost: 2 },
    { action: "Restaurants d'un jour", cost: 1 },
    { action: "Export premium (PDF + offline + ICS)", cost: 2 },
    { action: "Traduction intégrale d'un trip", cost: 2 }
  ]
};

// Analytics tracking function - TODO: Connect to real analytics
const trackEvent = (name: string, payload: any) => {
  console.log(`Analytics Event: ${name}`, payload);
};

// User state simulation - TODO: Connect to real auth
const MOCK_USER = {
  isLoggedIn: false,
  existingCredits: 0,
  currentPlan: null
};

interface JugadPricingProps {
  showRecommender?: boolean;
  experimentVariant?: string;
}

const JugadPricing: React.FC<JugadPricingProps> = ({ 
  showRecommender = true,
  experimentVariant = "floutage_J2plus"
}) => {
  const { toast } = useToast();
  const [pricingMode, setPricingMode] = useState<'subscription' | 'credits'>('subscription');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedCredits, setSelectedCredits] = useState<string | null>(null);
  const [tripDuration, setTripDuration] = useState(JUGAD_PRICING.defaultDurationDays);
  const [promoCode, setPromoCode] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Track page view
  useEffect(() => {
    trackEvent('pricing_view', { variant: experimentVariant });
  }, [experimentVariant]);

  // Auto-select recommended plan based on duration
  useEffect(() => {
    if (showRecommender && tripDuration) {
      const creditsNeeded = tripDuration * 4;
      const recommendedPack = JUGAD_PRICING.credits.find(pack => pack.credits >= creditsNeeded);
      
      if (pricingMode === 'credits' && recommendedPack) {
        setSelectedCredits(recommendedPack.id);
      } else if (pricingMode === 'subscription') {
        const recommendedPlan = tripDuration > 10 ? 'pro' : 'essential';
        setSelectedPlan(recommendedPlan);
      }
    }
  }, [tripDuration, pricingMode, showRecommender]);

  const handlePricingModeChange = (mode: 'subscription' | 'credits') => {
    setPricingMode(mode);
    trackEvent('pricing_mode_toggle', { mode });
  };

  const handleBillingCycleChange = (cycle: 'monthly' | 'yearly') => {
    setBillingCycle(cycle);
    trackEvent('billing_cycle_toggle', { cycle });
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setSelectedCredits(null);
    trackEvent('plan_select', { planId, billingCycle });
  };

  const handleCreditsSelect = (packId: string) => {
    setSelectedCredits(packId);
    setSelectedPlan(null);
    trackEvent('pack_select', { packId });
  };

  const handleSubscribe = async (planId: string) => {
    if (!MOCK_USER.isLoggedIn) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour continuer votre achat.",
        variant: "destructive"
      });
      return;
    }

    setIsCheckingOut(true);
    trackEvent('checkout_pay_click', { type: 'subscription', planId, billingCycle });

    // TODO: Integrate with Stripe API
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast({
        title: "Abonnement activé !",
        description: `Votre abonnement ${planId} est maintenant actif.`,
        variant: "default"
      });
      
      trackEvent('checkout_success', { type: 'subscription', planId, billingCycle });
    } catch (error) {
      toast({
        title: "Erreur de paiement",
        description: "Une erreur est survenue lors du traitement de votre paiement.",
        variant: "destructive"
      });
      
      trackEvent('checkout_error', { type: 'subscription', error: error });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleBuyCredits = async (packId: string) => {
    if (!MOCK_USER.isLoggedIn) {
      toast({
        title: "Connexion requise", 
        description: "Veuillez vous connecter pour continuer votre achat.",
        variant: "destructive"
      });
      return;
    }

    setIsCheckingOut(true);
    trackEvent('checkout_pay_click', { type: 'credits', packId });

    // TODO: Integrate with payment API
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      const pack = JUGAD_PRICING.credits.find(p => p.id === packId);
      toast({
        title: "Crédits ajoutés !",
        description: `${pack?.credits} crédits ont été ajoutés à votre compte.`,
        variant: "default"
      });
      
      trackEvent('checkout_success', { type: 'credits', packId });
    } catch (error) {
      toast({
        title: "Erreur de paiement",
        description: "Une erreur est survenue lors du traitement de votre paiement.",
        variant: "destructive"
      });
      
      trackEvent('checkout_error', { type: 'credits', error: error });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const getSelectedOffer = () => {
    if (selectedPlan) {
      const plan = JUGAD_PRICING.plans.find(p => p.id === selectedPlan);
      if (plan) {
        const price = billingCycle === 'yearly' ? plan.yearly : plan.monthly;
        const period = billingCycle === 'yearly' ? '/an' : '/mois';
        return {
          type: 'subscription',
          name: plan.name,
          price,
          period,
          id: selectedPlan
        };
      }
    }
    
    if (selectedCredits) {
      const pack = JUGAD_PRICING.credits.find(p => p.id === selectedCredits);
      if (pack) {
        return {
          type: 'credits',
          name: `Pack ${pack.name}`,
          price: pack.price,
          period: '',
          credits: pack.credits,
          id: selectedCredits
        };
      }
    }
    
    return null;
  };

  // Header Component
  const Header = () => (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-primary">JUGAD</h1>
            <nav className="text-sm text-muted-foreground hidden sm:block">
              Mon itinéraire → Débloquer
            </nav>
          </div>
        </div>
        
        {/* Trust banner */}
        <div className="mt-4 flex items-center justify-center text-sm text-muted-foreground space-x-6">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-success" />
            <span>Paiement sécurisé</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-success" />
            <span>Annulation 7 jours</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-success" />
            <span>TVA incluse</span>
          </div>
        </div>
      </div>
    </header>
  );

  // Hero Section Component  
  const HeroSection = () => (
    <section className="gradient-hero py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Débloquez tout votre itinéraire
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Voyez chaque jour en détail, réservez en un clic, exportez et collaborez.
        </p>
        
        {/* Pricing Mode Toggle */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-muted rounded-lg p-1 inline-flex">
            <button 
              className={`toggle-button px-6 py-2 rounded-md text-sm font-medium ${
                pricingMode === 'subscription' ? 'toggle-button-active' : ''
              }`}
              onClick={() => handlePricingModeChange('subscription')}
              data-analytics="pricing_mode_toggle"
            >
              Abonnement
            </button>
            <button 
              className={`toggle-button px-6 py-2 rounded-md text-sm font-medium ${
                pricingMode === 'credits' ? 'toggle-button-active' : ''
              }`}
              onClick={() => handlePricingModeChange('credits')}
              data-analytics="pricing_mode_toggle"
            >
              Crédits
            </button>
          </div>
        </div>

        {/* Billing Cycle Toggle (only for subscriptions) */}
        {pricingMode === 'subscription' && (
          <div className="flex items-center justify-center mb-8">
            <div className="bg-muted rounded-lg p-1 inline-flex">
              <button 
                className={`toggle-button px-4 py-2 rounded-md text-sm font-medium ${
                  billingCycle === 'monthly' ? 'toggle-button-active' : ''
                }`}
                onClick={() => handleBillingCycleChange('monthly')}
                data-analytics="billing_toggle"
              >
                Mensuel
              </button>
              <button 
                className={`toggle-button px-4 py-2 rounded-md text-sm font-medium ${
                  billingCycle === 'yearly' ? 'toggle-button-active' : ''
                }`}
                onClick={() => handleBillingCycleChange('yearly')}
                data-analytics="billing_toggle"
              >
                <span className="flex items-center space-x-1">
                  <span>Annuel</span>
                  <Badge variant="success" className="ml-1">-20%</Badge>
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Social Proof */}
        <p className="text-sm text-muted-foreground">
          <strong>{JUGAD_PRICING.socialProof.toLocaleString()}</strong> voyageurs ont déjà débloqué leur roadbook
        </p>
      </div>
    </section>
  );

  // Plan Card Component
  const PlanCard = ({ plan, isSelected, onSelect }: any) => {
    const price = billingCycle === 'yearly' ? plan.yearly : plan.monthly;
    const period = billingCycle === 'yearly' ? '/an' : '/mois';
    const yearlyDiscount = billingCycle === 'yearly' ? ((plan.monthly * 12 - plan.yearly) / (plan.monthly * 12) * 100).toFixed(0) : 0;

    return (
      <Card 
        className={`pricing-card relative ${isSelected ? 'pricing-card-featured' : ''} cursor-pointer`}
        onClick={() => onSelect(plan.id)}
        data-analytics="plan_select"
      >
        {plan.badge && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge variant="feature" className="px-3 py-1">
              {plan.badge}
            </Badge>
          </div>
        )}
        
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{plan.name}</CardTitle>
          <CardDescription className="text-base">{plan.description}</CardDescription>
          
          <div className="mt-4">
            <div className="flex items-baseline justify-center">
              <span className="text-4xl font-bold">{price.toFixed(2).replace('.', ',')} €</span>
              <span className="text-muted-foreground ml-1">{period}</span>
            </div>
            {billingCycle === 'yearly' && (
              <p className="text-sm text-success mt-1">
                Économisez {yearlyDiscount}% vs mensuel
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <ul className="space-y-3">
            {plan.features.map((feature: string, index: number) => (
              <li key={index} className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter>
          <Button 
            variant={isSelected ? "default" : "outline-primary"}
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              handleSubscribe(plan.id);
            }}
          >
            Choisir {plan.name}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Credits Pack Card Component
  const CreditPackCard = ({ pack, isSelected, onSelect }: any) => {
    const daysEstimated = Math.floor(pack.credits / 4);

    return (
      <Card 
        className={`pricing-card relative ${isSelected ? 'pricing-card-featured' : ''} cursor-pointer`}
        onClick={() => onSelect(pack.id)}
        data-analytics="pack_select"
      >
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{pack.name}</CardTitle>
          <CardDescription>{pack.description}</CardDescription>
          
          <div className="mt-4">
            <div className="flex items-baseline justify-center">
              <span className="text-3xl font-bold">{pack.price.toFixed(2).replace('.', ',')} €</span>
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="bg-accent/50">
                {pack.credits} crédits
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              ≈ {daysEstimated} jours couverts
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-semibold text-primary mb-2">
              {pack.credits}
            </div>
            <div className="text-sm text-muted-foreground">
              crédits inclus
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button 
            variant={isSelected ? "default" : "outline-primary"}
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              handleBuyCredits(pack.id);
            }}
          >
            Acheter ce pack
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Credit Scale Component
  const CreditScale = () => (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Comprendre les crédits
          </h2>
          
          <Card className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4 flex items-center">
                  <Calculator className="h-5 w-5 mr-2 text-primary" />
                  Barème des actions
                </h3>
                <div className="space-y-3">
                  {JUGAD_PRICING.creditScale.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{item.action}</span>
                      <Badge variant="outline">{item.cost} crédits</Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-primary" />
                  Estimation visuelle
                </h3>
                <div className="credit-scale-line">
                  {[20, 60, 150, 400].map((credits, index) => (
                    <div 
                      key={credits}
                      className="credit-scale-marker bg-primary"
                      style={{ left: `${(credits / 400) * 100}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>5j</span>
                  <span>15j</span>
                  <span>37j</span>
                  <span>100j+</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Button variant="ghost" className="text-primary">
                En savoir plus sur l'utilisation des crédits
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );

  // Recommender Component
  const Recommender = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    if (!showRecommender) return null;

    const creditsNeeded = tripDuration * 4;
    const recommendedPack = JUGAD_PRICING.credits.find(pack => pack.credits >= creditsNeeded);
    const recommendedPlan = tripDuration > 10 ? JUGAD_PRICING.plans[1] : JUGAD_PRICING.plans[0];

    const applyRecommendation = () => {
      if (pricingMode === 'credits' && recommendedPack) {
        handleCreditsSelect(recommendedPack.id);
      } else if (pricingMode === 'subscription') {
        handlePlanSelect(recommendedPlan.id);
      }
      
      trackEvent('reco_apply', { 
        tripDuration, 
        mode: pricingMode, 
        recommendation: pricingMode === 'credits' ? recommendedPack?.id : recommendedPlan.id 
      });
      
      // Scroll to checkout
      document.getElementById('checkout-sticky')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-primary" />
                  Recommandation personnalisée
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className={isOpen ? 'block' : 'hidden'}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Durée de votre itinéraire
                  </label>
                  <select 
                    value={tripDuration}
                    onChange={(e) => setTripDuration(Number(e.target.value))}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    {Array.from({ length: 29 }, (_, i) => i + 2).map(days => (
                      <option key={days} value={days}>{days} jours</option>
                    ))}
                  </select>
                </div>

                <div className="p-4 bg-accent/50 rounded-lg">
                  {pricingMode === 'credits' ? (
                    <div>
                      <p className="text-sm mb-2">
                        <strong>Pour {tripDuration} jours :</strong> {creditsNeeded} crédits recommandés
                      </p>
                      {recommendedPack && (
                        <p className="text-sm text-primary font-medium">
                          → Pack conseillé : <strong>{recommendedPack.name}</strong> ({recommendedPack.credits} crédits)
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm mb-2">
                        <strong>Pour {tripDuration} jours :</strong>
                      </p>
                      <p className="text-sm text-primary font-medium">
                        → Abonnement conseillé : <strong>{recommendedPlan.name}</strong>
                        {tripDuration > 10 && " (voyage long + fonctionnalités avancées)"}
                      </p>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={applyRecommendation}
                  className="w-full"
                  variant="pricing"
                  data-analytics="reco_apply"
                >
                  Appliquer la recommandation
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  };

  // FAQ Component
  const FAQ = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const faqs = [
      {
        question: "Abonnement ou crédits : que choisir ?",
        answer: "L'abonnement convient si vous voyagez régulièrement (2+ fois/an) ou planifiez des voyages longs. Les crédits sont parfaits pour un usage ponctuel ou si vous préférez payer à l'utilisation."
      },
      {
        question: "Les crédits expirent-ils ?",
        answer: "Non, vos crédits achetés sont valables 12 mois. Pour les abonnements, les crédits non utilisés se reportent sur 1-2 mois selon votre formule."
      },
      {
        question: "Puis-je cumuler abonnement + crédits ?",
        answer: "Oui, absolument ! Votre abonnement vous donne des crédits mensuels, et vous pouvez acheter des packs supplémentaires si besoin."
      },
      {
        question: "Puis-je annuler ?",
        answer: "Oui, vous pouvez annuler à tout moment. L'annulation prend effet à la fin de votre période de facturation en cours. Garantie remboursé 7 jours."
      },
      {
        question: "La TVA est-elle incluse ?",
        answer: "Oui, tous nos prix affichés incluent la TVA française (20%). Aucun frais caché."
      },
      {
        question: "Comment seront utilisés mes crédits ?",
        answer: "Les crédits se déduisent automatiquement lors de chaque action (génération, export, etc.). Vous voyez votre solde en temps réel dans votre compte."
      }
    ];

    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Questions fréquentes</h2>
          
          <div className="max-w-2xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{faq.question}</CardTitle>
                    {openFaq === index ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </CardHeader>
                
                {openFaq === index && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Guarantee & Trust Section
  const GuaranteeSection = () => (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card className="p-6">
              <Shield className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Satisfait ou remboursé</h3>
              <p className="text-sm text-muted-foreground">
                7 jours pour changer d'avis, remboursement intégral
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="flex justify-center space-x-2 mb-4">
                <Apple className="h-6 w-6 text-muted-foreground" />
                <Smartphone className="h-6 w-6 text-muted-foreground" />
                <CreditCard className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Paiements sécurisés</h3>
              <p className="text-sm text-muted-foreground">
                Apple Pay, Google Pay, cartes bancaires
              </p>
            </Card>
            
            <Card className="p-6">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Réservations partenaires</h3>
              <p className="text-sm text-muted-foreground">
                Hôtels et activités via nos partenaires de confiance
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );

  // Sticky Checkout Component
  const CheckoutSticky = () => {
    const selectedOffer = getSelectedOffer();
    
    if (!selectedOffer) return null;

    return (
      <div 
        id="checkout-sticky"
        className="sticky bottom-0 md:fixed md:top-1/2 md:right-6 md:transform md:-translate-y-1/2 md:w-80 bg-background border rounded-lg shadow-lg z-50 sticky-enter"
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Récapitulatif</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <span className="font-medium">{selectedOffer.name}</span>
                <span className="font-bold">
                  {selectedOffer.price.toFixed(2).replace('.', ',')} €{selectedOffer.period}
                </span>
              </div>
              
              {selectedOffer.type === 'credits' && (
                <p className="text-sm text-muted-foreground">
                  {selectedOffer.credits} crédits inclus
                </p>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-sm">
                <span>Sous-total</span>
                <span>{selectedOffer.price.toFixed(2).replace('.', ',')} €</span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>TVA (20%)</span>
                <span>Incluse</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center font-bold">
                <span>Total TTC</span>
                <span>{selectedOffer.price.toFixed(2).replace('.', ',')} €</span>
              </div>
            </div>

            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="Code promo"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              />
              <Button variant="outline" size="sm" className="w-full">
                Appliquer
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button 
              variant="pricing"
              className="w-full h-12 text-base"
              disabled={isCheckingOut}
              onClick={() => {
                if (selectedOffer.type === 'subscription') {
                  handleSubscribe(selectedOffer.id);
                } else {
                  handleBuyCredits(selectedOffer.id);
                }
              }}
              data-analytics="checkout_pay_click"
            >
              {isCheckingOut ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Traitement...</span>
                </div>
              ) : (
                'Payer maintenant'
              )}
            </Button>
            
            <div className="text-center text-xs text-muted-foreground space-y-1">
              <p>TVA incluse. Paiement 100% sécurisé.</p>
              <p>Remboursé sous 7 jours si vous changez d'avis.</p>
              
              <div className="flex justify-center space-x-4 mt-2">
                <button className="text-primary hover:underline">CGU</button>
                <button className="text-primary hover:underline">Confidentialité</button>
                <button className="text-primary hover:underline">Conditions de vente</button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  };

  // Integration Note Component
  const IntegrationNote = () => (
    <div className="bg-warning/10 border border-warning/20 rounded-lg p-6 my-8">
      <h3 className="font-semibold text-warning-foreground mb-4 flex items-center">
        <Sparkles className="h-5 w-5 mr-2" />
        Intégration Paiement - Notes pour les développeurs
      </h3>
      <div className="text-sm space-y-2 text-warning-foreground/80">
        <p><strong>Stripe :</strong> Ajouter la clé secrète côté serveur dans STRIPE_SECRET_KEY</p>
        <p><strong>Apple Pay/Google Pay :</strong> Configurer dans le dashboard Stripe</p>
        <p><strong>Endpoint :</strong> POST /api/checkout avec {`{planId, packId, billingCycle, amount}`}</p>
        <p><strong>Webhooks :</strong> Gérer payment.succeeded et invoice.payment_succeeded</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background" data-experiment={experimentVariant}>
      <Header />
      <HeroSection />
      
      {/* Main pricing grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {pricingMode === 'subscription' ? (
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {JUGAD_PRICING.plans.map(plan => (
                <PlanCard 
                  key={plan.id}
                  plan={plan}
                  isSelected={selectedPlan === plan.id}
                  onSelect={handlePlanSelect}
                />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {JUGAD_PRICING.credits.map(pack => (
                <CreditPackCard 
                  key={pack.id}
                  pack={pack}
                  isSelected={selectedCredits === pack.id}
                  onSelect={handleCreditsSelect}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {pricingMode === 'credits' && <CreditScale />}
      <Recommender />
      <FAQ />
      <GuaranteeSection />
      <IntegrationNote />
      
      <CheckoutSticky />
    </div>
  );
};

export default JugadPricing;