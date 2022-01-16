import type { ModuleDefinition } from '../global';
import UserAnalytics from 'carbon-pictograms-svelte/lib/UserAnalytics.svelte';
import { Dashboard32, UserProfile32 } from 'carbon-icons-svelte';
import { Dashboard } from 'carbon-pictograms-svelte';

export const modules: Record<string, ModuleDefinition> = {
	auth: {
		module: 'auth',
		accessibleGroup: 'executive',
		pictogram: UserAnalytics,
		icon: UserProfile32,
		title: '사용자(학부생) 열람/관리',
		description: '사용자(학부생)의 정보를 보고 관리합니다.'
	},
	dashboard: {
		module: 'dashboard',
		accessibleGroup: 'everyone',
		pictogram: Dashboard,
		icon: Dashboard32,
		title: '대시보드',
		description: '전체 기능 목록을 봅니다.'
	}
};
