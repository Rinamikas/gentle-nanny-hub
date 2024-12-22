export const localizeUserRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    'parent': 'Родитель',
    'nanny': 'Няня',
    'admin': 'Администратор',
    'owner': 'Владелец'
  };
  return roleMap[role] || role;
};

export const localizeParentStatus = (status: string | null): string => {
  const statusMap: Record<string, string> = {
    'default': 'Обычный',
    'star': 'Звезда',
    'diamond': 'Бриллиант'
  };
  return status ? statusMap[status] || status : 'Обычный';
};