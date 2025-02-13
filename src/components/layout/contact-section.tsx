"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";

interface FormData {
  // Step 1
  services: {
    gevelisolatie: boolean;
    dakisolatie: boolean;
    vloerisolatie: boolean;
  };
  // Step 2
  street: string;
  number: string;
  postalCode: string;
  houseType: 'hoekwoning' | 'tussenwoning' | 'vrijstaande' | 'twee-onder-een-kap' | '';
  // Step 3
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  additionalInfo: string;
}

const initialFormData: FormData = {
  services: {
    gevelisolatie: false,
    dakisolatie: false,
    vloerisolatie: false,
  },
  street: "",
  number: "",
  postalCode: "",
  houseType: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  additionalInfo: "",
};

const steps = [
  {
    id: 'services',
    title: 'Wat voor soort(en) isolatie wilt u laten uitvoeren?'
  },
  {
    id: 'location',
    title: 'Waar moeten de werkzaamheden worden uitgevoerd?'
  },
  {
    id: 'personal',
    title: 'Vul alle informatie in en Ontvang een Prijsindicatie'
  }
];

const houseTypes = [
  { id: 'hoekwoning', label: 'Hoekwoning' },
  { id: 'tussenwoning', label: 'Tussenwoning' },
  { id: 'vrijstaande', label: 'Vrijstaande woning' },
  { id: 'twee-onder-een-kap', label: 'Twee-onder-één-kap woning' },
];

interface FormErrors {
  services?: string;
  street?: string;
  number?: string;
  postalCode?: string;
  houseType?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

interface ContactSectionProps {
  isPopup?: boolean;
  onSubmitSuccess?: () => void;
}

export function ContactSection({ isPopup, onSubmitSuccess }: ContactSectionProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Validate required fields
      if (currentStep === 2) {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
          toast.error("Vul alle verplichte velden in");
          return;
        }
      }

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Clear form
        setFormData(initialFormData);
        setCurrentStep(0);
        
        // Call onSubmitSuccess if provided (for popup mode)
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
        
        // Redirect to thank you page
        router.push('/thank-you');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      toast.error("Er is iets misgegaan. Probeer het later opnieuw.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateStep = () => {
    const newErrors: FormErrors = {};
    
    switch (currentStep) {
      case 0:
        if (!Object.values(formData.services).some(value => value)) {
          newErrors.services = "Selecteer minimaal één service";
        }
        break;
      case 1:
        if (!formData.street.trim()) newErrors.street = "Straat is verplicht";
        if (!formData.number.trim()) newErrors.number = "Huisnummer is verplicht";
        if (!formData.postalCode.trim()) newErrors.postalCode = "Postcode is verplicht";
        if (!formData.houseType) newErrors.houseType = "Woningtype is verplicht";
        break;
      case 2:
        if (!formData.firstName.trim()) newErrors.firstName = "Voornaam is verplicht";
        if (!formData.lastName.trim()) newErrors.lastName = "Achternaam is verplicht";
        if (!formData.email.trim()) {
          newErrors.email = "Email is verplicht";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = "Voer een geldig emailadres in";
        }
        if (!formData.phone.trim()) newErrors.phone = "Telefoonnummer is verplicht";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (currentStep === steps.length - 1) {
      handleSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setErrors({});
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            {Object.entries(formData.services).map(([service, isSelected]) => (
              <label key={service} className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-accent">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => setFormData({
                    ...formData,
                    services: {
                      ...formData.services,
                      [service]: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300"
                />
                <span className="text-foreground">{service} *</span>
              </label>

            ))}
            {errors.services && (
              <p className="text-red-500 text-sm mt-1">{errors.services}</p>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Straat *
              </label>
              <Input
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className={errors.street ? "border-red-500" : ""}
              />
              {errors.street && (
                <p className="text-red-500 text-sm mt-1">{errors.street}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Huisnummer *
              </label>
              <Input
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                className={errors.number ? "border-red-500" : ""}
              />
              {errors.number && (
                <p className="text-red-500 text-sm mt-1">{errors.number}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Postcode *
              </label>
              <Input
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className={errors.postalCode ? "border-red-500" : ""}
              />
              {errors.postalCode && (
                <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
              )}
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Welk type woning heeft u?</h3>
              <div className="space-y-3">
                {houseTypes.map((type) => (
                  <label key={type.id} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="houseType"
                      value={type.id}
                      checked={formData.houseType === type.id}
                      onChange={(e) => setFormData({ ...formData, houseType: e.target.value as FormData['houseType'] })}
                      className="w-5 h-5 border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-base">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>
            {errors.houseType && (
              <p className="text-red-500 text-sm mt-1">{errors.houseType}</p>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Voornaam *
              </label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Achternaam *
              </label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                E-mailadres *
              </label>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Telefoonnummer *
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
            <Textarea
              placeholder="Aanvullende informatie (optioneel)"
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              className="min-h-[100px]"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className={cn(
      "relative py-24",
      isPopup && "py-8 px-4"
    )}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
          {/* Left Side - Contact Info */}
          <div className="order-1 md:order-2 w-full max-w-xl mx-auto lg:mx-0">
            <div className="bg-background rounded-xl shadow-lg p-8 border border-border relative">
              {/* Subsidy Badge */}
              {/* <div className="absolute -right-4 top-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg transform rotate-12">
                <span className="text-sm font-medium">€ Subsidie mogelijk!</span>
              </div> */}

              {/* Main Title */}
              <h2 className="text-xl font-semibold text-center mb-6">
                Gratis offerte aanvragen voor de isolatie van uw woning
              </h2>

              {/* Step Indicators */}
              <div className="flex justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      ${index === currentStep ? 'bg-primary text-white' : 'bg-gray-200'}
                    `}>
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>

              {/* Step Title */}
              <h3 className="text-lg font-medium mb-6">{steps[currentStep].title}</h3>

              {/* Form Content */}
              <form onSubmit={(e) => e.preventDefault()}>
                {renderStepContent()}
                
                <div className="mt-6 space-y-4">
                  <div className="flex gap-3">
                    {currentStep > 0 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleBack}
                        disabled={isLoading}
                      >
                        Terug
                      </Button>
                    )}
                    <Button
                      className="w-full"
                      onClick={handleNext}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verzenden...
                        </div>
                      ) : currentStep === steps.length - 1 ? 'Aanvraag verzenden' : 'Volgende'}
                    </Button>
                  </div>

                  {/* Houses Count */}
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span>binnen 2 weken een startdatum</span>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-8 lg:sticky lg:top-24 order-2 md:order-1"
          >
            <div>
              <h2 className="text-4xl font-bold mb-6">Vraag direct een vrijblijvende offerte aan</h2>
            </div>


            {/* Why Contact Ons */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Waarom kiezen voor onze diensten?</h3>
              <ul className="space-y-3">
                {[
                  "Oplossing met complete afwerking",
                  " Startdatum binnen 2 weken",
                  "Actief in Midden-Nederland",
                  "Subsidie-begeleiding",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center gap-3 text-muted-foreground"
                  >
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <Link href="tel:+31850604466">
                    <h3 className="font-semibold mb-1">Telefoon</h3>
                    <p className="text-muted-foreground">+31850604466</p>
                  </Link>
                </div>

              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <path d="m22 6-10 7L2 6" />
                  </svg>
                </div>
                <div>
                  <Link href="mailto:info@renodomi.nl">
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-muted-foreground">info@renodomi.nl</p>
                  </Link>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 