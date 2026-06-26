import dayjs from 'dayjs';

const ACTIVITIES_TABLE = 'activities';
const ACTIVITY_COMPLETION_TABLE = 'activity_completions';

export type ActivityCompletion = {
	id?: number;
	activity_id: string;
	duration: number;
	date: number;
};

export type Activity = {
  id?: string;
  label: string;
  category?: number;
}

export function getTodaysActivities(): ActivityCompletion[] {
	const list = getActivityCompletions();
	if (!list.length) return [];
	return list.filter(({ date }) => dayjs().isSame(date, 'day'));
}

/* Activities */
export function getActivities() {
	return JSON.parse(localStorage.getItem(ACTIVITIES_TABLE) ?? "") ?? [];
}

export function createActivity(activity: Activity) {
	const table = getActivities();
	if (!activity.id) activity.id = crypto.randomUUID();
	table.push(activity);
	localStorage.setItem(ACTIVITIES_TABLE, JSON.stringify(table));
}

/* Activity Completions */
export function getActivityCompletions(): ActivityCompletion[] {
	return JSON.parse(localStorage.getItem(ACTIVITY_COMPLETION_TABLE) ?? "") ?? [];
}

export function saveCompletion(activityCompletion: ActivityCompletion) {
	const table = getActivityCompletions();
	table.push(activityCompletion);
	localStorage.setItem(ACTIVITY_COMPLETION_TABLE, JSON.stringify(table));
}
