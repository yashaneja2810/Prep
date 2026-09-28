"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useLogin } from "@/hooks/useAuth";
import { 
  PAGE_TITLES, 
  PAGE_DESCRIPTIONS, 
  FORM_LABELS, 
  FORM_PLACEHOLDERS, 
  BUTTON_LABELS,
  ROUTES 
} from "@/helpers/string_const";
import { useRouter } from "next/navigation";
  
const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

export function LoginForm() {
  const { login, isLoading } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await login({
        email: values.email,
        password: values.password,
      });

      router.push(ROUTES.DASHBOARD);
      console.log("Login successful");
    } catch (error) {
      // Error is already handled by the useLogin hook
      console.error('Login failed:', error);
    }
  };

  return (
    <motion.div 
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="space-y-3 mb-6">
        <h1 className="text-3xl font-bold">{PAGE_TITLES.LOGIN}</h1>
        <p className="text-muted-foreground">{PAGE_DESCRIPTIONS.LOGIN}</p>
      </div>
      
      <Button type="button" variant="outline" className="w-full h-11 rounded-lg border-muted hover:bg-muted/50 transition-colors mb-5">
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {BUTTON_LABELS.GOOGLE}
      </Button>
      
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-xs text-muted-foreground">OR CONTINUE WITH</span>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">{FORM_LABELS.EMAIL}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                      </div>
                      <Input 
                        placeholder={FORM_PLACEHOLDERS.EMAIL} 
                        type="email" 
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium">{FORM_LABELS.PASSWORD}</FormLabel>
                    <Button type="button" variant="link" className="text-xs px-0 h-auto py-0">
                      {BUTTON_LABELS.FORGOT_PASSWORD}
                    </Button>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input 
                        placeholder={FORM_PLACEHOLDERS.PASSWORD} 
                        type={showPassword ? "text" : "password"}
                        {...field} 
                        className="pl-10 pr-10 h-11 bg-muted/30 border-muted focus:border-primary/50 transition-all"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="remember" className="rounded border-muted-foreground/30 h-4 w-4" />
              <label htmlFor="remember" className="text-sm text-muted-foreground">{BUTTON_LABELS.REMEMBER_ME}</label>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-11 rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin" />
                <span>{BUTTON_LABELS.LOGGING_IN}</span>
              </div>
            ) : (
              <span className="font-medium">{BUTTON_LABELS.LOGIN}</span>
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
} 