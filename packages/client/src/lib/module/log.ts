// eslint-disable-next-line import/extensions
import { modules } from '$lib/modules';

export const logFieldDisplay = {
  date: '시각',
  userName: '담당자 명',
  userId: '담당자 학번',
  module: '모듈',
  target: '대상',
  action: '작업',
  data: '데이터'
};

export function getModuleActionDisplay(
  module: string,
  action: string,
): { module: string; action: string } {
  return { module: modules[module]?.title, action: modules[module]?.actions?.[action] };
}
