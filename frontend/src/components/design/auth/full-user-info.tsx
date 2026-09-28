"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GraduationCap, Briefcase, Target, UserRound } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { toast } from "sonner";

import {
  learnerProfileSchema,
  LearnerProfileFormData,
} from "@/helpers/validation/learner-profile";
import {
  LEARNER_FORM_LABELS,
  BUTTON_LABELS,
  PAGE_TITLES,
  PAGE_DESCRIPTIONS,
  API_MESSAGES,
  LEARNER_TYPE,
} from "@/helpers/string_const";
import { updateOwnProfile } from "@/lib/api/learners";
import { handleError } from "@/helpers/helpers";

export default function FullUserInfoForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      
      [data-radix-popper-content-wrapper] {
        max-width: calc(100vw - 20px) !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const form = useForm<LearnerProfileFormData>({
    resolver: zodResolver(learnerProfileSchema),
    shouldUnregister: false,
    defaultValues: {
      learner_type: LEARNER_TYPE.STUDENT,
      goals_text: "",
      student_details: {
        college_name: "",
        degree_course: "",
        current_gpa: undefined,
        expected_grad_year: undefined,
        interest: "",
      },
      professional_details: {
        company_name: "",
        job_title: "",
        years_experience: undefined,
        pipeline_dev_exp: undefined,
        portfolio_url: "",
      },
    },
  });
  
  const learnerType = form.watch("learner_type");

  // Ensure only the relevant details block is present based on the selected learner type
  useEffect(() => {
    if (learnerType === LEARNER_TYPE.STUDENT) {
      // Remove professional details when switching to Student to avoid unnecessary validation errors
      form.setValue("professional_details", undefined as any, { shouldDirty: false, shouldValidate: false });
    } else if (learnerType === LEARNER_TYPE.PROFESSIONAL) {
      // Remove student details when switching to Professional to avoid unnecessary validation errors
      form.setValue("student_details", undefined as any, { shouldDirty: false, shouldValidate: false });
    }
  }, [learnerType, form]);

  const handleSubmit = async (values: LearnerProfileFormData) => {
    setIsSubmitting(true);

    try {
      // Build base payload
      const payload: any = {
        learner_type: values.learner_type,
        goals_text: values.goals_text?.trim() || undefined,
      };

      if (values.learner_type === LEARNER_TYPE.STUDENT) {
        payload.student_details = { ...values.student_details };
      }

      if (values.learner_type === LEARNER_TYPE.PROFESSIONAL) {
        const pd = { ...values.professional_details } as any;
        // Ensure numeric fields are numbers
        if (pd.years_experience !== undefined && pd.years_experience !== "") {
          pd.years_experience = Number(pd.years_experience);
        }
        if (pd.pipeline_dev_exp !== undefined && pd.pipeline_dev_exp !== "") {
          pd.pipeline_dev_exp = Number(pd.pipeline_dev_exp);
        }
        payload.professional_details = pd;
      }

      // Remove empty, null, undefined values recursively
      const cleanse = (obj: any) => {
        Object.entries(obj).forEach(([key, val]) => {
          if (val && typeof val === "object") {
            cleanse(val);
            if (Object.keys(val).length === 0) delete obj[key];
          } else if (val === undefined || val === "" || val === null) {
            delete obj[key];
          }
        });
      };
      cleanse(payload);

      await updateOwnProfile(payload);
      toast.success(API_MESSAGES.LEARNER_UPDATED_SUCCESS);
      router.push("/dashboard");
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden flex flex-col items-center">
      <header className="border-b border-border/40 p-4 w-full">
        <div className="container flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" showText={true} />
          </Link>
        </div>
      </header>
      
      <main className="container py-6 md:py-8 px-4 overflow-x-hidden flex justify-center">
        <div className="max-w-3xl w-full overflow-hidden form-container px-2 sm:px-4">
          <div className="mb-6 md:mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
              {PAGE_TITLES.COMPLETE_PROFILE}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              {PAGE_DESCRIPTIONS.COMPLETE_PROFILE}
            </p>
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
                  {/* Learner Type Selection */}
                  <div className="space-y-5 px-1">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center mr-2">
                        <Briefcase className="h-3 w-3 text-blue-500" />
                      </div>
                      {LEARNER_FORM_LABELS.LEARNER_TYPE}
                    </h3>
                    <FormField
                      control={form.control}
                      name="learner_type"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col sm:flex-row gap-4"
                            >
                              {/* Student Option */}
                              <Label
                                htmlFor="student"
                                className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all w-full ${field.value === LEARNER_TYPE.STUDENT ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30 hover:bg-muted/50"}`}
                              >
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                  <GraduationCap className="h-6 w-6 text-primary" />
                                </div>
                                <span className="font-medium">Student</span>
                                <RadioGroupItem value={LEARNER_TYPE.STUDENT} id="student" className="sr-only" />
                              </Label>

                              {/* Professional Option */}
                              <Label
                                htmlFor="professional"
                                className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all w-full ${field.value === LEARNER_TYPE.PROFESSIONAL ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30 hover:bg-muted/50"}`}
                              >
                                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                                  <Briefcase className="h-6 w-6 text-blue-500" />
                                </div>
                                <span className="font-medium">Working Professional</span>
                                <RadioGroupItem value={LEARNER_TYPE.PROFESSIONAL} id="professional" className="sr-only" />
                              </Label>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Career Goals */}
                  <div className="pt-2 border-t px-1">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center mr-2">
                        <Target className="h-3 w-3 text-green-500" />
                      </div>
                      {LEARNER_FORM_LABELS.GOALS_TEXT}
                    </h3>
                    <FormField
                      control={form.control}
                      name="goals_text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">{LEARNER_FORM_LABELS.GOALS_TEXT}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your career goals..."
                              className="min-h-[120px] bg-muted/30 border-muted focus:border-primary/50 transition-all resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Student Details */}
                  {learnerType === LEARNER_TYPE.STUDENT && (
                    <div className="pt-2 border-t px-1">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <div className="h-6 w-6 rounded-full bg-purple-500/10 flex items-center justify-center mr-2">
                          <GraduationCap className="h-3 w-3 text-purple-500" />
                        </div>
                        Student Details
                      </h3>
                      <div className="space-y-5">
                        {/* College Name */}
                        <FormField
                          control={form.control}
                          name="student_details.college_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">{LEARNER_FORM_LABELS.COLLEGE_NAME}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter college/university name"
                                  {...field}
                                  className="h-11 bg-muted/30 border-muted focus:border-primary/50 transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Degree Course */}
                        <FormField
                          control={form.control}
                          name="student_details.degree_course"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">{LEARNER_FORM_LABELS.DEGREE_COURSE}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Computer Science"
                                  {...field}
                                  className="h-11 bg-muted/30 border-muted focus:border-primary/50 transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-full">
                          {/* Current GPA */}
                          <FormField
                            control={form.control}
                            name="student_details.current_gpa"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel className="font-medium">{LEARNER_FORM_LABELS.CURRENT_GPA}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="4"
                                    placeholder="e.g., 3.5"
                                    {...field}
                                    value={field.value ?? ""}
                                    className="h-11 bg-muted/30 border-muted focus:border-primary/50 transition-all w-full"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Expected Graduation Year */}
                          <FormField
                            control={form.control}
                            name="student_details.expected_grad_year"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel className="font-medium">{LEARNER_FORM_LABELS.EXPECTED_GRAD_YEAR}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="2024"
                                    max="2034"
                                    placeholder="e.g., 2025"
                                    {...field}
                                    value={field.value ?? ""}
                                    className="h-11 bg-muted/30 border-muted focus:border-primary/50 transition-all w-full"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Interests */}
                        <FormField
                          control={form.control}
                          name="student_details.interest"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">{LEARNER_FORM_LABELS.INTEREST}</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Your areas of interest..."
                                  className="min-h-[100px] bg-muted/30 border-muted focus:border-primary/50 transition-all resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Professional Details */}
                  {learnerType === LEARNER_TYPE.PROFESSIONAL && (
                    <div className="pt-2 border-t px-1">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <div className="h-6 w-6 rounded-full bg-amber-500/10 flex items-center justify-center mr-2">
                          <Briefcase className="h-3 w-3 text-amber-500" />
                        </div>
                        Professional Details
                      </h3>
                      <div className="space-y-5">
                        {/* Company Name */}
                        <FormField
                          control={form.control}
                          name="professional_details.company_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">{LEARNER_FORM_LABELS.COMPANY_NAME}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter company name"
                                  {...field}
                                  className="h-11 bg-muted/30 border-muted focus:border-primary/50 transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Job Title */}
                        <FormField
                          control={form.control}
                          name="professional_details.job_title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">{LEARNER_FORM_LABELS.JOB_TITLE}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Senior Developer"
                                  {...field}
                                  className="h-11 bg-muted/30 border-muted focus:border-primary/50 transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-full">
                          {/* Years of Experience */}
                          <FormField
                            control={form.control}
                            name="professional_details.years_experience"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel className="font-medium">{LEARNER_FORM_LABELS.YEARS_EXPERIENCE}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="50"
                                    placeholder="e.g., 5"
                                    {...field}
                                    value={field.value ?? ""}
                                    className="h-11 bg-muted/30 border-muted focus:border-primary/50 transition-all w-full"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Pipeline Dev Experience */}
                          <FormField
                            control={form.control}
                            name="professional_details.pipeline_dev_exp"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel className="font-medium">{LEARNER_FORM_LABELS.PIPELINE_DEV_EXP}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="20"
                                    placeholder="e.g., 2"
                                    {...field}
                                    value={field.value ?? ""}
                                    className="h-11 bg-muted/30 border-muted focus:border-primary/50 transition-all w-full"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Portfolio URL */}
                        <FormField
                          control={form.control}
                          name="professional_details.portfolio_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium">{LEARNER_FORM_LABELS.PORTFOLIO_URL}</FormLabel>
                              <FormControl>
                                <Input
                                  type="url"
                                  placeholder="https://yourportfolio.com"
                                  {...field}
                                  className="h-11 bg-muted/30 border-muted focus:border-primary/50 transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Submit Button */}
                  <div className="pt-4 border-t px-1 flex justify-center md:justify-end">
                    <Button 
                      type="submit" 
                      className="w-full sm:w-auto py-5 md:py-6 px-6 md:px-8 text-base md:text-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
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
      </main>
    </div>
  );
} 