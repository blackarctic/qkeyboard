const signals = require('./lib/signals');
const gitlab = require('./api/gitlab');

require('dotenv').config();

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
  try {
    // get statuses
    const statuses = await gitlab.getMergeRequestPipelineStatuses({
      state: 'opened',
      limit: NUM_OF_KEYS
    });
    // set key colors based on status
    statuses.map((status, i) => {
      let color = COLOR.RED;
      switch (status) {
        case PIPELINE_STATUS.RUNNING:
          color = COLOR.BLUE;
          break;
        case PIPELINE_STATUS.SUCCESS:
          color = COLOR.GREEN;
          break;
        case PIPELINE_STATUS.FAILED:
          color = COLOR.RED;
          break;
      }
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

const main = async () => {
  await Promise.all([
    lightGitlabPipelineStatusKeys()
  ]);
};

main();
