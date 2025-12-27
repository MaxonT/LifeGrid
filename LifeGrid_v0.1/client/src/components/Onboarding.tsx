import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useSaveSettings } from "@/hooks/use-life-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Calendar, User } from "lucide-react";

const onboardingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  lifeExpectancy: z.coerce.number().min(50).max(120).default(90),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

export function Onboarding() {
  const [step, setStep] = useState(1);
  const { mutateAsync: saveSettings } = useSaveSettings();
  
  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      dob: "",
      lifeExpectancy: 90,
    },
  });

  const onSubmit = async (data: OnboardingValues) => {
    if (step === 1) {
      if (await form.trigger(["name", "dob"])) {
        setStep(2);
      }
    } else {
      await saveSettings(data);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full z-10">
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold mb-3"
          >
            LifeGrid
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg"
          >
            Visualize your time. Live intentionally.
          </motion.p>
        </div>

        <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-8 px-6 pb-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-5"
                    >
                      <div className="space-y-2 mb-6">
                        <h2 className="text-2xl font-semibold">Let's get started</h2>
                        <p className="text-sm text-muted-foreground">We need a few details to generate your life grid.</p>
                      </div>

                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>What should we call you?</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Your Name" className="pl-9 h-12 bg-background/50" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dob"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input type="date" className="pl-9 h-12 bg-background/50" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-5"
                    >
                      <div className="space-y-2 mb-6">
                        <h2 className="text-2xl font-semibold">One last thing</h2>
                        <p className="text-sm text-muted-foreground">Set a target to visualize your timeline against.</p>
                      </div>

                      <FormField
                        control={form.control}
                        name="lifeExpectancy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Life Expectancy (Years)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="number" 
                                  min={50} 
                                  max={120} 
                                  className="h-12 text-lg font-mono bg-background/50" 
                                  {...field} 
                                />
                                <span className="absolute right-4 top-3 text-muted-foreground text-sm">years</span>
                              </div>
                            </FormControl>
                            <p className="text-xs text-muted-foreground mt-2">
                              This defines the total number of boxes in your grid. The default is 90 years.
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    {step === 1 ? (
                      <span className="flex items-center gap-2">Next <ArrowRight className="w-4 h-4" /></span>
                    ) : (
                      "Create My Grid"
                    )}
                  </Button>
                  
                  {step === 2 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full mt-2"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
