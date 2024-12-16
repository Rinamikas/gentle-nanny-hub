import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  code: z.string().min(6, "Код должен содержать 6 цифр"),
});

type FormValues = z.infer<typeof formSchema>;

interface VerificationFormProps {
  email: string;
  onVerificationSuccess: () => void;
}

const VerificationForm = ({ email, onVerificationSuccess }: VerificationFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      console.log("Verifying code for email:", email);

      const { error } = await supabase.functions.invoke('verify-email', {
        body: { 
          email,
          code: data.code
        }
      });

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Код подтвержден",
      });
      
      onVerificationSuccess();
    } catch (error) {
      console.error("Error verifying code:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Неверный код верификации",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      console.log("Resending verification code to:", email);

      const { error } = await supabase.functions.invoke('verify-email', {
        body: { email }
      });

      if (error) throw error;

      toast({
        title: "Код отправлен",
        description: "Проверьте вашу почту",
      });
    } catch (error) {
      console.error("Error resending code:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось отправить код",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">
          Код подтверждения отправлен на {email}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Код подтверждения</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="123456" 
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              Подтвердить
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResendCode}
              disabled={isLoading}
            >
              Отправить код повторно
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default VerificationForm;