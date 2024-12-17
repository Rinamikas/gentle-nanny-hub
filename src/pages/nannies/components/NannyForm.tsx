import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type TrainingStage = "stage1" | "stage2" | "stage3"; // Define your training stages

const NannyForm = ({ nannyId }: { nannyId?: string }) => {
  const [trainingStage, setTrainingStage] = useState<TrainingStage | null>(null);

  useEffect(() => {
    const fetchNannyData = async () => {
      if (nannyId) {
        const { data, error } = await supabase
          .from('nanny_training')
          .select('*')
          .eq('nanny_id', nannyId)
          .single();

        if (error) {
          console.error("Ошибка при загрузке данных няни:", error);
          return;
        }

        if (data) {
          setTrainingStage(data.stage);
        }
      }
    };

    fetchNannyData();
  }, [nannyId]);

  const handleTrainingStageChange = async (stage: TrainingStage) => {
    try {
      console.log("Сохраняем этап обучения:", stage);
      
      const { error } = await supabase
        .from('nanny_training')
        .upsert({
          nanny_id: nannyId,
          stage: stage,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'nanny_id,stage'
        });

      if (error) {
        console.error("Ошибка при сохранении этапа обучения:", error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось сохранить этап обучения"
        });
        return;
      }

      console.log("Этап обучения успешно сохранен");
      toast({
        title: "Успешно",
        description: "Этап обучения сохранен"
      });
      
    } catch (error) {
      console.error("Неожиданная ошибка при сохранении этапа обучения:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Произошла неожиданная ошибка"
      });
    }
  };

  return (
    <div>
      <h1>Форма Няни</h1>
      <div>
        <label>Этап обучения:</label>
        <select
          value={trainingStage || ""}
          onChange={(e) => handleTrainingStageChange(e.target.value as TrainingStage)}
        >
          <option value="">Выберите этап</option>
          <option value="stage1">Этап 1</option>
          <option value="stage2">Этап 2</option>
          <option value="stage3">Этап 3</option>
        </select>
      </div>
    </div>
  );
};

export default NannyForm;
