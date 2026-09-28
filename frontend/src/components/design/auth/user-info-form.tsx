"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, UserRound } from "lucide-react";
import { useCompleteProfile } from "@/hooks/useAuth";
import { 
  PAGE_TITLES, 
  PAGE_DESCRIPTIONS, 
  FORM_LABELS, 
  FORM_PLACEHOLDERS, 
  BUTTON_LABELS 
} from "@/helpers/string_const";

// Define the simplified schema for the user info form
const userInfoSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  preferred_name: z.string().optional(),
  phone: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true; // Optional field
      return /^\+\d{10,15}$/.test(val);
    }, {
      message: "Phone number must be in format +1234567890"
    }),
});

type UserInfoFormValues = z.infer<typeof userInfoSchema>;

export function UserInfoForm() {
  const { completeProfile, isLoading } = useCompleteProfile();

  // Add global style to prevent horizontal scroll
  useEffect(() => {
    // Create style element to prevent horizontal scrolling
    const style = document.createElement('style');
    style.innerHTML = `
      html, body {
        overflow-x: hidden !important;
        max-width: 100vw !important;
        position: relative;
      }
      
      .blur-decoration {
        pointer-events: none;
        z-index: 0;
        max-width: 100%;
        overflow: hidden;
      }
      
      .container {
        width: 100% !important;
        max-width: 100% !important;
        padding-left: 1rem !important;
        padding-right: 1rem !important;
        box-sizing: border-box !important;
      }
      
      form, .form-container {
        max-width: 100% !important;
        width: 100% !important;
        overflow-x: hidden !important;
      }
      
      input, textarea, select, button {
        max-width: 100% !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const form = useForm<UserInfoFormValues>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      preferred_name: "",
      phone: "",
    },
  });

  const handleSubmit = async (values: UserInfoFormValues) => {
    try {
      await completeProfile({
        first_name: values.first_name,
        last_name: values.last_name,
        preferred_name: values.preferred_name,
        phone: values.phone,
        timezone: "UTC", // Default timezone
      });
    } catch (error) {
      // Error is already handled by the useCompleteProfile hook
      console.error('Profile completion failed:', error);
    }
  };

  return (
    <div className="max-w-2xl w-full overflow-hidden form-container px-2 sm:px-4">
      <div className="mb-6 md:mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">{PAGE_TITLES.COMPLETE_PROFILE}</h1>
        <p className="text-muted-foreground text-base md:text-lg">{PAGE_DESCRIPTIONS.COMPLETE_PROFILE}</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 w-full max-w-full form-container">
          <Card className="border-primary/10 shadow-lg overflow-hidden w-full max-w-full p-1 sm:p-2">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 blur-decoration" />
            <CardHeader className="pb-4 relative border-b px-6 sm:px-8 pt-6">
                          <CardTitle className="text-xl font-bold flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <UserRound className="h-4 w-4 text-primary" />
              </div>
              {PAGE_TITLES.COMPLETE_PROFILE}
            </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-8 px-6 sm:px-8 pb-8">
              {/* Personal Information Section */}
              <div className="space-y-5 px-1">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                    <UserRound className="h-3 w-3 text-primary" />
                  </div>
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-full">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="font-medium">{FORM_LABELS.FIRST_NAME} *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              <UserRound className="h-4 w-4" />
                            </div>
                            <Input 
                              placeholder={FORM_PLACEHOLDERS.FIRST_NAME} 
                              {...field} 
                              className="pl-10 h-11 bg-muted/30 border-muted focus:border-primary/50 transition-all w-full"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="font-medium">{FORM_LABELS.LAST_NAME} *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              <UserRound className="h-4 w-4" />
                            </div>
                            <Input 
                              placeholder={FORM_PLACEHOLDERS.LAST_NAME} 
                              {...field} 
                              className="pl-10 h-11 bg-muted/30 border-muted focus:border-primary/50 transition-all w-full"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="preferred_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">{FORM_LABELS.PREFERRED_NAME} (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <UserRound className="h-4 w-4" />
                          </div>
                          <Input 
                            placeholder={FORM_PLACEHOLDERS.PREFERRED_NAME} 
                            {...field} 
                            className="pl-10 h-11 bg-muted/30 border-muted focus:border-primary/50 transition-all"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">{FORM_LABELS.PHONE} (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                          </div>
                          <Input 
                            placeholder={FORM_PLACEHOLDERS.PHONE} 
                            {...field} 
                            className="pl-10 h-11 bg-muted/30 border-muted focus:border-primary/50 transition-all"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground mt-1">
                        Format: +1234567890 (include country code)
                      </p>
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Submit Button */}
              <div className="pt-4 border-t px-1 flex justify-center md:justify-end">
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto py-5 md:py-6 px-6 md:px-8 text-base md:text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full border-2 border-current border-r-transparent animate-spin" />
                      <span>{BUTTON_LABELS.SAVING_PROFILE}</span>
                    </div>
                  ) : (
                    <span>{BUTTON_LABELS.COMPLETE_REGISTRATION}</span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
} 