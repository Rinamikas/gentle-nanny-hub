import { UseFormReturn } from "react-hook-form";
import { createContext, useContext, ReactNode } from "react";

interface FormContextType {
  formMethods: UseFormReturn<any> | null;
  setFormMethods: (methods: UseFormReturn<any> | null) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [formMethods, setFormMethods] = React.useState<UseFormReturn<any> | null>(null);

  return (
    <FormContext.Provider value={{ formMethods, setFormMethods }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
}