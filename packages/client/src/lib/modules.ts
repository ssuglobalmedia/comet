import type { ModuleDefinition, ModulePageDefinition } from '../global';

export const modules: Record<string, ModuleDefinition> = {
	auth: {
		module: 'auth',
		accessibleGroup: 'executive',
		title: '사용자(학부생) 열람/관리',
		description: '사용자(학부생)의 정보를 보고 관리합니다.'
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
