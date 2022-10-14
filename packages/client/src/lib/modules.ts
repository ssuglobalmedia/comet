import type { ModuleDefinition, ModulePageDefinition } from '../global';
import {
  CalendarEvent,
  Dashboard,
  FileBackup,
  Gear,
  SocialWork_01,
  UserAnalytics,
} from 'carbon-pictograms-svelte';

export const modules: Record<string, ModuleDefinition> = {
  auth: {
    module: 'auth',
    iconComponent: UserAnalytics,
    accessibleGroup: 'executive',
    title: '사용자(학부생) 열람/관리',
    description: '사용자(학부생)의 정보를 보고 관리합니다.',
    pages: {
      upload: {
        title: '파일으로부터 업로드',
        description: '.xlsx, .csv 등의 파일으로부터 데이터를 가져옵니다.',
        accessibleGroup: 'admin',
      },
      check: {
        title: '사용자 목록 확인',
        description: '.xlsx, .csv 등의 파일의 데이터가 정확한지 확인합니다.',
        accessibleGroup: 'admin',
      },
    },
  },
  rental: {
    module: 'rental',
    iconComponent: SocialWork_01,
    accessibleGroup: 'certificated',
    title: '물품 대여',
    description: '배터리, 우산, 노트북 거치대 등 다양한 물품을 대여합니다.',
  },
  calendar: {
    module: 'calendar',
    iconComponent: CalendarEvent,
    accessibleGroup: 'everyone',
    title: '일정 보기',
    description: '학부, 학사 일정을 확인합니다.',
  },
  log: {
    module: 'log',
    iconComponent: FileBackup,
    accessibleGroup: 'executive',
    title: '관리 기록',
    description: 'COMET으로 관리한 기록을 열람합니다.',
  },
  config: {
    module: 'config',
    iconComponent: Gear,
    accessibleGroup: 'admin',
    title: '서비스 관리',
    description: 'COMET 서비스를 설정합니다.',
  },
  dashboard: {
    module: 'dashboard',
    iconComponent: Dashboard,
    accessibleGroup: 'everyone',
    title: '대시보드',
    description: '전체 기능 목록을 봅니다.',
  },
};

export function findPageByPath(path: string): ModulePageDefinition | undefined {
  const parsedPath = path.split('/');
  let curPages: Record<string, ModulePageDefinition> = modules;
  let curDef: ModulePageDefinition = undefined;
  parsedPath.forEach((name) => {
    if (!curPages || !curPages[name]) return undefined;
    curDef = curPages[name];
    curPages = curPages[name].pages;
  });
  return curDef;
}
