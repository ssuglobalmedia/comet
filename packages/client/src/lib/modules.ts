import type { ModuleDefinition, ModulePageDefinition } from '../global';

export const modules: Record<string, ModuleDefinition> = {
	auth: {
		module: 'auth',
		accessibleGroup: 'executive',
		title: '사용자(학부생) 열람/관리',
		description: '사용자(학부생)의 정보를 보고 관리합니다.'
	},
	rental: {
		module: 'rental',
		accessibleGroup: 'certificated',
		title: '물품 대여',
		description: '배터리, 우산, 노트북 거치대 등 다양한 물품을 대여합니다.'
	},
	calendar: {
		module: 'calendar',
		accessibleGroup: 'everyone',
		title: '일정 보기',
		description: '학부, 학사 일정을 확인합니다.'
	},
	accounting: {
		module: 'accounting',
		accessibleGroup: 'executive',
		title: '회계 관리',
		description: '예/결산안, 감사 자료 등 회계 관리를 수행합니다.'
	},
	dashboard: {
		module: 'dashboard',
		accessibleGroup: 'everyone',
		title: '대시보드',
		description: '전체 기능 목록을 봅니다.'
	}
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