import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PromoCodeSectionProps {
  promoCode: string;
  setPromoCode: (code: string) => void;
  onPromoCodeCheck: (discountPercent: number) => void;
}

export function PromoCodeSection({ 
  promoCode, 
  setPromoCode, 
  onPromoCodeCheck 
}: PromoCodeSectionProps) {
  const { toast } = useToast();

  const checkPromoCode = async () => {
    console.log("Проверка промокода:", promoCode);
    
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", promoCode)
      .eq("is_active", true)
      .gte("valid_until", new Date().toISOString())
      .lte("valid_from", new Date().toISOString())
      .single();

    if (error || !data) {
      console.error("Ошибка проверки промокода:", error);
      toast({
        title: "Ошибка",
        description: "Промокод недействителен",
        variant: "destructive",
      });
      return;
    }

    console.log("Промокод применен:", data);
    toast({
      title: "Успешно",
      description: `Применена скидка ${data.discount_percent}%`,
    });

    onPromoCodeCheck(data.discount_percent);
  };

  return (
    <div className="grid gap-2">
      <Label>Промокод</Label>
      <div className="flex gap-2">
        <Input
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
          placeholder="Введите промокод"
        />
        <Button onClick={checkPromoCode} type="button">
          Применить
        </Button>
      </div>
    </div>
  );
}