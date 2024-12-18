import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const handleCheck = () => {
    // TODO: Implement promo code check
    onPromoCodeCheck(0);
  };

  return (
    <div className="grid gap-2">
      <Label>Промокод</Label>
      <div className="flex gap-2">
        <Input
          placeholder="Введите промокод"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
        />
        <Button onClick={handleCheck}>Проверить</Button>
      </div>
    </div>
  );
}