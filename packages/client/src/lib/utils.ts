export const getCookieValue = (name: string) =>
  document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || '';

export const getCurrentSemester = () => (new Date().getMonth() < 9 ? 1 : 2);
export const getCurrentFullSemester = () => `${new Date().getFullYear()}-${getCurrentSemester()}`;
