export const constants = {
  jwt: {
    // move to process env
    secret: 'mySuperSecretKey:1q2w3e4r5t6y',
    expirationTime: {
      refreshTokenExpirationTime: '7d',
      accessTokenExpirationTime: '1d',
    },
  },
};
