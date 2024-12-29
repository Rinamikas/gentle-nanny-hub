import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Beaker } from "lucide-react";

export const TestButton = () => {
  const handleTest = async () => {
    try {
      console.log("🚀 Начинаем тестирование...");
      
      const testData = {
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        phone: "+79001234567"
      };
      
      const { data, error } = await supabase.functions.invoke('create-user/test', {
        body: testData
      });
      
      if (error) {
        console.error("❌ Ошибка теста:", error);
        toast({
          variant: "destructive",
          title: "Ошибка теста",
          description: error.message
        });
        return;
      }
      
      console.log("✅ Результаты теста:", data);
      toast({
        title: "Тест выполнен",
        description: "Проверьте консоль и логи Edge Function"
      });
      
    } catch (error) {
      console.error("❌ Неожиданная ошибка:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Произошла неожиданная ошибка"
      });
    }
  };

  return (
    <Button 
      onClick={handleTest}
      variant="outline"
      className="gap-2"
    >
      <Beaker className="h-4 w-4" />
      Запустить тест create-user
    </Button>
  );
};