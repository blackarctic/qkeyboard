const signals = require('./lib/signals');
const gitlab = require('./api/gitlab');

require('dotenv').config();

const INTERVAL = 10000; // 10 seconds

const PIPELINE_STATUS = {
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed'
}

const COLOR = {
  BLUE: '#008CFF',
  GREEN: '#00F800',
  RED: '#FF2100',
  YELLOW: '#FFFA00'
};

const lightGitlabPipelineStatusKeys = async () => {

  const NUM_OF_KEYS = 4;

  const getColor = (status) => {
    switch (status) {
      case PIPELINE_STATUS.RUNNING:
        return COLOR.BLUE;
      case PIPELINE_STATUS.SUCCESS:
        return COLOR.GREEN;
      case PIPELINE_STATUS.FAILED:
        return COLOR.RED;
    }
    return COLOR.RED;
  };

  try {
    // get statuses
    const statuses = (await gitlab.getMergeRequestPipelineStatuses({
      state: 'opened'
    })).slice(0, NUM_OF_KEYS);
    // set key colors based on status
    statuses.map((status, i) => {
      const color = getColor(status);
      signals.sendColorSignal(`KEY_F${i+1}`, color);
    });
    // reset any keys we didn't have a status for
    (new Array(NUM_OF_KEYS)).fill(0).map((_, i) => {
      const keyHasNoStatus = i > statuses.length - 1;
      if (keyHasNoStatus) {
        signals.clearSignal(`KEY_F${i+1}`);
      }
    });
  } catch (e) {
    // set all keys to yellow in case of failure
    (new Array(NUM_OF_KEYS)).fill(0).map((_, i) =>
      signals.sendColorSignal(`KEY_F${i+1}`, COLOR.YELLOW)
    );
    throw e;
  }
}

const lightGitlabTodoKeys = async () => {

  const NUM_OF_KEYS = 10;

  const getColor = (todo) => {
    if (todo.target.state === 'merged') {
      return COLOR.BLUE;
    }
    if (todo.action_name === 'approval_required') {
      return COLOR.GREEN
    }
    return COLOR.RED;
  };

  try {
    // get todos
    const todos = (await gitlab.getTodos())
      .filter(x => x.target_type === 'MergeRequest')
      .filter(x => !x.target.work_in_progress)
      .slice(0, NUM_OF_KEYS);
    // set key color based on number of todos
    todos.map((todo, i) => {
      const color = getColor(todo);
      signals.sendColorSignal(`KEY_${i+1 % 10}`, color);
    });
    // reset any keys we didn't have a todo for
    (new Array(NUM_OF_KEYS)).fill(0).map((_, i) => {
      const keyHasNoTodo = i > todos.length - 1;
      if (keyHasNoTodo) {
        signals.clearSignal(`KEY_${i+1 % 10}`);
      }
    });
  } catch (e) {
    // set all keys to yellow in case of failure
    (new Array(NUM_OF_KEYS)).fill(0).map((_, i) =>
      signals.sendColorSignal(`KEY_${i+1 % 10}`, COLOR.YELLOW)
    );
    throw e;
  }
}

const main = async () => {
  await Promise.all([
    lightGitlabPipelineStatusKeys(),
    lightGitlabTodoKeys()
  ]);
};

setInterval(main, INTERVAL);
