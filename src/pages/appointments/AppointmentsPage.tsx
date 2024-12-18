import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import AppointmentsCalendar from "@/components/calendar/AppointmentsCalendar";
import { AppointmentForm } from "@/components/calendar/AppointmentForm";

const AppointmentsPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  console.log("AppointmentsPage render, isFormOpen:", isFormOpen);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Заявки</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <CalendarPlus className="mr-2 h-4 w-4" />
          Новая заявка
        </Button>
      </div>

      <AppointmentsCalendar />

      <AppointmentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
};

export default AppointmentsPage;