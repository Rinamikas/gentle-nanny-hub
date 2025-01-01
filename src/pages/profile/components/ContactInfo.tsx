interface ContactInfoProps {
  email: string | null;
  phone: string | null;
}

const ContactInfo = ({ email, phone }: ContactInfoProps) => {
  return (
    <div className="space-y-8">
      <div className="grid gap-4">
        <h2 className="text-lg font-semibold">Контактная информация</h2>
        <div className="grid gap-2">
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Телефон:</strong> {phone}</p>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;