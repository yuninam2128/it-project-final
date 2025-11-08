/**
 * 젤리 보상 계산 유틸
 * 투두/세부프로젝트/메인프로젝트 완료 시 획득 가능한 젤리를 계산
 */

/**
 * 하트 젤리 개수 반환
 * @param {string} level - 'todo' | 'subtask' | 'project'
 * @returns {number} 하트 젤리 개수
 */
export const getHeartJellyAmount = (level) => {
  switch (level) {
    case 'todo':
      console.log('[젤리보상] 하트젤리(투두): 100개');
      return 100;
    case 'subtask':
      console.log('[젤리보상] 하트젤리(세부프로젝트): 500개');
      return 500;
    case 'project':
      console.log('[젤리보상] 하트젤리(메인프로젝트): 1000개');
      return 1000;
    default:
      return 0;
  }
};

/**
 * 별 젤리 획득 횟수 확인 (5회, 10회, 15회... 마다)
 * @param {number} completionCount - 현재까지의 완료 횟수 (완료 후)
 * @param {string} level - 'todo' | 'subtask' | 'project'
 * @returns {object} { isMilestone: boolean, amount: number }
 */
export const getStarJellyReward = (completionCount, level) => {
  // 5의 배수이고 0이 아닌지 확인 (5, 10, 15, ...)
  console.log(`[젤리보상] 별젤리 마일스톤 확인 - 현재 완료 횟수: ${completionCount}`);
  if (completionCount > 0 && completionCount % 5 === 0) {
    console.log(`[젤리보상] ✨ 마일스톤 달성! ${completionCount}회 완료 (${level})`);
    const starAmount = getHeartJellyAmount(level); // 별 젤리는 하트와 같은 개수
    return { isMilestone: true, amount: starAmount };
  }
  console.log(`[젤리보상] 별젤리 마일스톤 미달성 - ${completionCount}회는 5의 배수가 아님`);
  return { isMilestone: false, amount: 0 };
};

/**
 * 불꽃 젤리 획득 여부 확인 (데드라인보다 3일 이상 빨리 완료)
 * @param {Date} deadline - 마감일
 * @param {Date} completedAt - 완료 날짜
 * @param {string} level - 'todo' | 'subtask' | 'project'
 * @returns {object} { isEarlyCompletion: boolean, amount: number }
 */
export const getFireJellyReward = (deadline, completedAt, level) => {
  if (!deadline || !completedAt) {
    return { isEarlyCompletion: false, amount: 0 };
  }

  const deadlineTime = new Date(deadline).getTime();
  const completedTime = new Date(completedAt).getTime();
  const daysDifference = (deadlineTime - completedTime) / (1000 * 60 * 60 * 24);

  // 3일 이상 빨리 완료한 경우
  if (daysDifference >= 3) {
    // 불꽃 젤리는 하트 젤리의 절반
    const fireAmount = Math.floor(getHeartJellyAmount(level) / 2);
    return { isEarlyCompletion: true, amount: fireAmount };
  }

  return { isEarlyCompletion: false, amount: 0 };
};

/**
 * 투두 완료 시 젤리 보상 계산
 * @param {object} todo - 완료된 투두
 * @param {array} allTodos - 같은 세부프로젝트의 모든 투두
 * @param {object} subtask - 투두가 속한 세부프로젝트
 * @param {Date} today - 오늘 날짜 (완료 날짜)
 * @returns {array} rewards - [{ type: 'heart'|'star'|'fire', amount: number, message: string }]
 */
export const calculateTodoReward = (todo, allTodos, subtask, today = new Date()) => {
  const rewards = [];

  // 1. 하트 젤리 (투두 완료시 항상)
  rewards.push({
    type: 'heart',
    amount: getHeartJellyAmount('todo'),
    message: '노력의 결실! 하트젤리'
  });

  // 2. 별 젤리 (5회 완료마다)
  const completedCount = allTodos.filter(t => t.progress === 100).length;
  const starReward = getStarJellyReward(completedCount, 'todo');
  if (starReward.isMilestone) {
    rewards.push({
      type: 'star',
      amount: starReward.amount,
      message: `반짝이는 5회 달성! 별 젤리`
    });
  }

  // 3. 불꽃 젤리 (데드라인보다 3일 이상 빨리 완료)
  const fireReward = getFireJellyReward(subtask.deadline, today, 'todo');
  if (fireReward.isEarlyCompletion) {
    rewards.push({
      type: 'fire',
      amount: fireReward.amount,
      message: '불꽃같은 속도! 불꽃젤리'
    });
  }

  return rewards;
};

/**
 * 세부프로젝트의 모든 투두 완료 시 젤리 보상 계산
 * @param {object} subtask - 세부프로젝트
 * @param {array} allSubtasks - 같은 메인프로젝트의 모든 세부프로젝트
 * @param {object} project - 세부프로젝트가 속한 메인프로젝트
 * @param {Date} today - 오늘 날짜
 * @returns {array} rewards
 */
export const calculateSubtaskReward = (subtask, allSubtasks, project, today = new Date()) => {
  const rewards = [];

  // 1. 하트 젤리 (세부프로젝트 완료시 항상)
  rewards.push({
    type: 'heart',
    amount: getHeartJellyAmount('subtask'),
    message: '노력의 결실! 하트젤리'
  });

  // 2. 별 젤리 (5회 완료마다)
  const completedCount = allSubtasks.filter(s => isSubtaskComplete(s)).length;
  const starReward = getStarJellyReward(completedCount, 'subtask');
  if (starReward.isMilestone) {
    rewards.push({
      type: 'star',
      amount: starReward.amount,
      message: `반짝이는 5회 달성! 별 젤리`
    });
  }

  // 3. 불꽃 젤리 (데드라인보다 3일 이상 빨리 완료)
  const fireReward = getFireJellyReward(subtask.deadline, today, 'subtask');
  if (fireReward.isEarlyCompletion) {
    rewards.push({
      type: 'fire',
      amount: fireReward.amount,
      message: '불꽃같은 속도! 불꽃젤리'
    });
  }

  return rewards;
};

/**
 * 메인프로젝트의 모든 세부프로젝트 투두 완료 시 젤리 보상 계산
 * @param {object} project - 메인프로젝트
 * @param {array} allProjects - 모든 메인프로젝트
 * @param {Date} today - 오늘 날짜
 * @returns {array} rewards
 */
export const calculateProjectReward = (project, allProjects, today = new Date()) => {
  const rewards = [];

  // 1. 하트 젤리 (메인프로젝트 완료시 항상)
  rewards.push({
    type: 'heart',
    amount: getHeartJellyAmount('project'),
    message: '노력의 결실! 하트젤리'
  });

  // 2. 별 젤리 (5회 완료마다)
  const completedCount = allProjects.filter(p => isProjectComplete(p)).length;
  const starReward = getStarJellyReward(completedCount, 'project');
  if (starReward.isMilestone) {
    rewards.push({
      type: 'star',
      amount: starReward.amount,
      message: `반짝이는 5회 달성! 별 젤리`
    });
  }

  // 3. 불꽃 젤리 (데드라인보다 3일 이상 빨리 완료)
  const fireReward = getFireJellyReward(project.deadline, today, 'project');
  if (fireReward.isEarlyCompletion) {
    rewards.push({
      type: 'fire',
      amount: fireReward.amount,
      message: '불꽃같은 속도! 불꽃젤리'
    });
  }

  return rewards;
};

/**
 * 세부프로젝트가 완료되었는지 확인 (세부프로젝트의 progress가 100%)
 * @param {object} subtask - 세부프로젝트
 * @returns {boolean}
 */
export const isSubtaskComplete = (subtask) => {
  if (!subtask) return false;

  // 세부프로젝트 자체의 진행도가 100인지 확인
  return subtask.progress === 100;
};

/**
 * 메인프로젝트가 완료되었는지 확인 (메인프로젝트의 progress가 100%)
 * @param {object} project - 메인프로젝트
 * @returns {boolean}
 */
export const isProjectComplete = (project) => {
  if (!project) return false;

  // 메인프로젝트 자체의 진행도가 100인지 확인
  return project.progress === 100;
};
