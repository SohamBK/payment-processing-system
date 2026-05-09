const allowedTransitions = {
  PENDING: ['PROCESSING'],

  PROCESSING: ['SUCCESS', 'RETRYING'],

  RETRYING: ['PROCESSING', 'SUCCESS', 'FAILED'],

  SUCCESS: [],

  FAILED: [],
};

export const canTransition = (current, next) => {
  return allowedTransitions[current]?.includes(next);
};
