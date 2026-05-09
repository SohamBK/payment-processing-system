const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const simulateGateway = async () => {
  // Simulate random network delay
  await delay(Math.floor(Math.random() * 3000));

  const random = Math.random();

  // 60% success
  if (random < 0.6) {
    return {
      success: true,
      externalReference: `txn_${Date.now()}`,
    };
  }

  // 25% gateway failure
  if (random < 0.85) {
    return {
      success: false,
      errorMessage: 'Gateway payment failed',
      retryable: false,
    };
  }

  // 15% timeout/network issue
  throw new Error('Gateway timeout');
};
