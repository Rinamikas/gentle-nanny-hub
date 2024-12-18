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
  onPromoCodeCheck,
}: PromoCodeSectionProps) {
  const { toast } = useToast();

  const checkPromoCode = async () => {
    if (!promoCode) {
      toast({
        title: "Ошибка",
        description: "Введите промокод",
        variant: "destructive",
      });
      return;
    }

    console.log("Проверка промокода:", promoCode);
    
    try {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", promoCode)
        .eq("is_active", true)
        .gte("valid_until", new Date().toISOString())
        .lte("valid_from", new Date().toISOString());

      console.log("Результат проверки промокода:", { data, error });

      if (error) {
        console.error("Ошибка проверки промокода:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось проверить промокод",
          variant: "destructive",
        });
        return;
      }

      if (!data || data.length === 0) {
        console.log("Промокод не найден или недействителен");
        toast({
          title: "Ошибка",
          description: "Промокод недействителен",
          variant: "destructive",
        });
        return;
      }

      const validPromoCode = data[0];
      console.log("Промокод применен:", validPromoCode);
      
      toast({
        title: "Успешно",
        description: `Применена скидка ${validPromoCode.discount_percent}%`,
      });

      onPromoCodeCheck(validPromoCode.discount_percent);
    } catch (error) {
      console.error("Ошибка при проверке промокода:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось проверить промокод",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-2">
      <Label>Промокод</Label>
      <div className="flex gap-2">
        <Input
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          placeholder="Введите промокод"
        />
        <Button onClick={checkPromoCode}>
          Применить
        </Button>
      </div>
    </div>
  );
}