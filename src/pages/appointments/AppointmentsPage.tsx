import AppointmentsCalendar from "@/components/calendar/AppointmentsCalendar";

const AppointmentsPage = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Заявки</h1>
      <AppointmentsCalendar />
    </div>
  );
};

export default AppointmentsPage;